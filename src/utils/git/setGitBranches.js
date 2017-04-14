import gitUtils from './git.js';
import { runCmd } from './index.js';

const makeRevert = (repo, origBranch) => {
  return () => {
    console.log(`Restoring ${repo} to branch ${origBranch}`);
    gitUtils.getWorkingDir(repo);
    runCmd(`git checkout ${origBranch}`);
  };
};

const repoSetup = (repo, branch) => {
  gitUtils.fetchAll();
  console.log(`Checking out branch ${branch} on ${repo}`);
  gitUtils.checkoutBranch(branch);
  gitUtils.pull();
};

const main = (repo, branch) => {
  const wd = gitUtils.getWorkingDir(repo);
  gitUtils.checkRepoReady(repo);
  const origBranch = gitUtils.currentGitBranch();
  repoSetup(repo, branch);
  return {
    repo: repo,
    origBranch: origBranch
  };
};


export default main;
