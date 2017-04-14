import request from 'request';

const CBI_ENV_LOCATION = 'http://s3.amazonaws.com/cbi-wiki/cbi-env.json';

export default () =>
  new Promise((resolve) => {
    request({ url: CBI_ENV_LOCATION, json: true }, (err, res, body) => {
      if (!err && res.statusCode < 400) {
        resolve(body);
      }
    });
  });
