#!/bin/bash
emcc validate.cpp -s STANDALONE_WASM=1 -O1 -o validate.wasm