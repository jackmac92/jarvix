#!/usr/bin/env node
import shell from 'shelljs';
import infoGrabber from '../utils/download/testInfo.js';
import winSetup from '../utils/newTermWindowSetup.js';
import utils from '../utils';
import inquirer from 'inquirer';
import getAWSConfig from '../utils/awsConfig';
import getServerIps from '../utils/getServerIps';

const setupInfo = winSetup(process.argv[2]);
const screenshotsInfo = setupInfo[0];
const tmpDir = setupInfo[1];

const selectTests = () =>
  new Promise((resolve) => {
    const tests = screenshotsInfo.tests

    utils.waitForContinue("[Y] Download all || [n] Select individual tests")
    .then(() => {
      resolve(tests)
    }).catch(() => {
      const msg = 'Select tests';
      const choices = tests.map(tst => {
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


selectTests().then(tests =>
  infoGrabber(screenshotsInfo.env, tests, tmpDir)
).then(() =>
  utils.finish('Continue to exit and delete downloaded pictures')
)
