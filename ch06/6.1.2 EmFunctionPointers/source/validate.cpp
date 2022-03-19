#include <cstdlib>
#include <cstring>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef void(*OnSuccess)(void);
typedef void(*OnError)(const char*);

int ValidateValueProvided(const char* value) {
  if ((value == NULL) || (value[0] == '\0')) {
    return 0;
  }

  return 1;
}


// 예제 6-1 함수 포인터를 사용하도록 수정한 ValidateName 함수(validate.cpp)

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif

int ValidateName(char* name, int maximum_length,
    OnSuccess UpdateHostOnSuccess, OnError UpdateHostOnError) {
  if (ValidateValueProvided(name) == 0) {
    UpdateHostOnError("A Product Name must be provided.");
  }
  else if (strlen(name) > maximum_length) {
    UpdateHostOnError("The Product Name is too long.");
  }
  else {
    UpdateHostOnSuccess();
  }
}

int IsCategoryIdInArray(char* selected_category_id,
    int* valid_category_ids,
    int array_length) {
  int category_id = atoi(selected_category_id);
  for (int index = 0; index < array_length; index++) {
    if (valid_category_ids[index] == category_id) {
      return 1;
    }
  }

  return 0;
}


// 예제 6-2 함수 포인터를 사용하도록 수정된 ValidateCategory 함수(validate.cpp)

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif

int ValidateCategory(char* category_id, int* valid_category_ids,
    int array_length, OnSuccess UpdateHostOnSuccess,
    OnError UpdateHostOnError) {
  if (ValidateValueProvided(category_id) == 0) {
    UpdateHostOnError("A Product Category must be selected.");
  }
  else if ((valid_category_ids == NULL) || (array_length == 0)) {
    UpdateHostOnError("There are no Product Categories available.");
  }
  else if (IsCategoryIdInArray(category_id, valid_category_ids,
      array_length) == 0) {
    UpdateHostOnError("The selected Product Category is not valid.");
  }
  else {
    UpdateHostOnSuccess();
  }
}

#ifdef __cplusplus
}
#endif