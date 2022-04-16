const importObject = {
  env: {
    Function1: function() { console.log("Function 1"); },
    Function2: function() { console.log("Function 2"); },
  }
};

const wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
wasmInstance.exports.Test(0);