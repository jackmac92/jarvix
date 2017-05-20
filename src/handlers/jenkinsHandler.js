#! /usr/bin/env babel-node
import Listr from 'listr';
// import infoGrabber from '../utils/testRunnerDl';
import winSetup from './';
import { waitForContinue, askWhich, finish } from '../utils';
import { listrTask as downloadS3 } from '../utils/downloadS3';

const setupInfo = winSetup(process.argv[2]);
// const screenshotsInfo = setupInfo[0];
// const tmpDir = setupInfo[1];
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

// ctx.selectedTests = chosenTests;
// ctx.awsScreenshotKeys = chosenTests.reduce(
//   (acc, t) => [...acc, ...t.screenshots],
//   []
// );

selectTests(tests)
  .then(selectedTests =>
    new Listr().add(downloadS3).run({
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

// selectTests()
//   .then(tests => infoGrabber(screenshotsInfo.env, tests, tmpDir))
//   .then(() => );
