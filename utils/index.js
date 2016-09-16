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
    console.log("Removing tmp dir")
    shell.exec(`rm -rf ${dir}`);
  },

  moveTmpToDesktop(tmpDir) {
    console.log("Moving tmp dir files to Desktop")
    shell.exec(`mv ${tmpDir}/* ~/Desktop`)
  },

  waitForContinue(msg) {
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: msg,
          default: true
        }
      ]).then(answer => {
        if (answer.continue) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }
}
