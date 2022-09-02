#!/bin/bash
# run eco inside docker

image=eco
libs=
strategy=scotty.json
logdir=`date +"%Y-%Hh%M"`
ecodir=`dirname $0`

# argument parsing
while : ; do
  case $1 in
    "")
      break;;
      
    -s|--strategy)
      shift;
      strategy = $1;;

    -n|--no-cleanup)
      cleanup = "-n";;

    -j|--cpus)
      shift
      cpus = $1;;

    -d|--log-dir)
      shift
      logdir = $1;;

    -v|--verbose)
      verbose = "-v";;

    -*)
      echo "Unknown argument" >&2;
      exit 1;;

    *)
      libs="$libs $1"
      
  esac
  shift
done

strategydir=`basename $strategy .json`

logpath=$HOME/.eco/$strategydir/$logdir
mkdir -p $logpath

# check if the docker image exists
if [ "`docker image inspect --format=- $image`" != "-" ]; then
  (cd $ecodir; docker build . -t $image)
fi  

# one run
run() {
  lib=$1

  if [ "$verbose " != "-v " ]; then
    echo -n "$image.$lib..."
    docker run --name $image.$lib $image -c "$image $verbose -s /home/scotty/.$image/strategies/$strategy -n -d LOG $lib" > /dev/null
  else
    echo "$image.$lib..."
    docker run -a STDOUT -a STDERR --name $image.$lib $image -c "$image $verbose -s /home/scotty/.$image/strategies/$strategy -n -d LOG $lib"
  fi
  
  docker cp eco.$lib:/home/scotty/.eco/$strategydir/LOG/$lib $logpath
  echo "[$logpath/$lib]"
  
  if [ "$cleanup " != "-n" ]; then
    docker rm -f $image.$lib > /dev/null
  fi
}

# run the container
for lib in $libs; do
  run $lib
done  
