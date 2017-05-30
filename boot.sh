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
    docker run -p "$devPort":"$devPort" jarvix-host
}

build() {
    docker build . -t jarvix-host --build-arg APPPORT="$devPort"
}

if [[ $shouldBuild ]]; then
    build
fi

run
