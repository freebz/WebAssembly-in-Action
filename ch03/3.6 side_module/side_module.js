// 예제 3-4 side_module.wasm을 로드/인스턴스화하는 자바스크립트

const importObject = {
  env: {
    __memory_base: 0,
    __table_base: 0,
    memory: new WebAssembly.Memory({initial: 1, maximum: 10})
  }
};

WebAssembly.instantiateStreaming(fetch("side_module.wasm"),
    importObject).then(result => {
  const value = result.instance.exports.Increment(17);
  console.log(value.toString());
});