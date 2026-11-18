import { GoogleGenAI } from '@google/genai';
import { searchKnowledgeChunks, createEscalationTicket, type KnowledgeChunk, type EscalationTicket } from '@/lib/knowledge-server';
import { getEffectiveModels, getEffectiveSystemPrompt, getEffectiveEscalationPrompt, getEnabledProviders, getProviderConfig } from '@/lib/messaging/model-settings-store';

const SYSTEM_PROMPT = `You are Hermes, the AI assistant for VizTR — a studio that produces architectural visualization, WebXR/WebAR experiences, 360° virtual tours, and AI-generated marketing for architecture firms. Be concise, professional, and helpful. If asked about technical topics, reference VizTR's stack: PlayCanvas WebXR and Marzipano 360 tours.`;

const ESCALATION_PROMPT = `You are Hermes. The user asked a question you couldn't answer from the knowledge base.
Politely explain that you'll escalate to a human specialist who will respond shortly.
Ask if they'd like to provide any additional details (budget, timeline, project type) to help the specialist.
Keep it brief and professional.`;

export interface AgentReply {
  text: string;
  model?: string;
  simulated: boolean;
  escalated?: boolean;
  ticketId?: string;
  sources?: KnowledgeChunk[];
}

/** Shared AI entry point with RAG + Human Escalation */
export async function getViztrAgentReply(
  message: string,
  options: {
    userId?: string;
    provider?: 'telegram' | 'web';
    conversationId?: string;
    escalateIfNoAnswer?: boolean;
  } = {}
): Promise<AgentReply> {
  const { userId, provider = 'web', conversationId, escalateIfNoAnswer = true } = options;

  // 1. Search knowledge base
  const sources = searchKnowledgeChunks(message, 5);
  const hasContext = sources.length > 0;

  // 2. Build context-aware prompt
  const contextBlock = hasContext
    ? `\n\n--- RELEVANT WEBSITE CONTENT ---\n${sources.map((s, i) => `[${i + 1}] ${s.title} (${s.url}):\n${s.content.slice(0, 1500)}`).join('\n\n')}\n--- END CONTENT ---\n\nAnswer using ONLY the above content. If the answer is not in the content, say "I don't have that information in my knowledge base."`
    : '';

  const fullPrompt = getEffectiveSystemPrompt() + contextBlock;

  // 3. Try each enabled provider in priority order
  const enabledProviders = getEnabledProviders();

  // Try Gemini first
  const geminiConfig = getProviderConfig('gemini');
  if (geminiConfig?.enabled) {
    const geminiModels = geminiConfig.models || getEffectiveModels('gemini');
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      for (const model of geminiModels) {
        try {
          const result = await ai.models.generateContent({
            model,
            contents: message,
            config: { systemInstruction: fullPrompt, temperature: geminiConfig?.temperature ?? 0.7, maxOutputTokens: geminiConfig?.maxTokens ?? 2048, topP: geminiConfig?.topP ?? 0.9 },
          });
          const text = result.text || '';
          if (text && !text.toLowerCase().includes("don't have that information")) {
            return { text, model, simulated: false, sources };
          }
          // If we get a "don't know" response and should escalate
          if (text && escalateIfNoAnswer) break;
        } catch (error) {
          console.warn(`[viztr-agent] Gemini ${model} failed:`, (error as Error).message);
        }
      }
    }
  }

  // Try OpenRouter fallback
  const openrouterConfig = getProviderConfig('openrouter');
  if (openrouterConfig?.enabled) {
    const openrouterModels = openrouterConfig.models || getEffectiveModels('openrouter');
    // OpenRouter fetch-based provider (reusing existing tryOpenRouter logic concept)
    for (const model of openrouterModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'VizTR Hermes',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: fullPrompt },
              { role: 'user', content: message },
            ],
            temperature: openrouterConfig?.temperature,
            max_tokens: openrouterConfig?.maxTokens,
            top_p: openrouterConfig?.topP,
          }),
        });
        if (!response.ok) {
          console.warn(`[viztr-agent] OpenRouter ${model} failed: ${response.status}`);
          continue;
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text && !text.toLowerCase().includes("don't have that information")) {
          console.log(`[viztr-agent] OpenRouter ${model} succeeded`);
          return { text, model, simulated: false, sources };
        }
      } catch (error) {
        console.warn(`[viztr-agent] OpenRouter ${model} failed:`, (error as Error).message);
      }
    }
  }

  // Try OpenAI fallback
  const openaiConfig = getProviderConfig('openai');
  if (openaiConfig?.enabled) {
    // OpenAI fetch-based provider
    for (const model of openaiConfig.models || getEffectiveModels('openai')) {
      try {
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: fullPrompt },
              { role: 'user', content: message },
            ],
            temperature: openaiConfig?.temperature,
            max_tokens: openaiConfig?.maxTokens,
          }),
        });
        if (!response.ok) {
          console.warn(`[viztr-agent] OpenAI ${model} failed: ${response.status}`);
          continue;
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text && !text.toLowerCase().includes("don't have that information")) {
          console.log(`[viztr-agent] OpenAI ${model} succeeded`);
          return { text, model, simulated: false, sources };
        }
      } catch (error) {
        console.warn(`[viztr-agent] OpenAI ${model} failed:`, (error as Error).message);
      }
    }
  }

  // 4. No answer found — escalate if enabled
  if (escalateIfNoAnswer && (userId || conversationId)) {
    const ticket = createEscalationTicket({
      userId: userId || `anon_${conversationId}`,
      provider,
      conversationId: conversationId || `web_${Date.now()}`,
      question: message,
      context: hasContext ? sources.map((s) => s.title).join(', ') : 'No relevant content found',
      status: 'pending',
    });

    const escalationText = await generateEscalationReply(message, ticket.id);
    return { text: escalationText, simulated: true, escalated: true, ticketId: ticket.id, sources };
  }

  // 5. Fallback (no escalation or no IDs)
  return {
    text: 'Thanks for contacting VizTR. Our AI assistant couldn\'t find a specific answer. A member of our team will be happy to help with your architectural visualization request.',
    simulated: true,
  };
}

/** Called when a human operator resolves a ticket */
export async function resolveTicketAndReply(
  ticketId: string,
  resolution: string,
  sendReply: (conversationId: string, text: string) => Promise<void>
) {
  const { updateTicket } = await import('@/lib/knowledge-server');
  updateTicket(ticketId, { status: 'resolved', resolution });
  // The caller handles sending the reply via the appropriate provider
}

/** Generate escalation reply */
async function generateEscalationReply(userQuestion: string, ticketId: string): Promise<string> {
  // Try Gemini first
  const geminiConfig = getProviderConfig('gemini');
  if (geminiConfig?.enabled) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      for (const model of geminiConfig.models || getEffectiveModels('gemini')) {
        try {
          const result = await ai.models.generateContent({
            model,
            contents: `User asked: "${userQuestion}"`,
            config: { systemInstruction: ESCALATION_PROMPT + `\n\nReference ticket: ${ticketId}`, temperature: geminiConfig?.temperature ?? 0.7, maxOutputTokens: geminiConfig?.maxTokens ?? 2048, topP: geminiConfig?.topP ?? 0.9 },
          });
          if (result.text) return result.text;
        } catch {
          // continue
        }
      }
    }
  }

  // Try OpenRouter
  const openrouterConfig = getProviderConfig('openrouter');
  if (openrouterConfig?.enabled) {
    const openrouterModels = openrouterConfig.models || getEffectiveModels('openrouter');
    for (const model of openrouterModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'VizTR Hermes',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: ESCALATION_PROMPT + `\n\nReference ticket: ${ticketId}` },
              { role: 'user', content: userQuestion },
            ],
            temperature: openrouterConfig?.temperature,
            max_tokens: openrouterConfig?.maxTokens,
            top_p: openrouterConfig?.topP,
          }),
        });
        if (!response.ok) {
          console.warn(`[viztr-agent] OpenRouter escalation ${model} failed: ${response.status}`);
          continue;
        }
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
      } catch (error) {
        console.warn(`[viztr-agent] OpenRouter escalation ${model} failed:`, (error as Error).message);
      }
    }
  }

  // Try OpenAI
  const openaiConfig = getProviderConfig('openai');
  if (openaiConfig?.enabled) {
    for (const model of openaiConfig.models || getEffectiveModels('openai')) {
      try {
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: ESCALATION_PROMPT + `\n\nReference ticket: ${ticketId}` },
              { role: 'user', content: userQuestion },
            ],
            temperature: openaiConfig?.temperature,
            max_tokens: openaiConfig?.maxTokens,
          }),
        });
        if (!response.ok) {
          console.warn(`[viztr-agent] OpenAI escalation ${model} failed: ${response.status}`);
          continue;
        }
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
      } catch (error) {
        console.warn(`[viztr-agent] OpenAI escalation ${model} failed:`, (error as Error).message);
      }
    }
  }

  return `I've escalated your question to our specialist team (Ticket: ${ticketId}). They'll respond here shortly. You can share any project details (budget, timeline, scope) to help us prepare.`;
}