const shell = require('shelljs')
const path = require('path')

const runCmd = (cmd) => {
  return shell.exec(cmd, {silent:true})
}

const getInitials = () => (
  runCmd("git config user.name").toString().split(" ").map(n => n[0].toLowerCase())
)

module.exports = {

  checkRepoReady(repo) {

    status = runCmd('git diff-index --quiet HEAD --')
    if (status.code !== 0) {
      throw new Error(`Stopping due to uncommitted changes in ${repo}`)
    }
  },

  currentGitBranch() {
    return runCmd('git branch | grep "* "').toString().split(/\s/)[1]
  },

  checkoutBranch(branchName, newBranch) {
    return runCmd(`git checkout ${(newBranch) ? "-b" : ""} ${branchName}`)
  },

  setupForLocalEdits() {
    const branch = this.currentGitBranch()
    const reviewerBranch = `${branch}__${getInitials()}`
    this.checkoutBranch(reviewerBranch, newBranch=true)
    // runCmd(`git push -u origin ${reviewerBranch}`)
    return reviewerBranch
  },

  listDirs(dir) {
    shell.cd(dir)
    return runCmd("ls").toString().split("\n")
  },

  makePatch(repo) {
    return new Promise((resolve, reject) => {
      const wd = this.getWorkingDir(repo)
      const currentBranch = this.currentGitBranch()
      const origBranch = currentBranch.split("__")[0]
      const patchCmd = `git format-patch ${origBranch} --stdout > ~/Desktop/${currentBranch}.patch`
      result = runCmd(patchCmd)
      if (result.code === 0) {
        resolve()
      } else {
        reject()
      }
    })
  },

  clearLocalChanges() {
    return runCmd("git stash save --keep-index")
  },

  fetchAll() {
    return runCmd('git fetch --all')
  },

  getReviewersBranches() {

  },

  pull() {
    return runCmd('git pull')
  },

  getWorkingDir(repo) {
    if (!(process.env.CBI_ROOT)) {
      throw new Error("Need to set CBI_ROOT environment var")
    }
    r = process.env.CBI_ROOT
    if (!repo in this.listDirs(r)) {
      throw new Error(`Couldn't find working dir for ${repo}`)
    }
    workingDir = path.join(r,repo)
    shell.cd(workingDir)
    return workingDir
  }

}
