import babelrc from 'babelrc-rollup';
import babel from 'rollup-plugin-babel';

export default {
  dest: 'bundle.js',
  format: 'cjs',
  entry: 'src/index.js',
  external: ['shelljs', 'is-docker', 'ws', 'express', 'path', 'cmdToNewTab'],
  plugins: [
    babel(
      babelrc({
        addModuleOptions: false,
        findRollupPresets: true,
        addExternalHelpersPlugin: false
      })
    )
  ]
};
