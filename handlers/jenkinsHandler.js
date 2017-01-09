#!/usr/bin/env babel-node
import infoGrabber from '../utils/download/testInfo';
import winSetup from '../utils/newTermWindowSetup';
import { waitForContinue, askWhich, finish } from '../utils';

const setupInfo = winSetup(process.argv[2]);
const screenshotsInfo = setupInfo[0];
const tmpDir = setupInfo[1];

const selectTests = () =>
  new Promise((resolve) => {
    const tests = screenshotsInfo.tests;

    waitForContinue('[Y] Download all || [n] Select individual tests')
    .then(() => resolve(tests))
    .catch(() => { // This is fucking stupid
      const msg = 'Select tests';
      const choices = tests.map(tst => ({
        name: tst.testName,
        value: tst
      }));
      askWhich(choices, msg).then((selection) => {
        resolve(selection);
      });
    });
  });


selectTests().then(tests =>
  infoGrabber(screenshotsInfo.env, tests, tmpDir)
).then(() =>
  finish('Continue to exit and delete downloaded pictures')
);
