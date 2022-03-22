// 예제 8-3 validate_order.cpp 파일에 헤더 파일 선언부와 extern "C" 블록을 추가

#include <cstdlib>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

extern int ValidateValueProvided(const char* value, const char* error_message);
extern int IsIdInArray(char* selected_id, int* valid_ids, int array_length);
extern void UpdateHostAboutError(const char* error_message);


// 예제 8-4 ValidateProduct 함수 (validate_order.cpp)

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
int ValidateProduct(char* product_id, int* valid_product_ids, int array_length) {
  if (ValidateValueProvided(product_id, "A Product must be selected.") == 0) {
    return 0;
  }

  if ((valid_product_ids == NULL) || (array_length == 0)) {
    UpdateHostAboutError("There are no Products available.");
    return 0;
  }

  if (IsIdInArray(product_id, valid_product_ids, array_length) == 0) {
    UpdateHostAboutError("The selected Product is not valid.");
    return 0;
  }

  return 1;
}


// 예제 8-5 ValidateQuantity 함수 (validate_order.cpp)

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
int ValidateQuantity(char* quantity) {
  if (ValidateValueProvided(quantity, "A quantity must be provided.") == 0) {
    return 0;
  }

  if (atoi(quantity) <= 0) {
    UpdateHostAboutError("Please enter a valid quantity.");
    return 0;
  }

  return 1;
}

#ifdef __cplusplus
}
#endif