import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
  plugins: [
    babel(),
    resolve(),
  ],
};
