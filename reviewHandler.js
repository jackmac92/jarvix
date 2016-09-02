#!/usr/bin/env node
const winSetup = require('./utils/newTermWindowSetup.js');
const reviewSetup = require('./reviewHelper');
const readline = require('readline-sync');
const shell = require('shelljs');

const setupInfo = winSetup(process.argv[2]);

const args = setupInfo[0];
const tmpDir = setupInfo[1];

readline.question("Enter to Start")

revert = reviewSetup(args)

readline.question("Press enter to revert changes")

revert()
