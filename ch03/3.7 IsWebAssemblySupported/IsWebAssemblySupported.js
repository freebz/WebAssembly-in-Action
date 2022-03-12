// 예제 3-6 웹어셈블리 지원 여부를 판별하는 자바스크립트

function isWebAssemblySupported() {
  try {
    if(typeof WebAssembly === "object") {
      const module = new WebAssembly.Module(new Uint8Array([0x00, 0x61,
          0x73, 0x6D, 0x01, 0x00, 0x00, 0x00]));
      if (module instanceof WebAssembly.Module) {
        const moduleInstance = new WebAssembly.Instance(module);
        return (moduleInstance instanceof WebAssembly.Instance);
      }
    }
  } catch (err) {}

  return false;
}

console.log((isWebAssemblySupported() ? "WebAssembly is supported" :
    "WebAssembly is not supported"));