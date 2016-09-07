const gitHelper = require('./setGitBranches.js')
const sublimeHelper = require('./sublimeHelper.js')

const helper = (reviewEls) => {
    reviewEls.forEach( el => {
        repo = el[0]
        branch = el[1]
        workingDir = gitHelper(repo, branch)
    })
    const revertSublime = sublimeHelper("test")
    return () => {
      revertSublime()
    }
}

module.exports = helper
