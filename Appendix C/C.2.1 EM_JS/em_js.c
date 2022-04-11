#include <emscripten.h>

EM_JS(void, NoReturnValueWithNoParameters, (), {
  console.log("NoReturnValueWithNoParameters called");
});

int main() {
  NoReturnValueWithNoParameters();
  return 0;
}