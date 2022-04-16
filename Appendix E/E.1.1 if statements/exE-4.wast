;; 예제 E-4 then 대신 block 문을 사용한 if 문 예제

(module
  (type $type0 (func (param i32) (result i32)))
  (export "Test" (func 0))

  (func (param $param i32) (result i32)
    (local $result i32)
    (set_local $result
      (i32.const 10)
    )

    (if
      (i32.eq
        (get_local $param)
        (i32.const 0)
      )
      (block
        (set_local $result
          (i32.const 5)
        )
      )
    )

    (get_local $result)
  )
)