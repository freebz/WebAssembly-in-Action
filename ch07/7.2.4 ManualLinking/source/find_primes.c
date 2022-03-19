// 예제 3-2 calculate_primes.c

#include <emscripten.h>

extern int IsPrime(int value);

extern void LogPrime(int prime);

// 예제 7-1 새로 작성한 FindPrimes 함수와 수정된 main 함수(calculate_primes.cpp)

EMSCRIPTEN_KEEPALIVE
void FindPrimes(int start, int end) {
  for (int i = start; i <= end; i += 2) {
    if (IsPrime(i)) {
      LogPrime(i);
    }
  }
}