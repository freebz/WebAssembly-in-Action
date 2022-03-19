const initialData = {
  name: "Women's Mid Rise Skinny Jeans",
  categoryId: "100",
};

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];

let validateOnSuccessNameIndex = -1;
let validateOnSuccessCategoryIndex = -1;
let validateOnErrorNameIndex = -1;
let validateOnErrorCategoryIndex = -1;

let validateNameCallbacks = { resolve: null, reject: null };
let validateCategoryCallbacks = { resolve: null, reject: null };


// 예제 6-7 수정된 initializePage 함수(editproduct.js)

let moduleMemory = null;
let moduleExports = null;
let moduleTable = null;

function initializePage() {
  document.getElementById("name").value = initialData.name;

  const category = document.getElementById("category");
  const count = category.MAXIMUM_NAME_LENGTH;
  for (let index = 0; index < count; index++) {
    if (category[index].value === initialData.categoryId) {
      category.selectedIndex = index;
      break;
    }
  }

  moduleMemory = new WebAssembly.Memory({initial: 256});
  moduleTable = new WebAssembly.Table({initial: 1, element: "anyfunc"});

  const importObject = {
    env: {
      __memory_base: 0,
      memory: moduleMemory,
      __table_base: 0,
      table: moduleTable,
      abort: function(i) { throw new Error('abort'); },
    }
  };

  WebAssembly.instantiateStreaming(fetch("validate.wasm"),
      importObject).then(result => {
    moduleExports = result.instance.exports;

    validateOnSuccessNameIndex = addToTable(() => {
      onSuccessCallback(validateNameCallbacks);
    }, 'v');

    validateOnSuccessCategoryIndex = addToTable(() => {
      onSuccessCallback(validateCategoryCallbacks);
    }, 'v');

    validateOnErrorNameIndex = addToTable((errorMessagePointer) => {
      onErrorCallback(validateNameCallbacks, errorMessagePointer);
    }, 'vi');

    validateOnErrorCategoryIndex = addToTable((errorMessagePointer) => {
      onErrorCallback(validateCategoryCallbacks, errorMessagePointer);
    }, 'vi');
  });
}

function addToTable(jsFunction, signature) {
  const index = moduleTable.length;
  moduleTable.grow(1);
  moduleTable.set(index,
      convertJsFunctionToWasm(jsFunction, signature));
  
  return index;
}

// Wraps a JS function as a wasm function with a given signature.
// In the future, we may get a WebAssembly.Function constructor. Until then,
// we create a wasm module that takes the JS function as an import with a given
// signature, and re-exports that as a wasm function.
function convertJsFunctionToWasm(func, sig) {

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    e: {
      f: func
    }
  });
  var wrappedFunc = instance.exports.f;
  return wrappedFunc;
}

function onSuccessCallback(validateCallbacks) {
  validateCallbacks.resolve();
  validateCallbacks.resolve = null;
  validateCallbacks.reject = null;
}

function onErrorCallback(validateCallbacks, errorMessagePointer) {
  const errorMessage = getStringFromMemory(errorMessagePointer);

  validateCallbacks.reject(errorMessage);

  validateCallbacks.resolve = null;
  validateCallbacks.reject = null;
}

function getSelectedCategoryId() {
  const category = document.getElementById("category");
  const index = category.selectedIndex;
  if (index !== -1) { return category[index].value; }

  return "0";
}

function setErrorMessage(error) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerText = error;
  errorMessage.style.display = (error === "" ? "none" : "");
}


// 예제 6-8 수정된 onClickSave 함수 (editproduct.js)

function onClickSave() {
  setErrorMessage("");

  const name = document.getElementById("name").value;
  const categoryId = getSelectedCategoryId();

  Promise.all([
    validateName(name),
    validateCategory(categoryId)
  ])
  .then(() => {

  })
  .catch((error) => {
    setErrorMessage(error);
  });
}


// 예제 6-9 createPointers 함수(editproduct.js)

function createPointers(isForName, resolve, reject, returnPointers) {
  if (isForName) {
    validateNameCallbacks.resolve = resolve;
    validateNameCallbacks.reject = reject;

    returnPointers.onSuccess = validateOnSuccessNameIndex;
    returnPointers.onError = validateOnErrorNameIndex;
  } else {
    validateCategoryCallbacks.resolve = resolve;
    validateCategoryCallbacks.reject = reject;

    returnPointers.onSuccess = validateOnSuccessCategoryIndex;
    returnPointers.onError = validateOnErrorCategoryIndex;
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
  bytes.set(new TextEncoder().encode((value + "\0")),
      memoryOffset);
}


// 예제 6-10 수정된 validateName, validateCategory 함수

function validateName(name) {
  return new Promise(function(resolve, reject) {
    
    const pointers = { onSuccess: null, onError: null };
    createPointers(true, resolve, reject, pointers);

    const namePointer = moduleExports._create_buffer((name.length + 1));
    copyStringToMemory(name, namePointer);

    moduleExports._ValidateName(namePointer, MAXIMUM_NAME_LENGTH,
        pointers.onSuccess, pointers.onError);

    moduleExports._free_buffer(namePointer);
  });
}


// 예제 6-11 수정한 validateCategory 함수(editproduct.js)

function validateCategory(categoryId) {
  return new Promise(function(resolve, reject) {

    const pointers = { onSuccess: null, onError: null };
    createPointers(false, resolve, reject, pointers);

    const categoryIdPointer =
        moduleExports._create_buffer((categoryId.length + 1));
    copyStringToMemory(categoryId, categoryIdPointer);

    const arrayLength = VALID_CATEGORY_IDS.length;
    const bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
    const arrayPointer = moduleExports._create_buffer((arrayLength * bytesPerElement));

    const bytesForArray = new Int32Array(moduleMemory.buffer);
    bytesForArray.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));
  
    moduleExports._ValidateCategory(categoryIdPointer, arrayPointer,
        arrayLength, pointers.onSuccess, pointers.onError);

    moduleExports._free_buffer(arrayPointer);
    moduleExports._free_buffer(categoryIdPointer);
  });
}