const gitUtils = require('./git.js')
const utils = require('./index.js')

const runCmd = utils.runCmd

const makeRevert = (repo, origBranch) => {
  return () => {
    console.log(`Restoring ${repo} to branch ${origBranch}`)
    gitUtils.getWorkingDir(repo)
    runCmd(`git checkout ${origBranch}`)
  }
}

const repoSetup = (repo, branch) => {
  gitUtils.fetchAll()
  console.log(`Checking out branch ${branch} on ${repo}`)
  gitUtils.checkoutBranch(branch)
  gitUtils.pull()
}

const main = (repo, branch) => {
  const wd = gitUtils.getWorkingDir(repo)
  gitUtils.checkRepoReady(repo)
  const origBranch = gitUtils.currentGitBranch()
  repoSetup(repo, branch)
  return {
    repo: repo,
    origBranch: origBranch
  }
}


module.exports = main
