const initialProductData = {
  name: "Women's Mid Rise Skinny Jeans",
  categoryId: "100",
};

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];
const VALID_PRODUCT_IDS = [200, 301];

let productModule = null;
let orderModule = null;


// 예제 8-9 수정된 initializePage 함수(index.js)

function initializePage() {
  document.getElementById("name").value = initialProductData.name;

  const category = document.getElementById("category");
  const count = category.length;
  for (let index = 0; index < count; index++) {
    if (category[index].value === initialProductData.categoryId) {
      category.selectedIndex = index;
      break;
    }
  }

  let showEditProduct = true;
  if ((window.location.hash) &&
      (window.location.hash.toLowerCase() === "#placeorder")) {
    showEditProduct = false;
  }

  switchForm(showEditProduct);
}


// 예제 8-10 switchForm 함수(index.js)

function switchForm(showEditProduct) {
  setErrorMessage("");
  setActiveNavLink(showEditProduct);
  setFormTitle(showEditProduct);

  if (showEditProduct) {
    if (productModule === null) {
      productModule = new Module({
        dynamicLibraries: ['validate_product.wasm']
      });
    }

    showElement("productForm", true);
    showElement("orderForm", false);
  } else {
    if (orderModule === null) {
      orderModule = new Module({
        dynamicLibraries: ['validate_order.wasm']
      });
    }

    showElement("productForm", false);
    showElement("orderForm", true);
  }
}


// 예제 8-11 setActiveNavLink 함수(index.js)

function setActiveNavLink(editProduct) {
  const navEditProduct = document.getElementById("navEditProduct");
  const navPlaceOrder = document.getElementById("navPlaceOrder");
  navEditProduct.classList.remove("active");
  navPlaceOrder.classList.remove("active");

  if (editProduct) { navEditProduct.classList.add("active"); }
  else { navPlaceOrder.classList.add("active"); }
}

function setFormTitle(editProduct) {
  const title = (editProduct ? "Edit Product" : "Place Order");
  document.getElementById("formTitle").innerText = title;
}

function showElement(elementId, show) {
  const element = document.getElementById(elementId);
  element.style.display = (show ? "" : "none");
}

function getSelectedDropdownId(elementId) {
  const dropdown = document.getElementById(elementId);
  const index = dropdown.selectedIndex;
  if (index !== -1) { return dropdown[index].value; }

  return "0";
}

function setErrorMessage(error) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerText = error;
  showElement("errorMessage", (error !== ""));
}


// 예제 8-12 onClickSaveProduct로 이름이 변경된 onClickSave 함수(index.js)

function onClickSaveProduct() {
  setErrorMessage("");

  const name = document.getElementById("name").value;
  const categoryId = getSelectedDropdownId("category");

  if (validateName(name) && validateCategory(categoryId)) {
    
  }
}


// 예제 8-13 수정된 validateName, validateCategory 함수(index.js)

function validateName(name) {
  const isValid = productModule.ccall('ValidateName',
    'number',
    ['string', 'number'],
    [name, MAXIMUM_NAME_LENGTH]);

  return (isValid === 1);
}

function validateCategory(categoryId) {
  const arrayLength = VALID_CATEGORY_IDS.length;
  const bytesPerElement = productModule.HEAP32.BYTES_PER_ELEMENT;
  const arrayPointer = productModule._malloc((arrayLength * bytesPerElement));
  productModule.HEAP32.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));
  
  const isValid = productModule.ccall('ValidateCategory',
      'number',
      ['string', 'number', 'number'],
      [categoryId, arrayPointer, arrayLength]);

  productModule._free(arrayPointer);

  return (isValid === 1);
}


// 예제 8-14 onClickAddToCart 함수(index.js)

function onClickAddToCart() {
  setErrorMessage("");

  const productId = getSelectedDropdownId("product");
  const quantity = document.getElementById("quantity").value;

  if (validateProduct(productId) &&
    validateQuantity(quantity)) {

  }
}


// 예제 8-15 validateProduct 함수(index.js)

function validateProduct(productId) {
  const arrayLength = VALID_PRODUCT_IDS.length;
  const bytesPerElement = orderModule.HEAP32.BYTES_PER_ELEMENT;
  const arrayPointer = orderModule._malloc((arrayLength * bytesPerElement));
  orderModule.HEAP32.set(VALID_PRODUCT_IDS, (arrayPointer / bytesPerElement));

  const isValid = orderModule.ccall('ValidateProduct',
      'number',
      ['string', 'number', 'number'],
      [productId, arrayPointer, arrayLength]);

  orderModule._free(arrayPointer);

  return (isValid === 1);
}

function validateQuantity(quantity) {
  const isValid = orderModule.ccall('ValidateQuantity', 'number',
      ['string'],
      [quantity]);

  return (isValid === 1);
}