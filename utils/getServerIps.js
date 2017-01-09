import boto from 'aws-sdk';

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

const getServerIps = (env, cfg) =>
  new Promise((resolve, reject) => {
    const boxType = 'test-runner'
    searchKey = cfg[env][boxType]['searchkey']
    searchVal = cfg[env][boxType]['searchvalue']

    const ec2 = new boto.EC2({region:cfg[env]['region']})
    ec2.describeInstances(ec2Params, (err, data) => {
      if (err) reject(err)

      const ips = data.Reservations.map(
        ({ Instances }) => ...Instances.map(
          inst => inst.PublicIpAddress || inst.PrivateIpAddress
        )
      )

      if (ips.length > 0) {
        resolve(ips)
      } else {
        reject()
      }
    })
  });

export default getServerIps;
