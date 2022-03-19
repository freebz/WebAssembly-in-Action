function logPrime(prime) {
  console.log(prime.toString());
}


// 예제 7-6 두 웹어셈블리 모듈을 내려받아 링크한다.

const isPrimeImportObject = {
  env: {
    __memory_base: 0,
  }
};

WebAssembly.instantiateStreaming(fetch("is_prime.wasm"),
    isPrimeImportObject)
  .then(module => {

    const findPrimesImportObject = {
      env: {
        __memory_base: 0,
        _IsPrime: module.instance.exports._IsPrime,
        _LogPrime: logPrime,
      }
    };

    return WebAssembly.instantiateStreaming(fetch("find_primes.wasm"),
        findPrimesImportObject);
  })
  .then(module => {
    module.instance.exports._FindPrimes(3, 100);
  });