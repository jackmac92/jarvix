#!/usr/bin/env node
import screenshotGrabber from '../utils/download/screenShot.js';
import winSetup from '../utils/newTermWindowSetup.js';
import utils from '../utils';
import inquirer from 'inquirer';
import getAWSConfig from '../utils/awsConfig';
import getServerIps from '../utils/getServerIps';

const setupInfo = winSetup(process.argv[2]);
const pic = setupInfo[0];
const tmpDir = setupInfo[1];

const envConvert = {
  develop: 'dev',
  release: 'staging',
  master: 'prod'
};

const env = envConvert[pic.env];
const picPath = pic.screenshot;

const msg = 'Continue to download and open';
utils.waitForContinue(msg).then(answer =>
  screenshotGrabber(env, [picPath], tmpDir);
).then(() => {
  const exitMsg = 'Continue to delete screenshot and exit';
  utils.finish(exitMsg);
});
