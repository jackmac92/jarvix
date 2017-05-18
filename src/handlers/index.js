import path from 'path';
import fs from 'fs';

const main = argsPath => {
  const args = JSON.parse(fs.readFileSync(argsPath, 'utf-8'));
  const tmpDir = path.dirname(argsPath);
  process.stdout.write('\x1Bc'); // Clear terminal
  console.log('\n\n');
  return [args, tmpDir];
};

export default main;
