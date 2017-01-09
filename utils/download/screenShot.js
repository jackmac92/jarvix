import utils from './index.js';

export default (ip, picPath, tmpDir) =>
  new Promise( (resolve, reject) => {
    const cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`
    utils.pinkyExec(cmd).then(() => {
      resolve(picPath)
    }).catch(reason => {
      reject(reason)
    })
  })
