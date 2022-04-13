let moduleMemory = null;
let moduleExports = null;


// 예제 11-13 game.js 파일의 Module 객체 (game.js)

var Module = {
  instantiateWasm: function(importObject, successCallback) {
    moduleMemory = importObject.env.memory;
    let mainInstance = null;

    WebAssembly.instantiateStreaming(fetch("main.wasm"), importObject)
    .then(result => {
      mainInstance = result.instance;

      const sideImportObject = {
        env: {
          memory: moduleMemory,
          _malloc: mainInstance.exports._malloc,
          _free: mainInstance.exports._free,
          _SeedRandomNumberGenerator: mainInstance.exports._SeedRandomNumberGenerator,
          _GetRandomNumber: mainInstance.exports._GetRandomNumber,
          _GenerateCards: generateCards,
          _FlipCard: flipCard,
          _RemoveCards: removeCards,
          _LevelComplete: levelComplete,
          _Pause: pause,
        }
      };

      return WebAssembly.instantiateStreaming(fetch("cards.wasm"), sideImportObject)
    }).then(sideInstanceResult => {
      moduleExports = sideInstanceResult.instance.exports;

      successCallback(mainInstance);
    });

    return {};
  }
};


// 예제 11-14 generateCards 함수 (game.js)

function generateCards(rows, columns, level) {
  document.getElementById("currentLevel").innerHTML = `Level ${level}`;

  let html = "";
  for (let row = 0; row < rows; row++) {
    html += "<div>";

    for (let column = 0; column < columns; column++) {
      html += "<div id=\"" + getCardId(row, column)
          + "\" class=\"CardBack\" onclick=\"onClickCard("
          + row + "," + column + ");\"><span></span></div>";
    }

    html += "</div>";
  }

  document.getElementById("cardContainer").innerHTML = html;
}

function getCardId(row, column) {
  return ("card_" + row + "_" + column);
}

function flipCard(row, column, cardValue) {
  const card = getCard(row, column);
  card.className = "CardBack";

  if (cardValue !== -1) {
    card.className = ("CardFace "
        + getClassForCardValue(cardValue));
  }
}

function getCard(row, column) {
  return document.getElementById(getCardId(row, column));
}

function getClassForCardValue(cardValue) {
  return ("Type" + cardValue);
}

function removeCards(firstCardRow, firstCardColumn,
    secondCardRow, secondCardColumn) {
  let card = getCard(firstCardRow, firstCardColumn);
  card.style.visibility = "hidden";

  card = getCard(secondCardRow, secondCardColumn);
  card.style.visibility = "hidden";
}


// 예제 11-15 levelComplete 함수(game.js)

function levelComplete(level, hasAnotherLevel) {
  document.getElementById("levelComplete").style.display = "";

  document.getElementById("levelSummary").innerText =
      `You've completed level ${level}!`;

  if (!hasAnotherLevel) {
    document.getElementById("playNextLevel").style.display = "none";
  }
}

function pause(callbackNamePointer, milliseconds) {
  window.setTimeout(function() {
    const name = ("_" +
        getStringFromMemory(callbackNamePointer));

    moduleExports[name]();
  }, milliseconds);
}


// 예제 11-16 getStringFromMemory 함수(game.js)

function getStringFromMemory(memoryOffset) {
  let returnValue = "";

  const size = 256;
  const bytes = new Uint8Array(moduleMemory.buffer, memoryOffset, size);

  let character = "";
  for (let i = 0; i < size; i++) {
    character = String.fromCharCode(bytes[i]);
    if (character === "\0") { break; }
    returnValue += character;
  }
  return returnValue;
}

function onClickCard(row, col) {
  moduleExports._CardSelected(row, col);
}

function replayLevel() {
  document.getElementById("levelComplete").style.display = "none";

  moduleExports._ReplayLevel();
}

function playNextLevel() {
  document.getElementById("levelComplete").style.display = "none";

  moduleExports._PlayNextLevel();
}