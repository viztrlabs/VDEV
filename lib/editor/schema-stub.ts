// Minimal editor schema stub for production builds.
// Full schema lives in forks/editor/server/schema.js (excluded from Vercel deploy).
export function getEditorSchema() {
  return {
    version: 1,
    documents: {
      settings: {
        type: 'object',
        properties: {
          editor: {
            type: 'object',
            properties: {
              cameraClearColor: { type: 'array', default: [0.117, 0.117, 0.117, 1] },
              cameraNearClip: { type: 'number', default: 0.0001 },
              cameraFarClip: { type: 'number', default: 1000 },
            },
          },
        },
      },
    },
  };
}
