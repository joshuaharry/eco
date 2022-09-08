#!/bin/sh

if [ $# != "3" ]; then
  echo "usage: $0 dir1 dir2 step"
  exit 1
fi

dir1=$1
dir2=$2
step=$3

echo "Comparing [$dir1] [$dir2] step [$step]"

echo "Shows the package in [$dir2] but not in [$dir1]..."

rm -f /tmp/diffstep.tmp
touch /tmp/diffstep.tmp

for p in $dir2/*/*; do
  grep "### ECO:STEP $step/" $p > /dev/null
  if [ $? = "0" ]; then
     basename $p >> /tmp/diffstep.tmp
  fi
done

rm -f /tmp/diffstep.res
touch /tmp/diffstep.res

while read -r p; do
  grep -l "### ECO:STEP $step/" $dir1/*/$p > /dev/null
  if [ "$?" != "0" ]; then
    echo $p >> /tmp/diffstep.res
  fi
done < /tmp/diffstep.tmp

sort /tmp/diffstep.res

rm -f /tmp/diffstep.res
rm -f /tmp/diffstep.tmp
