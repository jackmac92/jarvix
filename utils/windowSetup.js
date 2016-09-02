const shell = require("shelljs")

const openRepoInEditor = (dirs) => {
    if (typeof(dirs) === 'string') {
        dirs = [dirs]
    }
    dirs.forEach( (dir, index) => {
        shell.exec(`subl ${dir}`)
    });
}

module.exports = openRepoInEditor
