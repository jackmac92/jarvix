const getAWSConfig = require('./getAwsConfig')
const getServerIps = require('./getServerIps')
const Promise = require('bluebird');
const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')
const MultiSpinner = require('multispinner')

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
      (code === 0) ? resolve(ip) : reject("Pic not on this server")
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
      reject(result.stderr)
    } else {
      resolve()
    }
  })
}

const getPicture = (ip, picPath, tmpDir, spinnerID, spinners) => {
  return new Promise( (resolve, reject) => {
    cmd = `scp ubuntu@${ip}:${picPath} ${tmpDir}`
    picFetch(cmd).then(() => {
      localPicPath = path.join(tmpDir,picPath.split("/")[2])
      spinners.success(spinnerID)
      openPic(localPicPath)
      resolve(true)
    }).catch(reason => {
      spinners.error(spinnerID)
      console.log(`Failed to download screenshot ${picPath}`)
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
  }).catch(reason => console.log(`pickServer err: ${reason}`))
}

const noWork = () => {
  console.log("Fine I didn't want to help anyway")
}

const main = (env, picPaths, tmpDir) => {
  if (picPaths.length === 0) return noWork()
  return new Promise( (resolve, reject) => {
    console.log(`Fetching ${picPaths.length} screenshots from ${env} test-runner`);
    tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
    getAWSConfig().then(cfg => {
      return getServerIps(env, cfg)
    }).then(ips => {
      return pickServer(ips, picPaths[0])
    }).then(ip => {
      const spinners = new MultiSpinner(picPaths, {preText: 'Downloading'})
      Promise.all(
        picPaths.reduce((accum, p) => {
          accum.push(getPicture(ip, p, tmpDir, p, spinners))
          return accum
        }, [])
      ).then((results) => {
        spinners.on('done', () => resolve(tmpDir))
      })
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
