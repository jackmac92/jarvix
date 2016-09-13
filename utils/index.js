const shell = require('shelljs');
const inquirer = require('inquirer')

module.exports = {
  runCmd(cmd) {
    result = shell.exec(cmd, {silent: true})
    if (result.code === 0) {
      return result.toString()
    } else {
      return result.stderr
    }
  },

  cleanUpTmpDir(dir) {
    shell.exec(`rm -rf ${dir}`);
  },

  waitForContinue(msg) {
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: msg,
        default: true
      }
    ])
  }
}
