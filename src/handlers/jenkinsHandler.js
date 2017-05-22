#! /usr/bin/env babel-node
import Listr from 'listr';
import { downloadS3Task } from 'cbiServerUtils';
import winSetup from './';
import { waitForContinue, askWhich, finish } from '../utils/index';

const setupInfo = winSetup(process.argv[2]);
const { tmpDir, args: screenshotsInfo } = setupInfo;
const { tests } = screenshotsInfo;

const selectTests = testList =>
  waitForContinue(
    '[Y] Download all || [n] Select individual tests'
  ).then(answeredYes => {
    if (answeredYes) return testList;
    const choices = testList.map(tst => ({ name: tst.testName, value: tst }));
    return askWhich(choices, 'Select tests');
  });

selectTests(tests)
  .then(selectedTests =>
    new Listr().add(downloadS3Task).run({
      tmpDir,
      selectedTests,
      awsScreenshotKeys: selectedTests
        .filter(t => t.awsLink)
        .map(t => t.awsLink.split('cbi-test-screenshots/')[1].split('/')[0])
    })
  )
  .then(() => finish('Continue to exit and delete downloaded pictures'))
  .catch(err => {
    throw new Error(err);
  });
