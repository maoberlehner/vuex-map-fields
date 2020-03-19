import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: `./src/index.js`,
  output: [
    {
      file: `./dist/index.js`,
      format: `umd`,
      name: `vuex-map-fields`,
    },
    {
      file: `./dist/index.min.js`,
      format: `umd`,
      name: `vuex-map-fields`,
      plugins: [terser()],
    },
    {
      file: `./dist/index.esm.js`,
      format: `es`,
    },
    {
      file: `./dist/index.esm.min.js`,
      format: `es`,
      plugins: [terser()],
    },
  ],
  plugins: [
    babel(),
  ],
};
