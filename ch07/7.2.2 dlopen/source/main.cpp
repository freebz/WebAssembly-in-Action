// 예제 7-2 main.cpp 파일의 헤더부와 extern "C" 블록

#include <cstdlib>

#ifdef __EMSCRIPTEN__
  #include <dlfcn.h>
  #include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef void(*FindPrimes)(int, int);


// 예제 7-3 사이드 모듈의 함수를 호출하는 CalculatePrimes 함수(main.cpp)

void CalculatePrimes(const char* file_name) {
  void* handle = dlopen(file_name, RTLD_NOW);
  if (handle == NULL) { return; }

  FindPrimes find_primes = (FindPrimes)dlsym(handle, "FindPrimes");

  if (find_primes == NULL) { return; }

  find_primes(3, 100000);
  dlclose(handle);
}

int main() {
  emscripten_async_wget("calculate_primes.wasm",
      "calculate_primes.wasm",
      CalculatePrimes,
      NULL);
  
  return 0;
}

#ifdef __cplusplus
}
#endif