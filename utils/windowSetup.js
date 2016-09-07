const shell = require("shelljs")

const runCmd = (cmd) => {
  return shell.exec(cmd, {silent:true})
}

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

openRepoInEditor("/Users/jmccown/cbinsights/admin/")
