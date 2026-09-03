// Blit shader for final frame presentation
export const vertexShader = `#version 300 es
precision highp float;

in vec2 vertex_position;
out vec2 vUv;

void main() {
    vUv = vertex_position * 0.5 + 0.5;
    gl_Position = vec4(vertex_position, 0.0, 1.0);
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D srcTexture;
uniform vec2 blitScale;
uniform int quadResolve; // 0=none, 1=old, 2=new

void main() {
    vec2 uv = vUv * blitScale;
    vec4 color = texture(srcTexture, uv);
    
    // Simple blit - quadResolve handling would be done in a more complex version
    fragColor = color;
}
`;