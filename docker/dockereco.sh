#!/bin/bash
# run eco inside docker

image=eco
lib=$1
strategy=scotty
dir=`dirname $0`

if [ "$2 " != " " ];then
  strategy = $2
fi

# check if the docker image exists
if [`docker image inspect --format="-" $image` != "-" ]; then
  echo "building docker image  [$image]"
  docker build -f $dir/Dockerfile -t $image
fi  

# run the container
echo "running docker container [$image.$lib]"
docker run -a STDOUT -a STDERR --name $image.$lib $image -c "$image -v -s /home/scotty/.$image/strategies/$strategy -n -d LOG $lib"
docker rm -f $image.$lib
