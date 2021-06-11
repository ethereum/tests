#! /bin/bash

# Given a HEX opcode, create a template test for it

op=$1


cat anyBadOpcode.yul | sed s/XX/$op/ > temp.yul
./templateGen.js temp.yul 0x60A7 | sed s/template:/opc${op}Template:/ > ../stBadOpcode/opc${op}TemplateFiller.yml

rm temp.yul
