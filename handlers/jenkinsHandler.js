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

const askGetAll = () => {
  return new Promise((resolve) => {
    inquirer.prompt([
      {
        type: 'list',
        name: 'getAll',
        message: 'What do you want to download',
        choices: [
          'Download all found screenshots',
          'Select screenshots to download'
        ],
        filter: (val) => {
          if (val[0] === "D") {
            return true
          } else {
            return void 0
          }
        }
      }
    ]).then(answers => {
      resolve(answers.getAll)
    })
  })
}

const askWhich = (tests) => {
  return new Promise((resolve) => {
    inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Select screenshots to download',
        name: 'screenshots',
        choices: tests.map(tst => {
          return {
            name:tst.testName,
            value: tst
          }
        })
      }
    ]).then(selection => {
      resolve(selection.screenshots)
    })
  })
}

const getPicsToDownload = () => {
  return new Promise((resolve) => {
    askGetAll().then(answer => {
      if (answer) {
        resolve(screenshotsInfo.tests)
      } else {
        askWhich(screenshotsInfo.tests).then(selection => {
          resolve(selection)
        })
      }
    })
  })
}


getPicsToDownload().then(pics => {
  console.log(`Fetching ${pics.length} screenshots`);
  screenshotGrabber(screenshotsInfo.env, pics.map(p => p.screenshot), tmpDir)
    .then(() => {
      msg = 'Continue to exit and delete downloaded pictures'
      utils.waitForContinue(msg).then(answer => {
        utils.cleanUpTmpDir(tmpDir)
      }).catch(dont => {
        utils.moveTmpToDesktop(tmpDir)
      })
    }).catch(reason => {
      console.log(reason)
    })
})
