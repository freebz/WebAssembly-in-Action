const util = require('util');

const clientData = {
  name: "Women's Mid Rise Skinny Jeans",
  categoryId: "100",
};

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];


let moduleMemory = null;
let moduleExports = null;

const fs = require('fs');
fs.readFile('validate.wasm', function(error, bytes) {
  if (error) { throw error; }

  instantiateWebAssembly(bytes);
})


// 예제 10-4 initializePage를 instantiateWebAssembly로 함수명을 변경한다.

function instantiateWebAssembly(bytes) {
  moduleMemory = new WebAssembly.Memory({initial: 256});

  const importObject = {
    env: {
      __memory_base: 0,
      memory: moduleMemory,
    }
  };

  WebAssembly.instantiate(bytes, importObject).then(result => {
    moduleExports = result.instance.exports;
    validateData();
  });
}

function setErrorMessage(error) { console.log(error); }


// 예제 4-11 onClickSave를 validateData 함수명을 변경한다.

function validateData() {
  let errorMessage = "";
  const errorMessagePointer = moduleExports._create_buffer(256);

  if (!validateName(clientData.name, errorMessagePointer) ||
      !validateCategory(clientData.categoryId, errorMessagePointer)) {
    errorMessage = getStringFromMemory(errorMessagePointer);
  }

  moduleExports._free_buffer(errorMessagePointer);

  setErrorMessage(errorMessage);
  if (errorMessage === "") {
    
  }
}


// 예제 4-12 getStringFromMemory 함수(editproduct.js)

function getStringFromMemory(memoryOffset) {
  let returnValue = "";

  const size = 256;
  const bytes = new Uint8Array(moduleMemory.buffer, memoryOffset, size);

  let character = "";
  for (let i = 0; i < size; i++) {
    character = String.fromCharCode(bytes[i]);
    if (character === "\0") { break; }

    returnValue += character;
  }

  return returnValue;
}

function copyStringToMemory(value, memoryOffset) {
  const bytes = new Uint8Array(moduleMemory.buffer);
  bytes.set(new util.TextEncoder().encode((value + "\0")),
      memoryOffset);
}

function validateName(name, errorMessagePointer) {
  const namePointer = moduleExports._create_buffer((name.length + 1));
  copyStringToMemory(name, namePointer);

  const isValid = moduleExports._ValidateName(namePointer,
      MAXIMUM_NAME_LENGTH, errorMessagePointer);

  moduleExports._free_buffer(namePointer);
  
  return (isValid === 1);
}


// 예제 4-13 validatecategory 함수(editproduct.js)

function validateCategory(categoryId, errorMessagePointer) {
  const categoryIdPointer = moduleExports._create_buffer(
      (categoryId.length + 1));
  copyStringToMemory(categoryId, categoryIdPointer);

  const arrayLength = VALID_CATEGORY_IDS.length;
  const bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
  const arrayPointer = moduleExports._create_buffer(
      (arrayLength * bytesPerElement));

  const bytesForArray = new Int32Array(moduleMemory.buffer);
  bytesForArray.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));
  
  const isValid = moduleExports._ValidateCategory(categoryIdPointer,
      arrayPointer, arrayLength, errorMessagePointer);

  moduleExports._free_buffer(arrayPointer);
  moduleExports._free_buffer(categoryIdPointer);

  return (isValid === 1);
}