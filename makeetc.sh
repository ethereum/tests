#!/bin/bash

echo "Translate all known forks to ETC style forks..."
sleep 2

function translateFile() {
    if [[ "$1" == *".yml"* ]]; then
        sed -i -e 's/- Byzantium/- ETC_Atlantis/g' $1
        sed -i -e 's/\x27Byzantium/\x27ETC_Atlantis/g' $1
        sed -i -e 's/ Byzantium:/ ETC_Atlantis:/g' $1

        sed -i -e 's/- Istanbul/- ETC_Phoenix/g' $1
        sed -i -e 's/\x27Istanbul/\x27ETC_Phoenix/g' $1
        sed -i -e 's/ Istanbul:/ ETC_Phoenix:/g' $1

        sed -i -e 's/- ConstantinopleFix/- ETC_Agharta/g' $1
        sed -i -e 's/\x27ConstantinopleFix/\x27ETC_Agharta/g' $1
        sed -i -e 's/ ConstantinopleFix:/ ETC_Agharta:/g' $1

        sed -i -e 's/- Constantinople/- ETC_Agharta/g' $1
        sed -i -e 's/\x27Constantinople/\x27ETC_Agharta/g' $1
        sed -i -e 's/ Constantinople:/ ETC_Agharta:/g' $1

        sed -i -e 's/- Berlin/- ETC_Magneto/g' $1
        sed -i -e 's/\x27Berlin/\x27ETC_Magneto/g' $1
        sed -i -e 's/ Berlin:/ ETC_Magneto:/g' $1

        sed -i -e 's/- London/- ETC_Mystique/g' $1
        sed -i -e 's/\x27London/\x27ETC_Mystique/g' $1
        sed -i -e 's/ London:/ ETC_Mystique:/g' $1


        sed -i -e 's/- Merge/- ETC_Mystique/g' $1
        sed -i -e 's/\x27Merge/\x27ETC_Mystique/g' $1
        sed -i -e 's/ Merge:/ ETC_Mystique:/g' $1
   fi

        sed -i -e 's/\"Byzantium/\"ETC_Atlantis/g' $1
        sed -i -e 's/=Byzantium/=ETC_Atlantis/g' $1
        sed -i -e 's/>Byzantium/>ETC_Atlantis/g' $1
        sed -i -e 's/<Byzantium/<ETC_Atlantis/g' $1

        sed -i -e 's/\"Istanbul/\"ETC_Phoenix/g' $1
        sed -i -e 's/=Istanbul/=ETC_Phoenix/g' $1
        sed -i -e 's/>Istanbul/>ETC_Phoenix/g' $1
        sed -i -e 's/<Istanbul/<ETC_Phoenix/g' $1

        sed -i -e 's/\"ConstantinopleFix/\"ETC_Agharta/g' $1
        sed -i -e 's/=ConstantinopleFix/=ETC_Agharta/g' $1
        sed -i -e 's/>ConstantinopleFix/>ETC_Agharta/g' $1
        sed -i -e 's/<ConstantinopleFix/<ETC_Agharta/g' $1

        sed -i -e 's/\"Constantinople/\"ETC_Agharta/g' $1
        sed -i -e 's/=Constantinople/=ETC_Agharta/g' $1
        sed -i -e 's/>Constantinople/>ETC_Agharta/g' $1
        sed -i -e 's/<Constantinople/<ETC_Agharta/g' $1

        sed -i -e 's/\"Berlin/\"ETC_Magneto/g' $1
        sed -i -e 's/=Berlin/=ETC_Magneto/g' $1
        sed -i -e 's/>Berlin/>ETC_Magneto/g' $1
        sed -i -e 's/<Berlin/<ETC_Magneto/g' $1

        sed -i -e 's/\"London/\"ETC_Mystique/g' $1
        sed -i -e 's/=London/=ETC_Mystique/g' $1
        sed -i -e 's/>London/>ETC_Mystique/g' $1
        sed -i -e 's/<London/<ETC_Mystique/g' $1

        sed -i -e 's/\"Merge/\"ETC_Mystique/g' $1
        sed -i -e 's/=Merge/=ETC_Mystique/g' $1
        sed -i -e 's/>Merge/>ETC_Mystique/g' $1
        sed -i -e 's/<Merge/<ETC_Mystique/g' $1
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
etcclean "GeneralStateTests/stEIP1559"
etcclean "BlockchainTests/GeneralStateTests/stEIP1559"
etcpatch "GeneralStateTestsFiller/stEIP1559"
