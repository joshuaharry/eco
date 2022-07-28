#!/bin/sh
#*=====================================================================*/
#*    serrano/prgm/project/jscontract/eco/lists/eco-statistics.sh      */
#*    -------------------------------------------------------------    */
#*    Author      :  Manuel Serrano                                    */
#*    Creation    :  Thu Jul 28 08:45:39 2022                          */
#*    Last change :  Thu Jul 28 10:34:02 2022 (serrano)                */
#*    Copyright   :  2022 Manuel Serrano                               */
#*    -------------------------------------------------------------    */
#*    Generate ECO statistics.                                         */
#*    Usage:                                                           */
#*      eco-statistics.sh [logdir]                                     */
#*                                                                     */
#*    Example:                                                         */
#*      eco-statistics.sh $HOME/.eco/JavaScript                        */
#*=====================================================================*/

# command line parsing
if [ "$1 " != " " ]; then
  LOGDIR=$1
else  
  LOGDIR=$HOME/.eco/JavaScript
fi  

echo "{"

# number of packages
pkgnum=`find $LOGDIR -type f -print | wc -l`
echo "  \"numPackages\": $pkgnum,"

# packages without git repo
nogit=`grep -l "ECO-FATAL-ERROR:no-git" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"codeMissing\": $nogit,"

# packages that reach step 2 (git repo found)
step1=`grep -l "ECO:STEP 2/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step1Pass\": $step1,"

# packages that reach step 3 (Dependencies installed)
step2=`grep -l "ECO:STEP 3/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step2Pass\": $step2,"

# packages that reach step 4 (unit tests pass)
step3=`grep -l "ECO:STEP 4/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step3Pass\": $step3,"

# packages that reach step 5 (unit tests + identity pass)
step4=`grep -l "ECO:STEP 5/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step4Pass\": $step4,"

# packages that reach step 6 (unit tests + neutral contract pass)
step5=`grep -l "ECO:STEP 6/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step5Pass\": $step5,"

# packages that reach step 7 (test complete)
step6=`grep -l "ECO:STEP 7/" $LOGDIR/DT-ALL.*/* | wc -l`
echo "  \"step6Pass\": $step6,"

echo "}"
