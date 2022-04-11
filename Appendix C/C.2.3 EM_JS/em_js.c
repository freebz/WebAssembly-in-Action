#include <stdlib.h>
#include <emscripten.h>

EM_JS(void, NoReturnValueWithStringParameter,
    (const char* string_pointer), {
  console.log("NoReturnValueWithStringParameter called: " +
      Module.UTF8ToString(string_pointer));
});

int main() {
  NoReturnValueWithStringParameter("Hello from WebAssembly");
  return 0;
}