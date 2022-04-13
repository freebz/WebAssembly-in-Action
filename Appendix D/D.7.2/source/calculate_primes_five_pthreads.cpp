// 예제 D-4 main 함수 (calculate_primes_primes_five_pthreads.cpp)

#include <cstdlib>
#include <cstdio>
#include <vector>
#include <chrono>
#include <pthread.h>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

int IsPrime(int value) {
  if (value == 2) { return 1; }
  if (value <= 1 || value % 2 == 0) { return 0; }

  for (int i = 3; (i * i) <= value; i += 2) {
    if (value % i == 0) { return 0; }
  }

  return 1;
}

void FindPrimes(int start, int end,
    std::vector<int>& primes_found) {
  if (start % 2 == 0) { start++; }

  for (int i = start; i <= end; i += 2) {
    if (IsPrime(i)) {
      primes_found.push_back(i);
    }
  }
  printf("\n");
}

struct thread_args {
  int start;
  int end;
  std::vector<int> primes_found;
};

void* thread_func(void* arg) {
  struct thread_args* args = (struct thread_args*)arg;

  FindPrimes(args->start, args->end, args->primes_found);

  return arg;
}

int main() {
  int start = 3, end = 100000;
  printf("Prime numbers between %d and %d:\n", start, end);

  std::chrono::high_resolution_clock::time_point duration_start =
      std::chrono::high_resolution_clock::now();

  pthread_t thread_ids[5];
  struct thread_args args[5];

  int args_start = 0;

  for (int i = 0; i < 5; i++) {
    args[i].start = args_start;
    args[i].end = (args_start + 199999);

    if (pthread_create(&thread_ids[i], NULL, thread_func, &args[i])) {
      perror("Thread create failed");
      return 1;
    }

    args_start += 200000;
  }

  for (int j = 0; j < 5; j++) {
    pthread_join(thread_ids[j], NULL);
  }

  std::chrono::high_resolution_clock::time_point duration_end =
      std::chrono::high_resolution_clock::now();

  std::chrono::duration<double, std::milli> duration =
      (duration_end - duration_start);

  printf("FindPrimes took %f milliseconds to execute\n", duration.count());

  printf("The values found:\n");
  for (int k = 0; k < 5; k++) {
    for(int n : args[k].primes_found) {
      printf("%d ", n);
    }
  }
  
  printf("\n");

  return 0;
}

#ifdef __cplusplus
}
#endif