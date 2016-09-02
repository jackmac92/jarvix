#!/usr/bin/env node
const readline = require('readline-sync');
const shell = require('shelljs')
const screenshotGrabber = require('./utils/downloadScreenShot.js')
const winSetup = require('./utils/newTermWindowSetup.js')

const setupInfo = winSetup(process.argv[2])

const args = setupInfo[0]
const tmpDir = setupInfo[1]

args.tests.forEach( (el, i) => {
  console.log()
  console.log(` ${i}: ${el.testName}`)
})

input = readline.question("Enter space separated numbers for individual screenshots, no input gets all")


pics = (input.length === 0) ? args.tests
                            : input.split(/\s/).map(n => args.tests[n])

console.log(`Fetching ${pics.length} screenshots`)

Promise.all(
    pics.map(p => screenshotGrabber(args.branch, p.screenshot, tmpDir))
  ).then(values => {
    console.log("Done")
    input = readline.question("Press enter to delete screenshots and exit")
    result = shell.exec(`rm -rf ${tmpDir}`)
    if (result.code !== 0) {
      console.log(result.stderr)
    }
})
