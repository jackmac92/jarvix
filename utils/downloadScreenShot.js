const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')
const Promise = require('bluebird');
const getAWSConfig = require('./getAwsConfig')
const getServerIps = require('./getServerIps')

CBI_ENV_LOCATION = 'http://s3.amazonaws.com/cbi-wiki/cbi-env.json'

const runCmd = (cmd) => {
  result = shell.exec(cmd, {silent:true})
  if (result.code === 0) {
    return result.toString()
  } else {
    console.log("ERR\n")
    console.log(result.stderr)
    return void 0
  }
}

const openPic = (picPath) => {
  console.log("Opening picture")
  switch (os.platform()) {
    case "darwin":
      result = shell.exec(`open ${picPath}`)
      break;
    case "linux":
      result = shell.exec(`xdg-open ${picPath}`)
      break;
  }
}

const checkServer = (ip, picPath, tmpDir) => {
  return new Promise( (resolve, reject) => {
    cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`
    result = shell.exec(cmd, {silent:true})
    if (result.code === 0) {
      console.log(`Found pics at ${ip}`)
      resolve(ip)
    }
  })
}
const picFetch = (ip, picPath, tmpDir) => {
  return new Promise( (resolve, reject) => {
  })
}

const getPicture = (ip, picPath, tmpDir) => {
  return new Promise( (resolve, reject) => {
    cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`
    result = shell.exec(cmd, {silent:true})
    if (result.code !== 0) {
      console.log(`Error getting pic ${picPath}`)
    }
    localPicPath = path.join(tmpDir,picPath.split("/")[2])
    openPic(localPicPath)
    resolve(localPicPath)
  })
}

const pickServer = (ips, picPath, tmpDir) => {
  return new Promise((resolve) => {
    Promise.any(
      ips.map(ip => checkServer(ip, picPath, tmpDir))
    ).then(ip => resolve(ip))
  })
}

const main = (env, picPaths, tmpDir) => {
  tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
  return new Promise( (resolve, reject) => {
    getAWSConfig().then(cfg => {
      return getServerIps(env, cfg)
    }).then(ips => {
      return pickServer(ips, picPaths.pop(), tmpDir)
    }).then(ip => {
      return Promise.all(
        picPaths.map(picPath => getPicture(ip, picPath, tmpDir))
      )
    }).then(() => {
      resolve(tmpDir);
    })
  })
}

module.exports = main
