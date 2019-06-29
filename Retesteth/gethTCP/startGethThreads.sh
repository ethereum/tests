threads=1
if [ "${1:-0}" -gt 1 ]
then
  threads=$1
fi

echo $threads
for (( i=0; i<$threads; i++ ))
do
  geth retesteth --rpcport $((8545+$i)) &
done
