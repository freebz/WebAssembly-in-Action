#!/bin/bash
emcc validate.cpp -s STANDALONE_WASM=1 -O1 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -o validate.wasm