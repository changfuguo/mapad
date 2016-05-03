#!/bin/bash

rm -rf output

cd mabox
fis3 --version --no-color

fis3 release -d ../output
