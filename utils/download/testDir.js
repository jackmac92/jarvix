import { pinkyExec } from '../index';

export default (ip, test, tmpDir) =>
  new Promise((resolve) => {
    pinkyExec(`scp -r ubuntu@${ip}:${test.dir} ${tmpDir}`)
      .then(resolve).catch(resolve);
  });
