#! /usr/bin/env babel-node
import inquirer from 'inquirer';
import winSetup from '../utils/newTermWindowSetup';
import gitHelper from '../utils/git/setGitBranches';
import gitUtils from '../utils/git/';
import { askWhich } from '../utils';

const setupInfo = winSetup(process.argv[2]);
const allReviewEls = setupInfo[0];

const reviewSetup = reviewEls =>
  new Promise((resolve) => {
    const reversions = reviewEls.map(({ repo, branch }) => {
      const rel = gitHelper(repo, branch);
      return () => {
        gitUtils.getWorkingDir(rel.repo);
        gitUtils.checkoutBranch(rel.origBranch);
      };
    });
    resolve(() => {
      reversions.forEach(x => x());
    });
  });

const reviewPrompts = [
  {
    type: 'list',
    name: 'reviewAction',
    message: 'What would you like to do with this review?',
    default: { value: 'null' },
    choices: [
      { name: 'Create patch file', value: 'patch' },
      { name: 'Setup review branch to make edits', value: 'setupEdit' },
      { name: 'Pull any new changes to review branches', value: 'update' },
      { name: 'Clear local change to review branches', value: 'clearChanges' }
    ]
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to continue reviewing?',
    default: true
  }
];

const chooseReviewEls = (availableReviewBranches) => {
  const message = 'Select branches to review';
  const choices = availableReviewBranches.map(
    re => ({ name: `${re.repo} ${re.branch}`, value: re })
  );
  return askWhich(choices, message);
};

const handlePatch = () => {
  chooseReviewEls(allReviewEls).then((patchBranches) => {
    patchBranches.forEach((b) => {
      gitUtils
        .makePatch(b.repo)
        .then(() => console.log(`Patch produced for ${b.branch}`));
    });
  });
};

const keepAsking = () => new Promise((resolve) => {
  inquirer.prompt(reviewPrompts).then((answers) => {
    switch (answers.reviewAction) {
      case 'patch':
        handlePatch();
        break;
      case 'setupEdit':
        gitUtils.setupForLocalEdits();
        break;
      case 'clearChanges':
        allReviewEls.forEach((b) => {
          gitUtils.getWorkingDir(b.repo);
          gitUtils.clearLocalChanges();
        });
        break;
      default:
        break;
    }
    if (answers.continue) {
      keepAsking().then(() => resolve());
    } else {
      resolve();
    }
  });
});

chooseReviewEls(allReviewEls)
  .then(rEls => reviewSetup(rEls))
  .then(revert => keepAsking().then(() => revert()));

