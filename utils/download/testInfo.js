import MultiSpinner from 'multispinner';
import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import os from 'os';
import downloadScreenShots from './downloadScreenShot.js';
import downloadTestDir from './downloadTestDir.js';
import getAWSConfig from './awsConfig';
import getServerIps from './getServerIps';

const open = (path) => {
  shell.exec(`open ${path}`, {silent:true, async:true})
}

const serverTestCall = (ip, picPath) => {
  return new Promise( (resolve, reject) => {
    const cmd = `ssh ${ip} "test -e ${picPath}"`
    result = shell.exec(cmd, {silent:true}, (code) => {
      (code === 0) ? resolve(ip) : reject()
    })
  })
}

const checkServer = (ip, picPath) => {
  return new Promise((resolve, reject) => {
    serverTestCall(ip, picPath)
      .then(ip => {
        resolve(ip)
      })
      .catch(reason => {})
  })
}

const pickServer = (ips, picPath) => {
  return new Promise((resolve) => {
    if (ips.length === 1) {
      resolve(ips[0])
    }
    const testRunners = ips.map(ip => checkServer(ip, picPath))
    Promise.any(testRunners).then(ip => {
      resolve(ip)
    })
  })
}

const noWork = () => {
  console.log("Fine I didn't want to help anyway")
}

const getAllTestsInfo = (ip, tests, tmpDir) => {
  return new Promise((resolve, reject) => {
    tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
    var spinners = new MultiSpinner(tests.map(t => t.testName))
    const fetches = tests.reduce((accum, t) => {
      accum.push(getSingleTestInfo(ip, t, tmpDir, spinners, t.testName))
      return accum
    }, [])
    Promise.all(fetches).then(results => {
      spinners.on('done', () => {
        open(tmpDir)
        resolve()
      })
    }).catch(reason => {
      console.log(reason)
      resolve(reason)
    })
  })
}

const getSingleTestInfo = (ip, t, tmpDir, spinners, spinnerID) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      [downloadTestDir(ip, t, tmpDir)] + t.screenshots.map(s => downloadScreenShots(ip, s, tmpDir))
    ]).then(results => {
      resolve()
    }).catch(reason => {
      reject(reason)
    })
  }).then(success => {
    spinners.success(spinnerID)
    return [spinnerID, success]
  }).catch(reason => {
    console.log(reason)
    spinners.error(spinnerID)
    return [spinnerID, reason]
  })
}

const main = (env, tests, tmpDir) => {
  if (tests.length === 0) return noWork()
  return new Promise( (resolve, reject) => {
    console.log(`Fetching info for ${tests.length} tests from ${env} test-runner`);
    getAWSConfig().then(cfg => {
      return getServerIps(env, cfg)
    }).then(ips => {
      return pickServer(ips, tests[0].dir)
    }).then(ip => {
      return getAllTestsInfo(ip, tests, tmpDir)
    }).then(results => {
      resolve()
    })
  })
}


if (require.main === module) {
  env = process.argv[2]
  picPath = process.argv[3]
  console.log(env)
  console.log(picPath)
  main(env, [picPath])
}

module.exports = main
