const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const os = require('os');
const runCmd = require('./index').runCmd;

const terminalHelper = (cmd, args = '') => {
  const tmpDir = tmp.dirSync({ mode: '0750', prefix: `${cmd}_` });

  const argsFilePath = path.join(tmpDir.name, 'args.json');

  fs.writeFile(argsFilePath, JSON.stringify(args, null, 4));

  if (typeof (cmd) === 'object') {
    throw new Error('Command sent to openTermWithScript must be the name of js file');
  }
  const scriptPath = path.join(__dirname, '..', 'handlers', `${cmd}.js`);
  let openTerm;
  switch (os.platform()) {
    case 'darwin':
      openTerm = `osascript -e 'tell application "Terminal"' -e 'do script "${scriptPath} '${argsFilePath}' "' -e 'activate' -e  'end tell'`;
      break;
    case 'linux':
      openTerm = `gnome-terminal -e "${scriptPath} ${argsFilePath}"`;
      break;
    case 'win32':
    default:
      throw new Error("Windows... gross");
  }

  return runCmd(openTerm);
};

export default terminalHelper;
