import shell from 'shelljs';
import inquirer from 'inquirer';

export default {
  exec(cmd) {
    return shell.exec(cmd, {silent: true})
  },
  pinkyExec(cmd) {
    return new Promise((resolve, reject) => {
      const result = shell.exec(cmd, { silent: true})
      const code = result.code
      if (code === 0) {
        resolve(result.stdout)
      } else {
        reject(result.stderr)
      }
    })
  },
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
    shell.exec(`mv ${tmpDir}` ` ~/Desktop`)
  },
  finish(msg) {
    this.waitForContinue(msg).then(answer => {
      this.cleanUpTmpDir(tmpDir)
    }).catch(dont => {
      this.moveTmpToDesktop(tmpDir)
    })
  },
  askWhich(choices, msg) {
    return new Promise((resolve) => {
      inquirer.prompt([
        {
          type: 'checkbox',
          message: msg,
          name: 'whatever',
          choices: choices
        }
      ]).then(selection => {
        resolve(selection.whatever)
      })
    })
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
