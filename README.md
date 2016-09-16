# Setup
Install local server

    sudo chmod +x install.sh
    sudo ./install.sh

set `CBI_ROOT` environment variable to the dir containing local repos

    export CBI_ROOT=$HOME/cbinsights

Start jarvix server

    ./jarvixServer.js

Install the chrome extension as an unpacked extension

## What it does
Finds test-runner screenshots on jenkins and dev.test.cbinsights.com, downloads and opens them
Finds branches you are reviewing on crucible to be opened locally

Pics are downloaded to a tmp folder which will be deleted when the script finishes unless otherwise specified
Repos changed for reviewing will be reverted to the original branch when done, unless otherwise specified

## Todo
Finish implementing windowSetup for reviewHandler, so that repos open on the reviewed branch in the editor of your choice
Allow saving file changes to a path, which could then be sent to the author of the reviewed code
