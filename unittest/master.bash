#!/usr/local/bin/bash

#Which
Which="/usr/bin/which"
Grep="`${Which} grep`"
Awk="`${Which} awk`"
Cat="`${Which} cat`"
Sed="`${Which} sed`"
Curl="`${Which} curl`"
Ls="`${Which} ls`"
MD5sum="`${Which} md5`"

#Vars
Green="\033[1;32m"
Red="\033[1;31m"
EndColor="\033[1;37m"

#Include
. bootswatch.bash
