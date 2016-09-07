const shell = require('shelljs')
const path = require('path')

runCmd = (cmd) => {
  return shell.exec(cmd, {silent:true})
}

listDirs = (dir) => {
  shell.cd(dir)
  return runCmd("ls").toString().split("\n")
}

const getWorkingDir = (repo) => {
  if (!(process.env.CBI_ROOT)) {
    throw new Error("Need to set CBI_ROOT environment var")
  }
  r = process.env.CBI_ROOT
  if (!repo in listDirs(r)) {
    throw new Error(`Couldn't find working dir for ${repo}`)
  }
  workingDir = path.join(r,repo)
  shell.cd(workingDir)
  return workingDir
}

const checkRepoReady = (repo) => {
  currBranch = runCmd('git branch | grep "* "').toString().split(/\s/)[1]
  console.log([currBranch])

  status = runCmd('git diff-index --quiet HEAD --')
  if (status.code !== 0) {
    throw new Error(`Stopping due to uncommitted changes in ${repo}`)
  }


}

const repoSetup = (repo, branch) => {
  const wd = getWorkingDir(repo)
  const origBranch = checkRepoReady(repo)
  runCmd('git fetch --all')
  runCmd(`git checkout ${branch}`)
  runCmd('git pull')
  return wd
}

module.exports = repoSetup
checkRepoReady()
