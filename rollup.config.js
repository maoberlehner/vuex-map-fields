import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const runtimeVersion = require(`@babel/runtime/package.json`).version;

export default [
  // UMD builds
  {
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
    ],
    plugins: [
      babel(),
    ],
  },
  // ESM Builds
  {
    input: `./src/index.js`,
    output: [
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
      babel({
        runtimeHelpers: true,
        plugins: [
          [
            `@babel/plugin-transform-runtime`,
            {
              version: runtimeVersion,
              useESModules: process.env.NODE_ENV !== `test`,
            },
          ],
        ],
      }),
    ],
  },
];
