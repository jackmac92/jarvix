#!/usr/bin/env node
const shell = require('shelljs');
const screenshotGrabber = require('../utils/downloadScreenShot.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const utils = require('../utils')
const inquirer = require('inquirer')


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

msg = 'Continue to download and open'
utils.waitForContinue(msg).then(answer => {
  return screenshotGrabber(branch, picPath, tmpDir);
}).then((res) => {
  msg = 'Continue to delete screenshot and exit'
  utils.waitForContinue(msg).then(answer => {
    utils.cleanUpTmpDir(tmpDir)
  })
}).catch( (reason) => {
  console.log("Something went wrong")
  console.log(reason);
})
