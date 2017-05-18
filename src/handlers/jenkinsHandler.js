#! /usr/bin/env babel-node
import infoGrabber from '../utils/download/testInfo';
import winSetup from './';
import { waitForContinue, askWhich, finish } from '../utils';

const setupInfo = winSetup(process.argv[2]);
const screenshotsInfo = setupInfo[0];
const tmpDir = setupInfo[1];

const { tests } = screenshotsInfo;

const selectTests = () =>
  waitForContinue(
    '[Y] Download all || [n] Select individual tests'
  ).then(answeredYes => {
    if (answeredYes) return tests;
    const choices = tests.map(tst => ({ name: tst.testName, value: tst }));
    return askWhich(choices, 'Select tests');
  });

selectTests()
  .then(tests => infoGrabber(screenshotsInfo.env, tests, tmpDir))
  .then(() => finish('Continue to exit and delete downloaded pictures'));
