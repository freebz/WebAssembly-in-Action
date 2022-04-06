const IS_NODE = (typeof process === 'object' &&
    typeof require === 'function');

if (IS_NODE) {
  let chai = null;
  let Module = null;
}
else {
  var Module = {
    onRuntimeInitialized: () => { mocha.run(); }
  };
}

describe('Testing the validate.wasm module from chapter 4', () => {


  // 예제 13-2 before 함수

  before(() => {
    if (IS_NODE) {
      chai = require('chai');

      return new Promise((resolve) => {
        Module = require('./validate.js');
        Module['onRuntimeInitialized'] = () => {
          resolve();
        }
      });
    }
  });


  // 예제 13-3 상품명을 빈 문자열로 입력할 경우 ValidateName 함수를 테스트하는 코드

  it("Pass an empty string", () => {
    const errorMessagePointer = Module._malloc(256);
    const name = "";
    const expectedMessage = "A Product Name must be provided.";

    const isValid = Module.ccall('ValidateName',
        'number',
        ['string', 'number', 'number'],
        [name, 50, errorMessagePointer]);
    
    let errorMessage = "";
    if (isValid === 0) {
      errorMessage = Module.UTF8ToString(errorMessagePointer);
    }

    Module._free(errorMessagePointer);

    chai.expect(errorMessage).to.equal(expectedMessage);
  });


  // 예제 13-4 상품명이 너무 길 경우 ValidateName 함수를 테스트하는 코드

  it("Pass a string that's too long", () => {
    const errorMessagePointer = Module._malloc(256);
    const name = "Longer than 5 characters";
    const expectedMessage = "";

    const isValid = Module.ccall('ValidateName',
        'number',
        ['string', 'number', 'number'],
        [name, 50, errorMessagePointer]);

    let errorMessage = "";
    if (isValid === 0) {
      errorMessage = Module.UTF8ToString(errorMessagePointer);
    }

    Module._free(errorMessagePointer);

    chai.expect(errorMessage).to.equal(expectedMessage);
  });
});