import { pinkyExec } from './index';

export default (ip, test, tmpDir) =>
  new Promise( (resolve, reject) => {
    cmd = `scp -r ubuntu@${ip}:${test.dir} ${tmpDir}`
    pinkyExec(cmd).then(() => {
      resolve()
    }).catch(reason => {
      resolve(reason)
    })
  })
