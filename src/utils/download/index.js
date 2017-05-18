import aws from 'aws-sdk';
import fs from 'fs';
import Listr from 'listr';

const s3 = new aws.S3();

const downloadScreenshot = Key =>
  new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: 'cbi-test-screenshots',
        Key
      },
      (err, res) => {
        if (err) reject(err);
        fs.writeFileSync(name, res.Body);
        resolve(name);
      }
    );
  });

const picName = 'screenshot-b03d550f-a06b-4453-ade0-cbb4f8cb234b.png';

export const listrTask = {
  title: 'Download Test Screenshots',
  task: ctx =>
    new Listr(
      ctx.awsScreenshotKeys.map(k => ({
        title: `Downloading ${k}`,
        task: ctx => downloadScreenshot(k)
      })),
      { concurrent: true }
    )
};
