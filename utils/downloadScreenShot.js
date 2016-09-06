const boto = require('aws-sdk')
const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')

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
  ec2EnvMap = {
    dev:"dev",
    staging:"stg",
    prod:"prd"
  }

  ec2Env = ec2EnvMap[env]

  const ec2Params = {
    Filters: [
      {
        Name: 'tag:Name',
        Values: [`ec2.cbi_${ec2Env}.tst.integration-tests`]
      }
    ],
  };
  return new Promise((resolve, reject) => {
    const ec2 = new boto.EC2({region:"us-east-1"})
    ec2.describeInstances(ec2Params, (err, data) => {
      if (err) {
        reject(err)
      }
      var ips = []
      data["Reservations"].forEach(server => {
        server.Instances.forEach(instance => ips.push(instance["PrivateIpAddress"]))
      })
      resolve(ips)
    });
  })
}

const open_pic = (picPath) => {
  switch (os.platform()) {
    case "darwin":
      result = shell.exec(`open ${picPath}`)
      break;
    case "linux":
      result = shell.exec(`xdg-open ${picPath}`)
      break;
  }
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

const getPicture = (ips, picPath, tmpDir) => {
  var errCount = 0
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
    servers = getServerIps(branch)
    servers.then(ips => {
      result = getPicture(ips, picPath, tmpDir)
      if (result) {
        resolve(tmpDir);
      } else if (result === false) {
        reject("Couldn't find screenshot")
      }
    })
  })
}

module.exports = main


