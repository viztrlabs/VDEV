// Pick shader
export const pickShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D depthTexture;
uniform float nearClip;
uniform float farClip;

void main() {
    float depth = texture(depthTexture, vUv).r;
    fragColor = vec4(depth, depth, depth, 1.0);
}
`;