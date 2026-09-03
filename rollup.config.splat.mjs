import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import image from '@rollup/plugin-image';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: 'src/splat-editor/main.ts',
  output: {
    file: 'public/splat-editor/bundle.js',
    format: 'esm',
    sourcemap: true,
    name: 'SuperSplatEditor'
  },
  plugins: [
    alias({
      entries: [
        { find: 'playcanvas', replacement: path.resolve(__dirname, 'node_modules/playcanvas') }
      ]
    }),
    resolve({ browser: true, preferBuiltins: false }),
    json(),
    image(),
    scss({
      output: 'public/splat-editor/bundle.css',
      sass: require('sass')
    }),
    typescript({
      tsconfig: './tsconfig.splat.json',
      sourceMap: true
    }),
    terser({ compress: { ecma: 2020 }, format: { comments: false } })
  ],
  external: []
};