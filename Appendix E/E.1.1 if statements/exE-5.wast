;; 예제 E-5 예제 E-4를 스택 머신 스타일로 작성한 코드

(module
  (type $type0 (func (param i32) (result i32)))
  (export "Test" (func 0))

  (func (param $param i32) (result i32)
    (local $result i32)

    i32.const 10
    set_local $result
    
    get_local $param
    i32.const 0
    i32.eq
    if
      block
        i32.const 5
        set_local $result
      end
    end
      
    get_local $result
  )
)