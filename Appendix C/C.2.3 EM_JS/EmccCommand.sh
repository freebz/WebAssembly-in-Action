#!/bin/bash
emcc em_js.c -s EXTRA_EXPORTED_RUNTIME_METHODS=['UTF8ToString'] \
    -o em_js.html