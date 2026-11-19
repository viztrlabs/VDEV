/**
 * Mock for @google/genai (ESM module not supported by Jest)
 * Provides a mock GoogleGenAI class for testing purposes.
 */

class GoogleGenAI {
  constructor(config) {
    this.apiKey = config?.apiKey;
    this.models = {
      generateContent: jest.fn().mockResolvedValue({
        text: '',
      }),
    };
  }
}

module.exports = {
  GoogleGenAI,
};
