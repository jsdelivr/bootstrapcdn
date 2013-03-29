#!/usr/local/bin/bash

Latest="`$Ls -l ../bootswatch/latest |$Awk {'print $11'}`";

echo -e "Check if Glyphicons is present on ${Green}$Latest ${EndColor}";

for s in glyphicons-halflings.png glyphicons-halflings-white.png; do
	echo -e $s && $Curl -sI http://netdna.bootstrapcdn.com/bootswatch/latest/img/${s} |$Awk 'NR == 1';
done;

$MD5sum

echo -e "${Green}Pass ${EndColor}"
