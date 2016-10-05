const boto = require('aws-sdk')
const Promise = require('bluebird');

const getServerIps = (env, cfg) => {
  return new Promise((resolve, reject) => {
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
          server.Instances.forEach(instance => {
            instIp = instance["PublicIpAddress"] || instance["PrivateIpAddress"]
            ips.push(instIp)
          })
        })
        if (ips.length > 0) {
          console.log(`Found ${env} server ips`)
          resolve(ips)
        } else {
          console.log("Unable to find server ips")
          reject()
        }
      })
    });
}

module.exports = getServerIps
