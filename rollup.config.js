import typescript from '@rollup/plugin-typescript';
import hashbang from 'rollup-plugin-hashbang';

export default {
  input: './src/app.ts',
  output: { file: './index.js', format: 'esm' },
  plugins: [hashbang(), typescript()],
};
