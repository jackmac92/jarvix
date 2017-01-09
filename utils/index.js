import shell from 'shelljs';
import inquirer from 'inquirer';


function exec(cmd) {
  return shell.exec(cmd, { silent: true });
}
export const pinkyExec = cmd => new Promise((resolve, reject) => {
  const result = shell.exec(cmd, { silent: true });
  const code = result.code;
  if (code === 0) {
    resolve(result.stdout);
  } else {
    reject(result.stderr);
  }
});
export const runCmd = (cmd) => {
  const result = shell.exec(cmd, { silent: true });
  if (result.code === 0) {
    return result.toString();
  } else {
    return result.stderr;
  }
};
export const cleanUpTmpDir = (dir) => {
  console.log('Removing tmp dir');
  shell.exec(`rm -rf ${dir}`);
};
export const moveTmpToDesktop = (tmpDir) => {
  console.log('Moving tmp dir files to Desktop');
  shell.exec(`mv ${tmpDir}` ` ~/Desktop`);
};
export const askWhich = (choices, msg) => new Promise((resolve) => {
  inquirer.prompt([
    {
      type: 'checkbox',
      message: msg,
      name: 'whatever',
      choices
    }
  ]).then((selection) => {
    resolve(selection.whatever);
  });
});
export const waitForContinue = msg => new Promise((resolve, reject) => {
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: msg,
      default: true
    }
  ]).then((answer) => {
    if (answer.continue) {
      resolve();
    } else {
      reject();
    }
  });
});
export const finish = (msg, tmpDir) => {
  waitForContinue(msg)
    .then(() => cleanUpTmpDir(tmpDir))
    .catch(() => moveTmpToDesktop(tmpDir));
};

