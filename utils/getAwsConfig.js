const request = require('request')
const Promise = require('bluebird');

const getAWSConfig = () => {
  console.log("Getting CBI AWS Server info")
  return new Promise((resolve, reject) => {
    reqParams = {
      url: CBI_ENV_LOCATION,
      json: true
    }
    request(reqParams, (err, res, body) => {
      if (!err && res.statusCode < 400) {
        console.log("Found Server Info")
        resolve(body)
      }
    })
  })
}

module.exports = getAWSConfig
