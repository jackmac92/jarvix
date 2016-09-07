const shell = require("shelljs")

const runCmd = (cmd) => {
  return shell.exec(cmd, {silent:true})
}

const getEditor = () => {
  options ['$EDITOR', 'subl']
  options.forEach(opt => {
    result = runCmd(`which ${opt}`)
    if (result.code === 0) {
      return result.toString()
    }
  })
}

const openRepoInEditor = (dirs) => {
  if (typeof(dirs) === 'string') {
    dirs = [dirs]
  }
  app = getEditor()
  dirs.forEach( (dir, index) => {
    runCmd(`${app} ${dir}`)
  });
}

module.exports = openRepoInEditor
