import { runCmd } from './index.js';

const getEditor = () => {
  const options = ['$EDITOR', 'subl'];
  let i = 0;
  while (i < options.length) {
    const opt = options[i];
    const result = runCmd(`which ${opt}`);
    if (result.code === 0) {
      return result.toString();
    }
    i += 1;
  }
};

const openRepoInEditor = (dirs) => {
  if (typeof dirs === 'string') {
    dirs = [dirs];
  }
  const app = getEditor();
  dirs.forEach((dir) => {
    runCmd(`${app} ${dir}`);
  });
};

export default openRepoInEditor;
