const clientData = {
  isProduct: true,
  name: "Women's Mid Rise Skinny Jeans",
  categoryId: "100",
  productId: "301",
  quantity: "10",
};

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];
const VALID_PRODUCT_IDS = [200, 301];

let validationModule = null;

const Module = require('./validate_core.js');

function initializePage() {
  const moduleName = (clientData.isProduct ?
      'validate_product.wasm' : 'validate_order.wasm');  

  validationModule = new Module({
    dynamicLibraries: [moduleName],
    onRuntimeInitialized: runtimeInitialized,
  });
}


// 예제 D-5 runtimeInitialized 함수(index.js)

function runtimeInitialized() {
  if (clientData.isProduct) {
    if (validateName(clientData.name) &&
        validateCategory(clientData.categoryId)) {

    }
  }
  else {
    if (validateProduct(clientData.productId) &&
        validateQuantity(clientData.quantity)) {

    }
  }
}

global.setErrorMessage = function(error) { console.log(error); }
  

// 예제 8-13 수정된 validateName, validateCategory 함수(index.js)

function validateName(name) {
  const isValid = validationModule.ccall('ValidateName',
    'number',
    ['string', 'number'],
    [name, MAXIMUM_NAME_LENGTH]);

  return (isValid === 1);
}

function validateCategory(categoryId) {
  const arrayLength = VALID_CATEGORY_IDS.length;
  const bytesPerElement = validationModule.HEAP32.BYTES_PER_ELEMENT;
  const arrayPointer = validationModule._malloc((arrayLength * bytesPerElement));
  validationModule.HEAP32.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));
  
  const isValid = validationModule.ccall('ValidateCategory',
      'number',
      ['string', 'number', 'number'],
      [categoryId, arrayPointer, arrayLength]);

  validationModule._free(arrayPointer);

  return (isValid === 1);
}


// 예제 8-15 validateProduct 함수(index.js)

function validateProduct(productId) {
  const arrayLength = VALID_PRODUCT_IDS.length;
  const bytesPerElement = validationModule.HEAP32.BYTES_PER_ELEMENT;
  const arrayPointer = validationModule._malloc((arrayLength * bytesPerElement));
  validationModule.HEAP32.set(VALID_PRODUCT_IDS, (arrayPointer / bytesPerElement));

  const isValid = validationModule.ccall('ValidateProduct',
      'number',
      ['string', 'number', 'number'],
      [productId, arrayPointer, arrayLength]);

  validationModule._free(arrayPointer);

  return (isValid === 1);
}

function validateQuantity(quantity) {
  const isValid = validationModule.ccall('ValidateQuantity', 'number',
      ['string'],
      [quantity]);

  return (isValid === 1);
}

initializePage();