#! /bin/bash -ex

builder() {
    docker build . -t jarvix-host
}

run() {
    docker run -p 7442:7442 jarvix-host
}

if [[ $(docker images | grep -q jarvix-host) ]]; then
    builder
fi

run
