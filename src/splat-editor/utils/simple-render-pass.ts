import { GraphicsDevice, Shader, UniformBufferFormat } from 'playcanvas';

export class ShaderQuad {
    shader: Shader;
    vertexBuffer: WebGLBuffer;

    constructor(device: GraphicsDevice, vertexSrc: string, fragmentSrc: string, name: string) {
        this.shader = new Shader(device, {
            name,
            vertexCode: vertexSrc,
            fragmentCode: fragmentSrc,
            attributes: {
                vertex_position: 0
            }
        });

        // Full screen quad vertices
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        this.vertexBuffer = device.createVertexBuffer({
            numVertices: 4,
            format: [
                { semantic: 'POSITION', components: 2, type: 'FLOAT32' }
            ],
            data: vertices,
            usage: 'STATIC'
        });
    }

    destroy() {
        this.shader.destroy();
        this.vertexBuffer.destroy();
    }
}

export class SimpleRenderPass {
    device: GraphicsDevice;
    quad: ShaderQuad;
    vars: () => Record<string, any>;
    enabled = true;

    constructor(device: GraphicsDevice, quad: ShaderQuad, options: { vars: () => Record<string, any> }) {
        this.device = device;
        this.quad = quad;
        this.vars = options.vars;
    }

    init(target: any) {
        // Initialize render pass
    }

    destroy() {
        this.quad?.destroy();
    }
}