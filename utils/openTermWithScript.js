const shell = require('shelljs')
const path = require('path')
const tmp = require('tmp')
const fs = require('fs')
const os = require('os')

const terminalHelper = (cmd, args) => {
  const tmpDir = tmp.dirSync({ mode: 0750, prefix: `${cmd}_` });

  const argsFilePath = path.join(tmpDir.name, "args.json")

  fs.writeFile(argsFilePath, JSON.stringify(args, null, 4))

  args = args || ""
  if (typeof(cmd) === "object") {
    throw new Error("Command sent to openTermWithScript must be the name of js file")
  }
  const scriptPath = path.join(__dirname,"..", `${cmd}.js`)
  switch (os.platform()) {
    case "darwin":
      openTerm = `osascript -e 'tell application "Terminal"' -e 'do script "${scriptPath} '${argsFilePath}' "' -e 'activate' -e  'end tell'`
      break;
    case "linux":
      openTerm = `gnome-terminal -e "${scriptPath} ${argsFilePath}"`
      break;
    case "win32":
    default:
      throw new Error("Couldn't detect os or it's not supported")
      break;
  }
  result = shell.exec(openTerm, {silent: true})
  if (result.code === 0) {
    console.log(`Successfully started ${cmd}`)
  } else {
    console.log("PROBLEM")
    console.log(result.stderr)
    console.log("\n")
    console.log(openTerm)
  }
}

module.exports = terminalHelper
