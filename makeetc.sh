#!/bin/bash

echo "Translate all known forks to ETC style forks..."
declare -A forkMap=( ["Byzantium"]="ETC_Atlantis"
                     ["Istanbul"]="ETC_Phoenix"
                     ["ConstantinopleFix"]="ETC_Agharta"
                     ["Berlin"]="ETC_Magneto"
                     ["London"]="ETC_Mystique"
                     ["Merge"]="ETC_Mystique")

function replaceFork()  {
    infile=$1
    ethfork=$2
    etcfork=$3
    if [[ "$infile" == *".yml"* ]]; then
        sed -i -e 's/- '$ethfork'/- '$etcfork'/g' $infile
        sed -i -e 's/\x27'$ethfork'/\x27'$etcfork'/g' $infile
        sed -i -e 's/ '$ethfork':/ '$etcfork':/g' $infile
    fi

    sed -i -e 's/\"'$ethfork'/\"'$etcfork'/g' $infile
    sed -i -e 's/='$ethfork'/='$etcfork'/g' $infile
    sed -i -e 's/>'$ethfork'/>'$etcfork'/g' $infile
    sed -i -e 's/<'$ethfork'/<'$etcfork'/g' $infile
}

function translateFile() {
    infile=$1
    for ethFork in ${!forkMap[@]}
    do    
        replaceFork $infile $ethFork ${forkMap[$ethFork]}
    done
    # Constantinople must be processed after ConstantinopleFix
    replaceFork $infile Constantinople ETC_Agharta
}

replaceForks() {
    job=0
    threads=$1
    sources=`find ./src | grep ".json\|.yml"`
    for eachfile in $sources
    do
        translateFile $eachfile &
        ((job += 1))
        if (( $job == $threads )); then
           wait
           job=0
        fi
    done
}

replaceForks 8

echo "Replace known tests to ETC version..."
sleep 2

etcpatch() {
   echo "Patch $1"
   cp -r  ./src-etc/$1/* ./src/$1
}

etcclean() {
   rm -rf ./$1/*
}

etcpatch "GeneralStateTestsFiller/stRefundTest"
etcpatch "GeneralStateTestsFiller/stBadOpcode"
etcpatch "GeneralStateTestsFiller/stChainId"
etcpatch "GeneralStateTestsFiller/stEIP2930"
etcpatch "GeneralStateTestsFiller/stSStoreTest"
etcpatch "GeneralStateTestsFiller/stExample"

etcclean "src/GeneralStateTestsFiller/stEIP1559"
etcclean "src/GeneralStateTestsFiller/stExpectSection"
etcclean "GeneralStateTests/stEIP1559"
etcclean "BlockchainTests/GeneralStateTests/stEIP1559"
etcpatch "GeneralStateTestsFiller/stEIP1559"
