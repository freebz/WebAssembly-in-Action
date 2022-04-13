#!/bin/bash
emcc add.c -s SIDE_MODULE=2 -O1 -o add.wasm
emcc main_dlopen.cpp -s MAIN_MODULE=1 -o main_dlopen.html