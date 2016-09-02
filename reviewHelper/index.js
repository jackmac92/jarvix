const gitHelper = require('./setGitBranches.js')
const sublimeHelper = require('./sublimeHelper.js')
const windowSetup = require('./windowSetup.js')

const helper = (reviewEls) => {
    dirs = []
    reviewEls.forEach( (el) => {
        repo = el[0]
        branch = el[1]
        workingDir = gitHelper(repo, branch)
        dirs.push(workingDir)
    })
    const revertSublime = sublimeHelper("test")
    windowSetup(dirs)
    return () => {
      revertSublime()
    }
}

module.exports = helper
