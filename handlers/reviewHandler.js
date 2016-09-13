#!/usr/bin/env node

const gitHelper = require('../utils/setGitBranches.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const shell = require('shelljs');
const inquirer = require('inquirer')
const gitUtils = require('../utils/git.js')
const setupInfo = winSetup(process.argv[2]);

const tmpDir = setupInfo[1];
const reviewEls = setupInfo[0];

const reviewSetup = (reviewEls) => {
  reversions = reviewEls.map( el => {
    rel = gitHelper(el.repo, el.branch)
    return () => {
      const wd = gitUtils.getWorkingDir(rel.repo)
      shell.cd(wd)
      gitUtils.checkoutBranch(rel.origBranch)
    }
  })
  return () => {
    reversions.forEach(x => x())
  }
}

const askWhich = (reviewEls) => {
  return new Promise((resolve) => {
    inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Select branches to review',
        name: 'branches',
        choices: reviewEls.map(re => {
          return {
            name:`${re.repo} ${re.branch}`,
            value: re
          }
        })
      }
    ]).then(selection => {
      resolve(selection.branches)
    })
  })
}

const reviewPrompts = [
  {
    type: 'list',
    name: 'reviewAction',
    message: 'What would you like to do with this review?',
    default: {value:"null"},
    choices: [
      {
        name: "Create patch file",
        value: "patch"
      },
      {
        name: "Setup review branch to make edits",
        value: "setupEdit"
      },
      {
        name: "Pull any new changes to review branches",
        value: "update"
      },
      {
        name: "Clear local change to review branches",
        value: "clearChanges"
      }
    ]
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to continue reviewing?',
    default: true
  }
]

const handlePatch = () => {
  askWhich(reviewEls)
    .then(patchBranches => {
      patchBranches.forEach(b => {
        gitUtils.makePatch(b.repo)
          .then(res => console.log(`Patch produced for ${b.branch}`))
      })
    })
}


const keepAsking = () => {
  return new Promise((resolve) => {
    inquirer.prompt(reviewPrompts)
      .then(answers => {
        switch (answers.reviewAction) {
          case 'patch':
            handlePatch()
            break;
          case 'setupEdit':
            gitUtils.setupForLocalEdits()
            break;
          case 'clearChanges':
            reviewEls.forEach(b => {
              gitUtils.getWorkingDir(b.repo)
              gitUtils.clearLocalChanges()
            })
          case 'update':
            reviewEls.forEach(b => {
              gitUtils.getWorkingDir(b.repo)
              gitUtils.pull()
            })
            break;
        }
        if (answers.continue) {
          keepAsking().then(() => resolve())
        } else {
          resolve()
        }
      })
  })
}

askWhich(reviewEls)
  .then(rEls =>
    reviewSetup(rEls)
  ).then(revert => {
    keepAsking().then(fin => {
      revert()
    })
  })
