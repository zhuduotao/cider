import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    file: '../../dist/guardian.js',
    format: 'iife'
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }), // 使用TypeScript插件
    commonjs(),
    nodeResolve()
  ]
};