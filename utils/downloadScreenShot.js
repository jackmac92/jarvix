const boto = require('aws-sdk')
const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')
const request = require('request')

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

const getAWSConfig = () => {
  return new Promise((resolve, reject) => {
    reqParams = {
      url: CBI_ENV_LOCATION,
      json: true
    }
    request(reqParams, (err, res, body) => {
      if (!err && res.statusCode < 400) {
        resolve(body)
      }
    })
  })
}

const getServerIps = (env) => {
  return new Promise((resolve, reject) => {
    getAWSConfig().then(cfg => {
      const boxType = 'test-runner'
      searchKey = cfg[env][boxType]['searchkey']
      searchVal = cfg[env][boxType]['searchvalue']

      const ec2Params = {
        Filters: [
          {
            Name: `tag:${searchKey}`,
            Values: [searchVal]
          },
          {
            Name: 'instance-state-name',
            Values: ['running']
          }
        ],
      };
      const ec2 = new boto.EC2({region:cfg[env]['region']})
      ec2.describeInstances(ec2Params, (err, data) => {
        if (err) {
          reject(err)
        }
        var ips = []
        data["Reservations"].forEach(server => {
          server.Instances.forEach(instance => ips.push(instance["PrivateIpAddress"]))
        })
        resolve(ips)
      })
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

const main = (env, picPath, tmpDir) => {
  tmpDir = tmpDir || path.dirname(tmp.dirSync({ mode: 0750, prefix: "cbiHelper_" }).name);
  return new Promise( (resolve, reject) => {
    servers = getServerIps(env)
    servers.then(ips => {
      if (getPicture(ips, picPath, tmpDir)) {
        resolve(tmpDir);
      }
    })
  })
}
module.exports = main
