#include <stdio.h>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

const int TOTAL_MEMORY = 65536;
const int MAXIMUM_ALLOCATED_CHUNKS = 10;

int current_allocated_count = 0;

struct MemoryAllocated {
  int offset;
  int length;
};

struct MemoryAllocated
    AllocatedMemoryChunks[MAXIMUM_ALLOCATED_CHUNKS];


// 예제 4-6 InsertIntoAllocatedArray 함수(side_module_system_functions.cpp)

void InsertIntoAllocatedArray(int new_item_index, int offset_start,
    int size_needed) {
  for (int i = (MAXIMUM_ALLOCATED_CHUNKS - 1); i > new_item_index; i--) {
    AllocatedMemoryChunks[i] = AllocatedMemoryChunks[(i - 1)];
  }

  AllocatedMemoryChunks[new_item_index].offset = offset_start;
  AllocatedMemoryChunks[new_item_index].length = size_needed;

  current_allocated_count++;
}


// 예제 4-7 malloc 함수를 단순화한 create_buffer 함수(side_module_system_function.cpp)

EMSCRIPTEN_KEEPALIVE
int create_buffer(int size_needed) {
  if (current_allocated_count == MAXIMUM_ALLOCATED_CHUNKS) { return 0; }

  int offset_start = 1024;
  int current_offset = 0;
  int found_room = 0;

  int memory_size = size_needed;
  while (memory_size % 8 != 0) { memory_size++; }

  for (int index = 0; index < current_allocated_count; index++) {
    current_offset = AllocatedMemoryChunks[index].offset;
    if ((current_offset - offset_start) >= memory_size) {
      InsertIntoAllocatedArray(index, offset_start, memory_size);
      found_room = 1;
      break;
    }

    offset_start = (current_offset + AllocatedMemoryChunks[index].length);
  }

  if (found_room == 0) {
    if (((TOTAL_MEMORY - 1) - offset_start) >= size_needed) {
      AllocatedMemoryChunks[current_allocated_count].offset = offset_start;
      AllocatedMemoryChunks[current_allocated_count].length = size_needed;
      current_allocated_count++;
      found_room = 1;
    }
  }

  if (found_room == 1) { return offset_start; }
  return 0;
}


// 예제 4-8 free 함수를 단순화한 free_buffer 함수(side_module_system_functions.cpp)

EMSCRIPTEN_KEEPALIVE
void free_buffer(int offset) {
  int shift_item_left = 0;

  for (int index = 0; index < current_allocated_count; index++) {
    if (AllocatedMemoryChunks[index].offset == offset) {
      shift_item_left = 1;
    }

    if (shift_item_left == 1) {
      if (index < (current_allocated_count - 1)) {
        AllocatedMemoryChunks[index] = AllocatedMemoryChunks[(index + 1)];
      }
      else {
        AllocatedMemoryChunks[index].offset = 0;
        AllocatedMemoryChunks[index].length = 0;
      }
    }
  }

  current_allocated_count--;
}


// 예제 4-9 strcpy, strlen, atoi 함수(side_module_system_functions.cpp)

char* strcpy(char* destination, const char* source) {
  char* return_copy = destination;

  while (*source) { *destination++ = *source++; }
  *destination = 0;

  return return_copy;
}

size_t strlen(const char* value) {
  size_t length = 0;
  while (value[length] != '\0') { length++; }

  return length;
}

int atoi(const char* value) {
  if ((value == NULL) || (value[0] == '\0')) { return 0; }

  int result = 0;
  int sign = 0;

  if (*value == '-') { sign = -1; ++value; }

  char current_value = *value;
  while (current_value != '\0') {
    if ((current_value >= '0') && (current_value <= '9')) {
      result = result * 10 + current_value - '0';
      ++value;
      current_value = *value;
    }
    else {
      return 0;
    }
  }

  if (sign == -1) { result *= -1; }
  return result;
}

#ifdef __cplusplus
}
#endif