import shell from 'shelljs';
import path from 'path';

const runCmd = (cmd) => shell.exec(cmd, {silent:true})

const getInitials = () =>
  runCmd("git config user.name")
    .toString().split(" ")
    .map(n => n[0].toLowerCase());

export default {
  clearLocalChanges: () => runCmd("git stash save --keep-index"),
  fetchAll: () => runCmd('git fetch --all'),
  repoHasBeenCloned: (repo) => this.listDirs(process.env.CBI_ROOT).indexOf(repo) != -1,
  pull: () => runCmd('git pull'),
  currentGitBranch: () => runCmd('git branch | grep "* "').toString().split(/\s/)[1],
  checkoutBranch: (branchName, newBranch) => runCmd(`git checkout ${(newBranch) ? "-b" : ""} ${branchName}`),
  checkRepoReady(repo) {
    const status = runCmd('git diff-index --quiet HEAD --');
    if (status.code !== 0) {
      throw new Error(`Stopping due to uncommitted changes in ${repo}`);
    }
  },
  getCbiRoot() {
    if (process.env.CBI_ROOT) {
      return process.env.CBI_ROOT;
    } else {
      throw new Error("Need to set CBI_ROOT environment var");
    }
  },
  setupForLocalEdits() {
    const branch = this.currentGitBranch();
    const reviewerBranch = `${branch}__${getInitials()}`;
    this.checkoutBranch(reviewerBranch, newBranch=true);
    return reviewerBranch;
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
  cloneRepo(cbi_root, repo) {
    shell.cd(cbi_root)
    runCmd(`git clone git@github.com:cbinsights/${repo}.git`)
    if (!(this.repoHasBeenCloned(repo))) {
      throw new Error(`Couldn't find working dir for ${repo}`)
    }
    console.log(`Successfully cloned ${repo} repo`);
  },
  getWorkingDir(repo) {
    r = this.getCbiRoot()
    if (!(this.repoHasBeenCloned(repo))) {
      console.log('Local repo not found, attempting to clone')
      this.cloneRepo(r, repo)
    }
    workingDir = path.join(r,repo)
    shell.cd(workingDir)
    return workingDir
  }
}


