#!/bin/bash
threads=1
if [ "${1:-0}" -gt 1 ]
then
  threads=$1
fi

onexit()
{
    echo "Exit"
    for (( i=0; i<$threads; i++ ))
    do
        kill ${child[i]}
        echo ${child[i]}
    done
}
trap onexit SIGTERM
trap onexit SIGABRT


for (( i=0; i<$threads; i++ ))
do
  geth retesteth --rpcport $((8545+$i)) &
  child[i]=$!
done

for (( i=0; i<$threads; i++ ))
do
    wait "${child[i]}"
done
