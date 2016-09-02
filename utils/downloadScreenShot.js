const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')

runCmd = (cmd) => {
  result = shell.exec(cmd, {silent:true})
  if (result.code === 0) {
    return result.toString()
  } else {
    console.log("ERR\n")
    console.log(result.stderr)
    return void 0
  }
}

const getServerIps = (env) => {
  const cmd = `aws-show-ips ${env} test-runner --ssh | awk '{print $4}' | awk '{print $1}'`
  result = runCmd(cmd).split(/\s+/).filter(el => el.length > 0)
  return result
}

const open_pic = (picPath) => {
  result = shell.exec(`open ${picPath}`)
}

const picFetch = (cmd) => {
  return new Promise( (resolve, reject) => {
    result = shell.exec(cmd, {silent:true})
    if (result.code === 0) {
      resolve(result.toString())
    } else {
      reject(result.stderr)
    }
  })
}

const get_picture = (ips, picPath, tmpDir) => {
  errCount = 0
  ips.forEach( (ip) => {
    cmd = `scp ${ip}:${picPath} ${tmpDir}`
    pf = picFetch(cmd)
    pf.then(() => {
      picPath = picPath.split("/")[2]
      open_pic(path.join(tmpDir, picPath))
      return true
    }).catch((reason) => {
      errCount++
      if (errCount === ips.length) {
        return false
      }
    })
  })
}


const main = (branch, picPath, tmpDir) => {
  tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
  return new Promise( (resolve, reject) => {
    ips = getServerIps(branch)
    result = get_picture(ips, picPath, tmpDir)
    if (result) {
      resolve(tmpDir);
    } else if (result === false) {
      reject("Couldn't find screenshot")
    }
  })
}

module.exports = main


