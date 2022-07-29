#!/bin/sh
# run eco on the split lists
#    usage: eco-all-lists.sh [-n] [index]
#    index, if provided should be a multple of 100
all=dt-all
cleanup=

if [ ! -f dt-all ]; then
  echo "*** ERROR: cannot find dt-all, should run in the list directory."
  exit 1;
fi

if [ "$1 " = "-n " ]; then
  cleanup=-n
  shift
fi  

if [ "$1" != "" ]; then
  i=$1
else
  i=0
fi

size=100
num=`wc -l $all | awk '{print $1}'`

while expr $i "<" $num; do
  echo "====== eco $cleanup -s strategies/scotty.json -f dt-all.$i -d DT-ALL.$i"
  eco $cleanup -s ../strategies/scotty.json -f dt-all.$i -d DT-ALL.$i

  # cleanup npm cache that grows too big
  npm cache clean --force

  # if no cleanup asked for each package individually, remove package
  # dependencies to limit disk space
  if [ "$cleanup " = "-n "]; then
    for f in `cat dt-all.$i`; do
      (cd $HOME/.eco/sandbox/$p; rm -rf node_modules)
    done
  fi
  
  i=`expr $i "+" 100`
done  

