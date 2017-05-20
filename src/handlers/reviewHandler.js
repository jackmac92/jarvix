#! /usr/bin/env babel-node
import inquirer from 'inquirer';
import Listr from 'listr';
import { askWhich } from '../utils';
import gitUtils from '../utils/git';
import winSetup from './';

const setupInfo = winSetup(process.argv[2]);
const { args: allReviewEls } = setupInfo;

const gitHelper = (repo, branch) => {
  gitUtils.getWorkingDir(repo);
  gitUtils.fetchAll();
  console.log(`Checking out branch ${branch} on ${repo}`);
  gitUtils.checkoutBranch(branch);
  gitUtils.pull();
};

const reviewSetup = (reviewEls = []) =>
  new Promise(resolve => {
    const revertChanges = reviewEls.map(({ repo, branch }) => {
      gitHelper(repo, branch);
      return () => {
        gitUtils.getWorkingDir(repo);
        gitUtils.checkoutBranch(branch);
      };
    });
    resolve(() => {
      revertChanges.forEach(x => x());
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

const chooseReviewEls = (availableReviewBranches = []) => {
  const message = 'Select branches to review';
  const choices = availableReviewBranches.map(re => ({
    name: `${re.repo} ${re.branch}`,
    value: re
  }));
  return askWhich(choices, message);
};

const handlePatch = () =>
  chooseReviewEls(allReviewEls).then(patchBranches =>
    patchBranches.forEach(b =>
      gitUtils
        .makePatch(b.repo)
        .then(() => console.log(`Patch produced for ${b.branch}`))
    )
  );

const keepAsking = () =>
  new Promise(resolve => {
    inquirer.prompt(reviewPrompts).then(answers => {
      switch (answers.reviewAction) {
        case 'patch':
          handlePatch();
          break;
        case 'setupEdit':
          gitUtils.setupForLocalEdits();
          break;
        case 'clearChanges':
          allReviewEls.forEach(b => {
            gitUtils.getWorkingDir(b.repo);
            gitUtils.clearLocalChanges();
          });
          break;
        default:
          break;
      }
      answers.continue && keepAsking();
      resolve();
    });
  });

export const listrTask = {
  title: 'Setting up branches',
  task: ctx =>
    reviewSetup(ctx.reviewEls).then(revertFunc => {
      ctx.revert = revertFunc;
    })
};

chooseReviewEls(allReviewEls)
  .then(reviewEls => new Listr().add(listrTask).run({ reviewEls }))
  .then(({ revert }) => keepAsking().then(() => revert()));
