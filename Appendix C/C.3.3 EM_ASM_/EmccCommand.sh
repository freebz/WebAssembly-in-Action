#!/bin/bash
emcc em_asm_.c -s EXTRA_EXPORTED_RUNTIME_METHODS=['UTF8ToString'] \
    -o em_asm_.html