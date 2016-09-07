#!/usr/bin/env node

const gitHelper = require('./utils/setGitBranches.js')
const winSetup = require('./utils/newTermWindowSetup.js');
const readline = require('readline-sync');
const shell = require('shelljs');

const setupInfo = winSetup(process.argv[2]);

const args = setupInfo[0];
const tmpDir = setupInfo[1];

readline.question("Enter to Start")

revert = helper(args)

readline.question("Press enter to revert changes")

revert()

const helper = (reviewEls) => {
    reversions = reviewEls.map( el => {
        repo = el[0]
        branch = el[1]
        return gitHelper(repo, branch)
    })
    return () => {
        reversions.forEach(x => x())
    }
}

module.exports = helper
