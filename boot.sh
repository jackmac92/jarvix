#! /bin/bash -ex

while getopts 'h:p:c' flag; do
  case "${flag}" in
    p) devPort="${OPTARG}" ;;
    c) shouldBuild=true ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

devPort=${devPort:-7442}

run() {
    docker run --rm -d \
        --name jarvix \
        -p "$devPort":"$devPort" \
        jarvix-host
}

build() {
    docker build . -t jarvix-host --build-arg APPPORT="$devPort"
}

if [[ $shouldBuild || $(docker images | grep -c jarvix-host) -eq 0 ]]; then
    build
fi

run && docker logs -f jarvix
