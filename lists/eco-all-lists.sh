#!/bin/sh
# run eco on the split lists
#    usage: eco-all-lists.sh [index]
#    index, if provided should be a multple of 100
all=dt-all

if [ !-f dt-all ]; then
  echo "*** ERROR: cannot find dt-all, should run in the list directory."
  exit 1;
fi

if [ "$1" != "" ]; then
  i=$1
else
  i=0
fi

size=100
num=`wc -l $all | awk '{print $1}'`


while expr $i "<" $num; do
  echo "====== eco -n -s strategies/scotty.json -f dt-all.$i -d DT-ALL.$i"
  eco -n -s ../strategies/scotty.json -f dt-all.$i -d DT-ALL.$i
  i=`expr $i "+" 100`
done  

