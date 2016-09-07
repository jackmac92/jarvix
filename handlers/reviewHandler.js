#!/usr/bin/env node

const gitHelper = require('../utils/setGitBranches.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const readline = require('readline-sync');
const shell = require('shelljs');

const setupInfo = winSetup(process.argv[2]);

const reviewEls = setupInfo[0];
const tmpDir = setupInfo[1];

const reviewSetup = (reviewEls) => {
  reversions = reviewEls.map( el => gitHelper(el[0], el[1]))
  return () => {
    reversions.forEach(x => x())
  }
}
console.log("Ready to setup review branches locally\n\n")

reviewEls.forEach(el => {
  repo = el[0]
  branch = el[1]
  console.log(`${repo} >>> ${branch}\n`)
})

readline.question("Enter to Start")

revert = reviewSetup(reviewEls)

readline.question("Press enter to revert changes")

revert()
