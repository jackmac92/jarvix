#! /bin/bash -ex

builder() {
    docker build . -t jarvix-host
}

run() {
    docker run -ti jarvix-host
}

if [[ $(docker images | grep -q jarvix-host) ]]; then
    builder
fi

run

