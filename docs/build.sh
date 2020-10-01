#!/bin/bash

dotfiles=`ls diagrams/source/*.dot`
for dot in $dotfiles; do
  dotbase="$(basename $dot .dot)"
  echo "$dot >> diagrams/$dotbase.png"
  dot -Tpng -odiagrams/$dotbase.png $dot
done