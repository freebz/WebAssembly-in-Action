(module

  ;; types

  (type $FUNCSIG$v (func))
  (type $FUNCSIG$vi (func (param i32)))
  (type $FUNCSIG$vii (func (param i32 i32)))
  (type $FUNCSIG$viii (func (param i32 i32 i32)))
  (type $FUNCSIG$viiii (func (param i32 i32 i32 i32)))
  (type $FUNCCIG$ii (func (param i32) (result i32)))
  (type $FUNCCIG$iii (func (param i32 i32) (result i32)))

  ;; import


  ;; 예제 11-1 자바스크립트 함수를 임포트하기 위한 import S-표현식
  
  (import "env" "_GenerateCards"
    (func $GenerateCards (param i32 i32 i32 i32))
  )
  (import "env" "_UpdateTriesTotal"
    (func $UpdateTriesTotal (param i32))
  )
  (import "env" "_FlipCard"
    (func $FlipCard (param i32 i32 i32))
  )
  (import "env" "_RemoveCards"
    (func $RemoveCards (param i32 i32 i32 i32))
  )
  (import "env" "_LevelComplete"
    (func $LevelComplete (param i32 i32 i32))
  )
  (import "env" "_Pause" (func $Pause (param i32 i32)))


  ;; 예제 11-2 엠스크립튼 생성 모듈에 있는 import S-표현식

  (import "env" "memory" (memory $memory 256))
  (import "env" "_SeedRandomNumberGenerator"
    (func $SeedRandomNumberGenerator)
  )
  (import "env" "_GetRandomNumber"
    (func $GetRandomNumber (param i32) (result i32))
  )
  (import "env" "_malloc" (func $malloc (param i32) (result i32)))
  (import "env" "_free" (func $free (param i32)))


  ;; global

  (global $MAX_LEVEL i32 (i32.const 3))

  (global $cards (mut i32) (i32.const 0))

  (global $current_level (mut i32) (i32.const 0))
  (global $rows (mut i32) (i32.const 0))
  (global $columns (mut i32) (i32.const 0))
  (global $matches_remaining (mut i32) (i32.const 0))
  (global $tries (mut i32) (i32.const 0))

  (global $first_card_row (mut i32) (i32.const 0))
  (global $first_card_column (mut i32) (i32.const 0))
  (global $first_card_value (mut i32) (i32.const 0))
  (global $second_card_row (mut i32) (i32.const 0))
  (global $second_card_column (mut i32) (i32.const 0))
  (global $second_card_value (mut i32) (i32.const 0))

  (global $execution_paused (mut i32) (i32.const 0))


  ;; export

  (export "_CardSelected" (func $CardSelected))
  (export "_SecondCardSelectedCallback"
    (func $SecondCardSelectedCallback)
  )
  (export "_ReplayLevel" (func $ReplayLevel))
  (export "_PlayNextLevel" (func $PlayNextLevel))


  ;; start

  (start $main)


  ;; code

  ;; 예제 11-3 $InitializeRowsAndColumns 함수
  
  (func $InitializeRowsAndColumns (param $level i32)
    get_local $level
    i32.const 1
    i32.eq
    if
      i32.const 2
      set_global $rows
      i32.const 2
      set_global $columns
    end

    get_local $level
    i32.const 2
    i32.eq
    if
      i32.const 2
      set_global $rows
      i32.const 3
      set_global $columns
    end

    get_local $level
    i32.const 3
    i32.eq
    if
      i32.const 2
      set_global $rows
      i32.const 4
      set_global $columns
    end
  )


  ;; 예제 11-4 $ResetSelectedCardValues 함수

  (func $ResetSelectedCardValues
    i32.const -1
    set_global $first_card_row

    i32.const -1
    set_global $first_card_column

    i32.const -1
    set_global $first_card_value
    
    i32.const -1
    set_global $second_card_row

    i32.const -1
    set_global $second_card_column

    i32.const -1
    set_global $second_card_value
  )


  ;; 예제 11-5 $InitializeCards 함수

  (func $InitializeCards (param $level i32)
    (local $count i32)

    get_local $level
    set_global $current_level

    get_local $level
    call $InitializeRowsAndColumns

    call $ResetSelectedCardValues

    get_global $rows
    get_global $columns
    i32.mul
    set_local $count

    get_local $count
    i32.const 2
    i32.div_s
    set_global $matches_remaining

    get_local $count
    i32.const 2
    i32.shl
    call $malloc
    set_global $cards

    get_local $count
    call $PopulateArray

    get_local $count
    call $ShuffleArray

    get_global 6
    set_global $tries
  )


  ;; 예제 11-6 $PopulateArray 함수

  (func $PopulateArray (param $array_length i32)
    (local $index i32)
    (local $card_value i32)

    i32.const 0
    set_local $index

    i32.const 0
    set_local $card_value

    loop $while-populate
      get_local $index
      call $GetMemoryLocationFromIndex
      get_local $card_value
      i32.store

      get_local $index
      i32.const 1
      i32.add
      set_local $index

      get_local $index
      call $GetMemoryLocationFromIndex
      get_local $card_value
      i32.store

      get_local $card_value
      i32.const 1
      i32.add
      set_local $card_value

      get_local $index
      i32.const 1
      i32.add
      set_local $index

      get_local $index
      get_local $array_length
      i32.lt_s
      if
        br $while-populate
      end
    end $while-populate
  )

  (func $GetMemoryLocationFromIndex (param $index i32) (result i32)
    get_local $index
    i32.const 2
    i32.shl

    get_global $cards
    i32.add
  )


  ;; 예제 11-7 $ShufleArray 함수

  (func $ShuffleArray (param $array_length i32)
    (local $index i32)
    (local $memory_location1 i32)
    (local $memory_location2 i32)
    (local $card_to_swap i32)
    (local $card_value i32)

    call $SeedRandomNumberGenerator

    get_local $array_length
    i32.const 1
    i32.sub
    set_local $index

    loop $while-shuffle
      get_local $index
      i32.const 1
      i32.add
      call $GetRandomNumber
      set_local $card_to_swap

      get_local $index
      call $GetMemoryLocationFromIndex
      set_local $memory_location1

      get_local $card_to_swap
      call $GetMemoryLocationFromIndex
      set_local $memory_location2

      get_local $memory_location1
      i32.load
      set_local $card_value
      
      get_local $memory_location1
      get_local $memory_location2
      i32.load
      i32.store

      get_local $memory_location2
      get_local $card_value
      i32.store

      get_local $index
      i32.const 1
      i32.sub
      set_local $index

      get_local $index
      i32.const 0
      i32.gt_s
      if
        br $while-shuffle
      end
    end $while-shuffle
  )

  (func $PlayLevel (param $level i32)
    get_local $level
    call $InitializeCards

    get_global $rows
    get_global $columns
    get_local $level
    get_global $tries
    call $GenerateCards
  )


  ;; 예제 11-8 $GetCardValue 함수

  (func $GetCardValue (param $row i32) (param $column i32) (result i32)
    get_local $row
    get_global $columns
    i32.mul
    get_local $column
    i32.add

    i32.const 2
    i32.shl
    get_global $cards
    i32.add
    i32.load
  )


  ;; 예제 11-9 $CardSelected 함수

  (func $CardSelected (param $row i32) (param $column i32)
    (local $card_value i32)

    get_global $execution_paused
    i32.const 1
    i32.eq
    if
      return
    end

    get_local $row
    get_local $column
    call $GetCardValue
    set_local $card_value

    get_local $row
    get_local $column
    get_local $card_value
    call $FlipCard

    get_global $first_card_row
    i32.const -1
    i32.eq
    if
      get_local $row
      set_global $first_card_row
      
      get_local $column
      set_global $first_card_column

      get_local $card_value
      set_global $first_card_value
    else
      get_local $row
      get_local $column
      call $IsFirstCard
      if
        return
      end

      get_local $row
      set_global $second_card_row

      get_local $column
      set_global $second_card_column

      get_local $card_value
      set_global $second_card_value

      i32.const 1
      set_global $execution_paused

      i32.const 1024
      i32.const 600
      call $Pause
    end
  )


  ;; 예제 11-10 $IsFirstCard 함수

  (func $IsFirstCard (param $row i32) (param $column i32) (result i32)
    (local $rows_equal i32)
    (local $columns_equal i32)

    get_global $first_card_row
    get_local $row
    i32.eq
    set_local $rows_equal
    
    get_global $first_card_column
    get_local $column
    i32.eq
    set_local $columns_equal

    get_local $rows_equal
    get_local $columns_equal
    i32.and
  )


  ;; 예제 12-2 $SecondCardSelectedCallback 함수(cards.wast)

  (func $SecondCardSelectedCallback
    (local $is_last_level i32)

    get_global $first_card_value
    get_global $second_card_value
    i32.eq
    if
      get_global $first_card_row
      get_global $first_card_column
      get_global $second_card_row
      get_global $second_card_column
      call $RemoveCards

      get_global $matches_remaining
      i32.const 1
      i32.sub
      set_global $matches_remaining
    else
      get_global $first_card_row
      get_global $first_card_column
      i32.const -1
      call $FlipCard

      get_global $second_card_row
      get_global $second_card_column
      i32.const -1
      call $FlipCard
    end

    get_global $tries
    i32.const 1
    i32.add
    set_global $tries

    get_global $tries
    call $UpdateTriesTotal

    call $ResetSelectedCardValues

    i32.const 0
    set_global $execution_paused

    get_global $matches_remaining
    i32.const 0
    i32.eq
    if
      get_global $cards
      call $free

      get_global $current_level
      get_global $MAX_LEVEL
      i32.lt_s
      set_local $is_last_level

      get_global $current_level
      get_global $tries
      get_local $is_last_level
      call $LevelComplete
    end
  )

  (func $ReplayLevel
    get_global $current_level
    call $PlayLevel
  )

  (func $PlayNextLevel
    get_global $current_level
    i32.const 1
    i32.add
    call $PlayLevel
  )

  (func $main
    i32.const 1
    call $PlayLevel
  )


  ;; data

  (data (i32.const 1024) "SecondCardSelectedCallback")

)