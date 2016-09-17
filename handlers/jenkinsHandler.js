#!/usr/bin/env node
const shell = require('shelljs');
const screenshotGrabber = require('../utils/downloadScreenShot.js');
const winSetup = require('../utils/newTermWindowSetup.js');
const utils = require('../utils');
const inquirer = require('inquirer')
const getAWSConfig = require('../utils/getAwsConfig')
const getServerIps = require('../utils/getServerIps')
const Promise = require('bluebird');
const setupInfo = winSetup(process.argv[2]);
const screenshotsInfo = setupInfo[0];
const tmpDir = setupInfo[1];


const getPicsToDownload = () => {
  return new Promise((resolve) => {
    const pics = screenshotsInfo.tests;
    utils.waitForContinue("[Y] Download all || [n] Select individual screenshots for download")
    .then(() => {
      resolve(pics)
    }).catch(() => {
      const msg = 'Select screenshots to download';
      const choices = pics.map(tst => {
        return {
          name:tst.testName,
          value: tst
        }
      });
      utils.askWhich(choices, msg).then(selection => {
        resolve(selection)
      })
    })
  })
}


getPicsToDownload().then(pics => {
  console.log(`Fetching ${pics.length} screenshots`);
  screenshotGrabber(screenshotsInfo.env, pics.map(p => p.screenshot), tmpDir)
    .then(() => {
      msg = 'Continue to exit and delete downloaded pictures'
      utils.finish(msg)
    })
})
