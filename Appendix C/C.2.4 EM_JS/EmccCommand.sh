#!/bin/bash
emcc em_js.c -s EXTRA_EXPORTED_RUNTIME_METHODS=['lengthBytesUTF8','stringToUTF8'] \
    -o em_js.html