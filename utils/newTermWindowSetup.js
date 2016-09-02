const path = require('path')
const shell = require('shelljs')
const fs = require('fs')

const main = (argsPath) => {
  args = JSON.parse(fs.readFileSync(argsPath, "utf-8"))
  tmpDir = path.dirname(argsPath)
  process.stdout.write('\033c'); // Clear terminal
  return [args, tmpDir]
}

module.exports = main
