// 예제 C-1 문자열을 반환하는 EM_JS 매크로(em_js.c)

#include <stdlib.h>
#include <stdio.h>
#include <emscripten.h>

EM_JS(char*, StringReturnValueWithNoParameters, (), {
  const greetings = "Hello from StringReturnValueWithNoParameters";
  const byteCount = (Module.lengthBytesUTF8(greetings) + 1);
  const greetingsPointer = Module._malloc(byteCount);
  Module.stringToUTF8(greetings, greetingsPointer, byteCount);

  return greetingsPointer;
});

int main() {
  char* greetingsPointer = StringReturnValueWithNoParameters();
  printf("StringReturnValueWithNoParameters was called and it returned the following result: %s\n", greetingsPointer);
  free(greetingsPointer);

  return 0;
}