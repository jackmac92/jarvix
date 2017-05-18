import gitUtils from './git.js';
import { runCmd } from './index.js';

const makeRevert = (repo, origBranch) => () => {
  console.log(`Restoring ${repo} to branch ${origBranch}`);
  gitUtils.getWorkingDir(repo);
  runCmd(`git checkout ${origBranch}`);
};

const repoSetup = (repo, branch) => {
  gitUtils.fetchAll();
  console.log(`Checking out branch ${branch} on ${repo}`);
  gitUtils.checkoutBranch(branch);
  gitUtils.pull();
};

const main = (repo, branch) => {
  gitUtils.getWorkingDir(repo);
  repoSetup(repo, branch);
  return { repo, origBranch };
};

export default main;
