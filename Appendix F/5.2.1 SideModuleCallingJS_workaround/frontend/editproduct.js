// 예제 F-2 수정된 editproduct.js 파일

const initialData = {
  name: "Women's Mid Rise Skinny Jeans",
  categoryId: "100",
};

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];


// 예제 4-10 수정된 initializePage 함수(editproduct.js)

let moduleMemory = null;
let moduleExports = null;

// 예제 5-3 importObject에 _UpdateHostAboutError 프로퍼티를 추가한다.

function initializePage() {
  document.getElementById("name").value = initialData.name;

  const category = document.getElementById("category");
  const count = category.length;
  for (let index = 0; index < count; index++) {
    if (category[index].value === initialData.categoryId) {
      category.selectedIndex = index;
      break;
    }
  }

  // moduleMemory = new WebAssembly.Memory({initial: 256});

  const importObject = {
    env: {
      // __memory_base: 0,
      // memory: moduleMemory,
      UpdateHostAboutError: function(errorMessagePointer) {
        setErrorMessage(getStringFromMemory(errorMessagePointer));
      },
    }
  };

  WebAssembly.instantiateStreaming(fetch("validate.wasm"), importObject)
  .then(result => {
    moduleExports = result.instance.exports;
    moduleMemory = moduleExports.memory;
  });
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

function onClickSave() {
  setErrorMessage("");

  const name = document.getElementById("name").value;
  const categoryId = getSelectedCategoryId();

  if (validateName(name) &&
      validateCategory(categoryId)) {
    
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


// 예제 5-4 수정된 validateName, validateCategory 함수

function validateName(name) {
  const namePointer = moduleExports.malloc((name.length + 1));
  copyStringToMemory(name, namePointer);

  const isValid = moduleExports.ValidateName(namePointer, MAXIMUM_NAME_LENGTH);

  moduleExports.free(namePointer);
  
  return (isValid === 1);
}

function validateCategory(categoryId) {
  const categoryIdPointer = moduleExports.malloc((categoryId.length + 1));
  copyStringToMemory(categoryId, categoryIdPointer);

  const arrayLength = VALID_CATEGORY_IDS.length;
  const bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
  const arrayPointer = moduleExports.malloc((arrayLength * bytesPerElement));

  const bytesForArray = new Int32Array(moduleMemory.buffer);
  bytesForArray.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));
  
  const isValid = moduleExports.ValidateCategory(categoryIdPointer,
      arrayPointer, arrayLength);

  moduleExports.free(arrayPointer);
  moduleExports.free(categoryIdPointer);

  return (isValid === 1);
}