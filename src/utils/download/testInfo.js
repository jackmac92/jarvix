import Promise from 'bluebird'
import MultiSpinner from 'multispinner';
import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import os from 'os';
import downloadScreenShots from './screenShot';
import downloadTestDir from './testDir';
import getAWSConfig from '../awsConfig';
import getServerIps from '../getServerIps';

const open = targetPath => shell.exec(`open ${targetPath}`);

const serverTestCall = (ip, picPath) =>
  new Promise((resolve, reject) => {
    const cmd = `ssh ${ip} "test -e ${picPath}"`;
    shell.exec(cmd, { silent: true }, (code) => {
      code === 0  ? resolve(ip) : reject();
    });
  });

const checkServer = (ip, picPath) =>
  new Promise((resolve) => {
    serverTestCall(ip, picPath)
      .then(resolve)
      .catch((reason) => {});
  });

const pickServer = (ips, picPath) =>
  new Promise((resolve) => {
    if (ips.length === 1) resolve(ips[0]);
    Promise.any(
      ips.map(ip => checkServer(ip, picPath))
    ).then(resolve);
  });

const noWork = () => console.log('Ok');

const getAllTestsInfo = (ip, tests, tmpDir) => new Promise((resolve, reject) => {
  tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 750, prefix: 'cbiHelper_' }).name);
  console.log(tmpDir);
  const spinners = new MultiSpinner(tests.map((t, idx) => ({
    [`spin-${idx}`]: t.testName
  })));
  const fetches = tests.map(t => getSingleTestInfo(ip, t, tmpDir, spinners, t.testName));
  Promise.all(fetches).then((results) => {
    spinners.on('done', () => {
      open(tmpDir);
      resolve();
    });
  }).catch((reason) => {
    console.log(reason);
    resolve(reason);
  });
});

const getSingleTestInfo = (ip, t, tmpDir, spinners, spinnerID) =>
  Promise.all([
    downloadTestDir(ip, t, tmpDir),
    ...t.screenshots.map(s => downloadScreenShots(ip, s, tmpDir))
  ]).then((success) => {
    spinners.success(spinnerID);
    return [spinnerID, success];
  }).catch((reason) => {
    console.log(reason);
    spinners.error(spinnerID);
    return [spinnerID, reason];
  });

const main = (env, tests, tmpDir) => {
  if (tests.length === 0) return noWork();
  return new Promise((resolve) => {
    console.log(`Fetching info for ${tests.length} tests from ${env} test-runner`);
    getAWSConfig()
      .then(cfg => getServerIps(env, cfg))
      .then(ips => pickServer(ips, tests[0].dir))
      .then(ip => getAllTestsInfo(ip, tests, tmpDir))
      .then(() => resolve());
  });
};


if (require.main === module) {
  const env = process.argv[2];
  const picPath = process.argv[3];
  main(env, [picPath]);
}

export default main;
