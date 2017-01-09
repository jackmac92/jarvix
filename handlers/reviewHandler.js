#!/usr/bin/env babel-node
import inquirer from 'inquirer';
import winSetup from '../utils/newTermWindowSetup';
import gitHelper from '../utils/git/setGitBranches';
import gitUtils from '../utils/git/';
import utils from '../utils';

const setupInfo = winSetup(process.argv[2]);
const tmpDir = setupInfo[1];
const reviewEls = setupInfo[0];

const reviewSetup = reviewEls => new Promise((resolve, reject) => {
  reversions = reviewEls.map((el) => {
    rel = gitHelper(el.repo, el.branch);
    return () => {
      const wd = gitUtils.getWorkingDir(rel.repo);
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
      {
        name: 'Create patch file',
        value: 'patch'
      },
      {
        name: 'Setup review branch to make edits',
        value: 'setupEdit'
      },
      {
        name: 'Pull any new changes to review branches',
        value: 'update'
      },
      {
        name: 'Clear local change to review branches',
        value: 'clearChanges'
      }
    ]
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to continue reviewing?',
    default: true
  }
];

const chooseReviewEls = (reviewEls) => {
  const message = 'Select branches to review';
  const choices = reviewEls.map(re => ({
    name: `${re.repo} ${re.branch}`,
    value: re
  }));
  return utils.askWhich(choices, message);
};

const handlePatch = () => {
  chooseReviewEls(reviewEls)
    .then((patchBranches) => {
      patchBranches.forEach((b) => {
        gitUtils.makePatch(b.repo)
          .then(res => console.log(`Patch produced for ${b.branch}`));
      });
    });
};

const keepAsking = () => new Promise((resolve) => {
  inquirer.prompt(reviewPrompts)
      .then((answers) => {
        switch (answers.reviewAction) {
          case 'patch':
            handlePatch();
            break;
          case 'setupEdit':
            gitUtils.setupForLocalEdits();
            break;
          case 'clearChanges':
            reviewEls.forEach((b) => {
              gitUtils.getWorkingDir(b.repo);
              gitUtils.clearLocalChanges();
            });
        }
        if (answers.continue) {
          keepAsking().then(() => resolve());
        } else {
          resolve();
        }
      });
});

chooseReviewEls(reviewEls)
   .then(rEls => reviewSetup(rEls))
   .then(revert =>
    keepAsking().then(fin => revert())
  );
