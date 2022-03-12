function AsmModule() {
  "use asm";  
  return {
    add: function(a, b) {
      a = a | 0;
      b = b | 0;
      return (a + b) | 0;
    }
  }
}