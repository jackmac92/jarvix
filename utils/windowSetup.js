import { runCmd } from './index.js';

const getEditor = () => {
  options = ['$EDITOR', 'subl']
  let i = 0;
  while (i < options.length) {
    const opt = options[i];
    const result = runCmd(`which ${opt}`)
    if (result.code === 0) {
      return result.toString()
    }
    i++
  }
}

const openRepoInEditor = (dirs) => {
  if (typeof(dirs) === 'string') {
    dirs = [dirs]
  }
  app = getEditor()
  dirs.forEach( (dir, index) => {
    result = runCmd(`${app} ${dir}`)
  });
}

export default openRepoInEditor;
