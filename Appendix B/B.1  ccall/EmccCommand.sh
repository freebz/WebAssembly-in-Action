#!/bin/bash
emcc add.c -o js_plumbing.js \
    -s EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap']