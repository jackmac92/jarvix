import Promise from 'bluebird';
import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import getFiles from './getFileFromServer';
import findServer from './determineCorrectServer';

const open = targetPath => shell.exec(`open ${targetPath}`);
const noWork = () => console.log('Ok');

const getSingleTestInfo = (ip, t, tmpDir) =>
  Promise.all([
    getFiles(ip, t.dir, tmpDir, true),
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

const main = (env, tests, tmpDir) =>
  findServer(env, 'test-runner', `test -e ${tests[0].dir}`).then(ip =>
    getAllTestsInfo(ip, tests, tmpDir)
  );

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
