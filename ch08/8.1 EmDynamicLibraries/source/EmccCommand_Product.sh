#!/bin/bash
emcc validate_product.cpp -s SIDE_MODULE=2 -O1 \
    -o validate_product.wasm