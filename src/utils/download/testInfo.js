import Promise from 'bluebird';
import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import { getServersByRole } from 'cbiServerUtils';
import getFiles from '../getFileFromServer';
const open = targetPath => shell.exec(`open ${targetPath}`);

const serverTestCall = (ip, picPath) =>
  new Promise((resolve, reject) => {
    const cmd = `ssh ${ip} "test -e ${picPath}"`;
    shell.exec(cmd, { silent: true }, code => {
      code === 0 ? resolve(ip) : reject();
    });
  });

const checkServer = (ip, picPath) => serverTestCall(ip, picPath).catch(x => {});

const pickServer = (ips, picPath) =>
  Promise.any(ips.map(ip => checkServer(ip, picPath)));

const noWork = () => console.log('Ok');

const getSingleTestInfo = (ip, t, tmpDir) =>
  Promise.all([
    getFiles(ip, t, tmpDir, true),
    ...t.screenshots.map(s => getFiles(ip, s, tmpDir))
  ]);

const getAllTestsInfo = (ip, tests, tmpDir) => {
  tmpDir =
    tmpDir ||
    path.dirname(tmp.dirSync({ mode: 750, prefix: 'cbiHelper_' }).name);

  return Promise.all(
    tests.map(t => getSingleTestInfo(ip, t, tmpDir))
  ).then(results => {
    open(tmpDir);
    return results;
  });
};

const findServer = (env, tests) =>
  getServersByRole(env, 'test-runner').then(
    ips => (ips.length === 1 ? ips[0] : pickServer(ips, tests[0].dir))
  );

const main = (env, tests, tmpDir) =>
  findServer(env, tests).then(ip => getAllTestsInfo(ip, tests, tmpDir));

if (require.main === module) {
  const env = process.argv[2];
  const tests = process.argv[3];
  if (tests.length === 0) {
    noWork();
    process.exit(1);
  }
  console.log(
    `Fetching info for ${tests.length} tests from ${env} test-runner`
  );
  main(env, [tests]);
}

export default main;
