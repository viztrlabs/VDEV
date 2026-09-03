// Projected splat vertex shader
export const projectedSplatVertex = `#version 300 es
precision highp float;

in vec2 vertex_position;
out vec2 vUv;

void main() {
    vUv = vertex_position * 0.5 + 0.5;
    gl_Position = vec4(vertex_position, 0.0, 1.0);
}
`;