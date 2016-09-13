const utils = require("./index.js")

const runCmd = utils.runCmd

const getEditor = () => {
  options = ['$EDITOR', 'subl']
  var i = 0;
  while (i < options.length) {
    opt = options[i]
    result = runCmd(`which ${opt}`)
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

module.exports = openRepoInEditor
