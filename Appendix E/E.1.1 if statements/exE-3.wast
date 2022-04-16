;; 예제 E-3 S-표현식 스타일로 if 문 안에서 동치 비교를 하는 예제

(module
  (type $type0 (func (param i32) (result i32)))
  (export "Test" (func 0))

  (func (param $param i32) (result i32)
    (local $result i32)

    (if
      (i32.eq
        (get_local $param)
        (i32.const 0)
      )
      (then
        (set_local $result
          (i32.const 5)
        )
      )
      (else
        (set_local $result
          (i32.const 10)
        )
      )
    )

    (get_local $result)
  )
)