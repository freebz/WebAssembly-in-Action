// 예제 B-2 자바스크립트에서 정수형 배열을 모듈에 전달한다

const items = [1, 2, 3, 4];
const arrayLength = items.length;
const bytesPerElement = Module.HEAP32.BYTES_PER_ELEMENT;

const arrayPointer = Module._malloc((arrayLength * bytesPerElement));

Module.HEAP32.set(items, (arrayPointer / bytesPerElement));

Module.ccall('Test',
    null,
    ['number', 'number'],
    [arrayPointer, arrayLength]);

Module._free(arrayPointer);