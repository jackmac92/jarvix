const getAWSConfig = require('./getAwsConfig')
const getServerIps = require('./getServerIps')
const Promise = require('bluebird');
const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')

CBI_ENV_LOCATION = 'http://s3.amazonaws.com/cbi-wiki/cbi-env.json'

const openPic = (picPath) => {
  switch (os.platform()) {
    case "darwin":
      result = shell.exec(`open ${picPath}`)
      break;
    case "linux":
      result = shell.exec(`xdg-open ${picPath}`)
      break;
  }
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
      }).catch(reason => {})
  })
}

const picFetch = (cmd) => {
  return new Promise( (resolve, reject) => {
    result = shell.exec(cmd, {silent:true})
    if (result.code !== 0) {
      console.log(`Error getting pic ${picPath}`)
      reject()
    } else {
      resolve()
    }
  })
}

const getPicture = (ip, picPath, tmpDir) => {
  return new Promise( (resolve, reject) => {
    cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`
    picFetch(cmd).then(() => {
      localPicPath = path.join(tmpDir,picPath.split("/")[2])
      openPic(localPicPath)
      resolve(true)
    }).catch(reason => {
      console.log(reason)
      resolve(false)
    })
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

const main = (env, picPaths, tmpDir) => {
  return new Promise( (resolve, reject) => {
    tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
    getAWSConfig().then(cfg => {
      return getServerIps(env, cfg)
    }).then(ips => {
      return pickServer(ips, picPaths[0])
    }).then(ip => {
      Promise.all(
        picPaths.map(p => getPicture(ip, p, tmpDir))
      ).then((results) => {
        resolve(tmpDir);
      })
    })
  })
}

module.exports = main
