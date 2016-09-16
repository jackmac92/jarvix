#!/usr/bin/env node
const screenshotGrabber = require('../utils/downloadScreenShot.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const utils = require('../utils')
const inquirer = require('inquirer')
const getAWSConfig = require('../utils/getAwsConfig')
const getServerIps = require('../utils/getServerIps')


const setupInfo = winSetup(process.argv[2]);

const pic = setupInfo[0];
const tmpDir = setupInfo[1];

const envConvert = {
  "develop": "dev",
  "release": "staging",
  "master": "prod"
}

const env = envConvert[pic.env];
const picPath = pic.screenshot;

const msg = 'Continue to download and open'
utils.waitForContinue(msg).then(answer => {
  return screenshotGrabber(env, [picPath], tmpDir);
}).then(() => {
  const exitMsg = 'Continue to delete screenshot and exit'
  utils.finish(exitMsg)
})
