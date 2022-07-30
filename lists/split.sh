#!/bin/sh
# split a list of packages

all=dt-all

size=100
num=`wc -l $all | awk '{print $1}'`

i=0
j=100
cnt=100

while expr $i "<" $num > /dev/null; do
  cnt=`expr $num "-" $i`

  if expr $cnt ">" 100 > /dev/null; then
    cnt=100
  elif expr $cnt "<" 0 > /dev/null; then
    cnt=`expr $i "-" $num`
  fi

  echo "dt-all.$i $j=$j cnt=$cnt"
  
  head -n $j dt-all | tail -n $cnt > dt-all.$i
  i=`expr $i "+" 100`
  j=`expr $j "+" $cnt`
done  

