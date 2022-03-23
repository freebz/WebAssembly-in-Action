let compiledModule = null;
let emscriptenModule = null;

const worker = new Worker("prefetch.worker.js");
worker.onmessage = function(e) {
  compiledModule = e.data;

  emscriptenModule = new Module({
    instantiateWasm: onInstantiateWasm
  });
}

function onInstantiateWasm(importObject, successCallback) {
  WebAssembly.instantiate(compiledModule, importObject)
      .then(instance => successCallback(instance));

  return {};
}