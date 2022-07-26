#!/bin/sh
# split a list of packages

all=dt-all

size=100
num=`wc -l $all | awk '{print $1}'`

i=0
j=100

while expr $i "<" $num; do
  head -n $j dt-all | tail -n 100 > dt-all.$i
  i=`expr $i "+" 100`
  j=`expr $j "+" 100`
done  

