const board = document.getElementById("board");
const editorControls = document.getElementById("editor-controls");
const turnDisplay = document.getElementById("turn-display");
let mode = "editor";
let editorMode = "black";
let currentPlayer = "black";
let cells = [];

const directions = [
  [-1,-1], [-1,0], [-1,1],
  [0,-1],         [0,1],
  [1,-1], [1,0], [1,1]
];

function setupInitialPosition() {
  setDisc(3, 3, "white");
  setDisc(3, 4, "black");
  setDisc(4, 3, "black");
  setDisc(4, 4, "white");
}

function createBoard() {
  for (let y = 0; y < 8; y++) {
    const row = document.createElement("tr");
    const rowCells = [];
    for (let x = 0; x < 8; x++) {
      const cell = document.createElement("td");
      cell.dataset.state = "empty";
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.onclick = () => onClickCell(cell, x, y);
      row.appendChild(cell);
      rowCells.push(cell);
    }
    board.appendChild(row);
    cells.push(rowCells);
  }
}

function onClickCell(cell, x, y) {
  if (mode === "editor") {
    cell.dataset.state = editorMode;
    cell.innerHTML = "";
    if (editorMode !== "empty") {
      const disc = document.createElement("div");
      disc.className = "disc " + editorMode;
      cell.appendChild(disc);
    }
  } else if (mode === "play") {
    if (!isValidMove(x, y, currentPlayer)) return;
    setDisc(x, y, currentPlayer);
    flipDiscs(x, y, currentPlayer);
    currentPlayer = currentPlayer === "black" ? "white" : "black";
    turnDisplay.textContent = `現在のターン: ${currentPlayer === "black" ? "黒" : "白"}`;
    showValidMoves();
  }
}

function isValidMove(x, y, color) {
  if (cells[y][x].dataset.state !== "empty") return false;
  const opponent = color === "black" ? "white" : "black";

  for (const [dx, dy] of directions) {
    let nx = x + dx, ny = y + dy;
    let hasOpponentBetween = false;

    while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8) {
      const cell = cells[ny][nx];
      if (cell.dataset.state === opponent) {
        hasOpponentBetween = true;
      } else if (cell.dataset.state === color && hasOpponentBetween) {
        return true;
      } else {
        break;
      }
      nx += dx;
      ny += dy;
    }
  }
  return false;
}

function setDisc(x, y, color) {
  const cell = cells[y][x];
  cell.dataset.state = color;
  cell.innerHTML = "";
  const disc = document.createElement("div");
  disc.className = "disc " + color;
  cell.appendChild(disc);
}

function flipDiscs(x, y, color) {
  const opponent = color === "black" ? "white" : "black";
  for (const [dx, dy] of directions) {
    let nx = x + dx, ny = y + dy;
    const toFlip = [];
    while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8) {
      const cell = cells[ny][nx];
      if (cell.dataset.state === opponent) {
        toFlip.push([nx, ny]);
      } else if (cell.dataset.state === color && toFlip.length > 0) {
        toFlip.forEach(([fx, fy]) => setDisc(fx, fy, color));
        break;
      } else {
        break;
      }
      nx += dx;
      ny += dy;
    }
  }
}

function setEditorMode(modeName) {
  editorMode = modeName;
  document.querySelectorAll("#editor-controls .mode-button").forEach(btn => btn.classList.remove("selected"));
  const label = modeName === "black" ? "黒" : modeName === "white" ? "白" : "消去";
  Array.from(document.querySelectorAll("#editor-controls .mode-button"))
    .find(btn => btn.textContent.includes(label))
    .classList.add("selected");
}

function switchToEditor() {
  mode = "editor";
  editorControls.style.display = "block";
  turnDisplay.textContent = "";
  document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("selected"));
  document.querySelector("button[onclick^='switchToEditor']").classList.add("selected");
  setEditorMode(editorMode);
}

function switchToPlay() {
  mode = "play";
  editorControls.style.display = "none";
  currentPlayer = "black";
  turnDisplay.textContent = "現在のターン: 黒";
  document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("selected"));
  document.querySelector("button[onclick^='switchToPlay']").classList.add("selected");
  resetBoard();
  setupInitialPosition();
  showValidMoves();
}

function resetBoard() {
  for (let row of cells) {
    for (let cell of row) {
      cell.dataset.state = "empty";
      cell.innerHTML = "";
    }
  }
}

function showValidMoves() {
  clearValidMoves(); // 古い表示を消してから

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (isValidMove(x, y, currentPlayer)) {
        const hint = document.createElement("div");
        hint.className = "hint";
        cells[y][x].appendChild(hint);
      }
    }
  }
}

function clearValidMoves() {
  document.querySelectorAll(".hint").forEach(hint => hint.remove());
}


createBoard();