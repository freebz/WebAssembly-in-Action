const wasmInstance = new WebAssembly.Instance(wasmModule, {});
console.log(wasmInstance.exports.Test(4));