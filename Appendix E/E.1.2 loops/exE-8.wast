;; 예제 E-8 중첩 S-표현식으로 작성한 GetStringLength 함수(루프로 분기)

(module
  (type $type0 (func (param i32) (result i32)))

  (memory 1)

  (export "memory" (memory 0))
  (export "GetStringLength" (func 0))

  (func (param $param i32) (result i32)
    (local $count i32)
    (local $position i32)

    (set_local $count
      (i32.const 0)
    )

    (set_local $position
      (get_local $param)
    )

    (loop $while
      (if
        (i32.ne
          (i32.load8_s
            (get_local $position)
          )
          (i32.const 0)
        )
        (then
          (set_local $count
            (i32.add
              (get_local $count)
              (i32.const 1)
            )
          )

          (set_local $position
            (i32.add
              (get_local $position)
              (i32.const 1)
            )
          )

          (br $while)
        )
      )
    )

    (get_local $count)
  )
)