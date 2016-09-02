const shell = require('shelljs')
const path = require('path')

runCmd = (cmd) => {
    return shell.exec(cmd, {silent:true}).toString()
}

listDirs = (dir) => {
    shell.cd(dir)
    return runCmd("ls").split("\n")
}

const getWorkingDir = (repo) => {
    if (!(process.env.CBI_ROOT)) {
        throw new Error("Need to set CBI_ROOT environment var")
    }
    r = process.env.CBI_ROOT
    if (!repo in listDirs(r)) {
        throw new Error(`Couldn't find working dir for ${repo}`)
    }
    workingDir = path.join(r,repo)
    shell.cd(workingDir)
    return workingDir
}

const checkRepoReady = () => {
    status = runCmd('git status')
    currStatus = status.split("\n")[1]
    readyMsg = /[nothing to commit, working directory clean]/
    if (!currStatus.match(readyMsg)) {
        throw new Error(`Stopping due to uncommitted changes in ${repo}`)
    }

}

const postSetup = (repo) => {
    switch (repo) {
        case "cbi-site":
            runCmd("npm run dev")
            break;
        case "cbi-api":
            runCmd("vagrant reload")
            break;
    }
}

const repoSetup = (repo, branch) => {
    const wd = getWorkingDir(repo)
    checkRepoReady()
    runCmd('git fetch --all')
    runCmd(`git checkout ${branch}`)
    runCmd('git pull')
    return wd
}

module.exports = repoSetup
