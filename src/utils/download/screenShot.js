import { pinkyExec } from '../index.js';

export default (ip, picPath, tmpDir) =>
  new Promise((resolve, reject) => {
    const cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`;
    pinkyExec(cmd)
      .then(() => resolve(picPath))
      .catch(reject);
  });
