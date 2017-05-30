import shell from 'shelljs';
import path from 'path';
import { runCmd } from './';

const getInitials = () =>
  runCmd('git config user.name')
    .toString()
    .split(' ')
    .map(n => n.toLowerCase())
    .map(n => n[0]);

export default {
  setUpWorkTree: (branchName, tmpDir) =>
    runCmd(`git worktree add -b ${tmpDir} ${branchName}-${getInitials()}`),

  prepareRepo(repo) {
    return this.repoHasBeenCloned(repo) || this.cloneRepo(repo);
  },

  clearLocalChanges: () => runCmd('git stash save --keep-index'),

  fetchAll: () => runCmd('git fetch --all'),

  repoHasBeenCloned(repo) {
    return this.listDirs(process.env.CBI_ROOT).indexOf(repo) !== -1;
  },

  pull: () => runCmd('git pull'),
  currentGitBranch: () =>
    runCmd('git branch | grep "* "').toString().split(/\s/)[1],

  checkoutBranch: (branchName, newBranch) =>
    runCmd(`git checkout ${newBranch ? '-b' : ''} ${branchName}`),

  getCbiRoot() {
    if (!process.env.CBI_ROOT) {
      throw new Error('Need to set CBI_ROOT environment var');
    }
    return process.env.CBI_ROOT;
  },

  setupForLocalEdits(tmpDir) {
    const branch = this.currentGitBranch();
    const reviewerBranch = `${branch}__${getInitials()}`;
    this.setUpWorkTree(branch, tmpDir);
    return reviewerBranch;
  },
  listDirs(dir) {
    shell.cd(dir);
    return runCmd('ls').toString().split('\n');
  },
  makePatch: repo => {
    const wd = this.getWorkingDir(repo);
    const currentBranch = this.currentGitBranch();
    const origBranch = currentBranch.split('__')[0];
    const patchCmd = `git format-patch ${origBranch} --stdout > ~/Desktop/${currentBranch}.patch`;
    return promiseExec(patchCmd);
  },

  cloneRepo(repo) {
    shell.cd(this.getCbiRoot());
    runCmd(`git clone git@github.com:cbinsights/${repo}.git`);
    if (!this.repoHasBeenCloned(repo)) {
      throw new Error(`Couldn't find working dir for ${repo}`);
    }
    console.log(`Successfully cloned ${repo} repo`);
  },
  getWorkingDir(repo) {
    this.prepareRepo(repo);
    const workingDir = path.join(this.getCbiRoot(), repo);
    shell.cd(workingDir);
    return workingDir;
  }
};
