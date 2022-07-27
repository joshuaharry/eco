#!/bin/sh
# split a list of packages

all=dt-all

size=100
num=`wc -l $all | awk '{print $1}'`

i=0

while expr $i "<" $num; do
  echo "eco -n -s strategies/scotty.json -f dt-all.$i -d DT-ALL.$i"
  eco -n -s strategies/scotty.json -f dt-all.$i -d DT-ALL.$i
  i=`expr $i "+" 100`
done  

