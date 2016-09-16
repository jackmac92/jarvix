#!/usr/bin/env node
const screenshotGrabber = require('../utils/downloadScreenShot.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const utils = require('../utils')
const inquirer = require('inquirer')
const getAWSConfig = require('../utils/getAwsConfig')
const getServerIps = require('../utils/getServerIps')


setupInfo = winSetup(process.argv[2]);

const pic = setupInfo[0];
const tmpDir = setupInfo[1];

const envConvert = {
  "develop": "dev",
  "release": "staging",
  "master": "prod"
}

const env = envConvert[pic.env];
const picPath = pic.screenshot;

msg = 'Continue to download and open'
utils.waitForContinue(msg).then(answer => {
  return getAWSConfig()
}).then(cfg => {
  return getServerIps(env, cfg)
}).then(ips => {
  return screenshotGrabber(ips, picPath, tmpDir);
}).then(fin => {
  msg = 'Continue to delete screenshot and exit'
  return utils.waitForContinue(msg)
}).then(answer => {
  utils.cleanUpTmpDir(tmpDir)
})
