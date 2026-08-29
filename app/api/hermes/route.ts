import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface HermesRequest {
  userId?: string;
  message?: string;
}

const SYSTEM_PROMPT = `You are Hermes, the AI assistant for VizTR — a studio that produces real-time GPU-cloud architectural visualization, Unreal Engine 5 pixel streaming, WebXR/WebAR experiences, 360° virtual tours, and AI-generated marketing for architecture firms. Be concise, professional, and helpful. If asked about technical topics, reference VizTR's stack: Pixel Streaming (UE5 + Cirrus), PlayCanvas WebXR, Marzipano 360 tours, Cloudflare Tunnel delivery.`;

// POST handler for Hermes chat messages
export async function POST(req: NextRequest) {
  try {
    const body: HermesRequest = await req.json();
    const { userId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Real LLM path when a key is configured.
    // Try the latest recommended model first, fall back to alternatives.
    if (apiKey) {
      const MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
      try {
        const ai = new GoogleGenAI({ apiKey });
        let text = '';
        let usedModel = '';
        for (const model of MODELS) {
          try {
            const result = await ai.models.generateContent({
              model,
              contents: message,
              config: { systemInstruction: SYSTEM_PROMPT },
            });
            text = result.text || '';
            if (text) {
              usedModel = model;
              break;
            }
          } catch (modelErr) {
            // try next model in the chain
            console.warn(`[hermes] model ${model} failed:`, (modelErr as Error).message);
          }
        }
        if (text) {
          return NextResponse.json({
            type: 'chat_message',
            role: 'assistant',
            content: text,
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString(),
            model: usedModel,
          });
        }
      } catch (llmErr) {
        console.error('[hermes] LLM call failed, falling back to echo:', llmErr);
        // fall through to echo fallback
      }
    }

    // Fallback (no key configured or LLM error): echo simulation
    const response = {
      type: 'chat_message',
      role: 'assistant',
      content: `Hermes: You said "${message}". This is a response from the Hermes AI assistant.`,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      simulated: !apiKey,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET handler for connection health check
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return NextResponse.json({
    status: 'connected',
    message: 'Hermes API is running',
    mode: apiKey ? 'live-llm' : 'simulation',
  });
}
