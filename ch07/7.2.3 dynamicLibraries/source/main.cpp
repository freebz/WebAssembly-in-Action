// 예제 7-4 헤더 파일 선언부와 extern "C" 블록 시작부(main.cpp)

#include <cstdlib>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

extern void FindPrimes(int start, int end);

int main() {
  FindPrimes(3, 99);

  return 0;
}

#ifdef __cplusplus
}
#endif