#!/usr/bin/env node
const readline = require('readline-sync');
const shell = require('shelljs');
const screenshotGrabber = require('../utils/downloadScreenShot.js');
const winSetup = require('../utils/newTermWindowSetup.js');


setupInfo = winSetup(process.argv[2]);

const pic = setupInfo[0];
const tmpDir = setupInfo[1];

const branchConvert = {
  "develop": "dev",
  "release": "staging",
  "master": "prod"
}

const branch = branchConvert[pic.branch];
const picPath = pic.screenshot;

readline.question(`Enter to download ${picPath}`);

s = screenshotGrabber(branch, picPath, tmpDir);

s.then((res) => {
  readline.question("Enter to close");
  shell.exec(`rm -rf ${tmpDir}`);
}).catch( (reason) => {
  console.log("Something went wrong")
  console.log(reason);
})
