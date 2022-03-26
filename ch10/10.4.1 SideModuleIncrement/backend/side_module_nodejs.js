const fs = require('fs');
fs.readFile('side_module.wasm', function(error, bytes) {
  if (error) { throw error; }

  instantiateWebAssembly(bytes);
});


// 예제 10-3 instantiateWebassembly 함수

function instantiateWebAssembly(bytes) {
  const importObject = {
    env: {
      __memory_base: 0,
    }
  };

  WebAssembly.instantiate(bytes, importObject).then(result => {
    const value = result.instance.exports.Increment(2);
    console.log(value.toString());
  });
}