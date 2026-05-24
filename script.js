const SIZE = 15;
const boardEl = document.getElementById("board");

let gameBoard = [];
let currentPlayer = "X";
let gameActive = true;
let mode = "PVP";
let player = "X";
let ai = "O";

// ===== START =====
function startPvP() {
    mode = "PVP";
    startGame();
}

function startPVC(p) {
    mode = "PVC";
    player = p;
    ai = p === "X" ? "O" : "X";
    startGame();
}

function startGame() {
    document.getElementById("menu").classList.add("hide");
    document.getElementById("game").classList.remove("hide");

    currentPlayer = "X";
    gameActive = true;
    document.getElementById("result").innerText = "";

    createBoard();

    if (mode === "PVC" && ai === "X") {
        aiMove();
    }
}

// ===== BOARD =====
function createBoard() {
    boardEl.innerHTML = "";
    gameBoard = [];

    for (let i = 0; i < SIZE; i++) {
        gameBoard[i] = [];
        for (let j = 0; j < SIZE; j++) {
            gameBoard[i][j] = "";

            const cell = document.createElement("div");
            cell.classList.add("box");

            cell.addEventListener("click", () => handleClick(cell, i, j));

            boardEl.appendChild(cell);
        }
    }
}

// ===== CLICK =====
function handleClick(cell, row, col) {
    if (!gameActive || gameBoard[row][col] !== "") return;

    gameBoard[row][col] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWin(row, col)) {
        endGame(currentPlayer + " wins!");
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (mode === "PVC" && currentPlayer === ai) {
        setTimeout(aiMove, 200);
    }
}

// ===== WIN =====
function checkWin(row, col) {
    const dirs = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (let [dx, dy] of dirs) {
        let count = 1;

        for (let d = 1; d < 5; d++) {
            let x = row + dx * d,
                y = col + dy * d;
            if (x >= 0 && x < 15 && y >= 0 && y < 15 && gameBoard[x][y] === currentPlayer)
                count++;
            else break;
        }

        for (let d = 1; d < 5; d++) {
            let x = row - dx * d,
                y = col - dy * d;
            if (x >= 0 && x < 15 && y >= 0 && y < 15 && gameBoard[x][y] === currentPlayer)
                count++;
            else break;
        }

        if (count >= 5) return true;
    }
    return false;
}

// ===== END =====
function endGame(text) {
    gameActive = false;
    document.getElementById("result").innerText = text;
}

// ===== RESTART =====
function restartGame() {
    location.reload();
}

// ===== AI =====
function aiMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let [r, c] of getMoves()) {
        gameBoard[r][c] = ai;

        let score = minimax(3, false, -Infinity, Infinity);

        gameBoard[r][c] = "";

        if (score > bestScore) {
            bestScore = score;
            move = [r, c];
        }
    }

    if (move) {
        gameBoard[move[0]][move[1]] = ai;
        updateUI(move[0], move[1]);

        if (checkWin(move[0], move[1])) {
            endGame("AI wins!");
            return;
        }

        currentPlayer = player;
    }
}

// ===== UPDATE UI =====
function updateUI(r, c) {
    boardEl.children[r * 15 + c].textContent = ai;
}

// ===== MINIMAX =====
function minimax(depth, isMax, alpha, beta) {
    let score = evaluate();

    if (depth === 0 || Math.abs(score) > 50000) return score;

    let moves = getMoves();

    if (isMax) {
        let best = -Infinity;
        for (let [r, c] of moves) {
            gameBoard[r][c] = ai;
            best = Math.max(best, minimax(depth - 1, false, alpha, beta));
            gameBoard[r][c] = "";
            alpha = Math.max(alpha, best);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = Infinity;
        for (let [r, c] of moves) {
            gameBoard[r][c] = player;
            best = Math.min(best, minimax(depth - 1, true, alpha, beta));
            gameBoard[r][c] = "";
            beta = Math.min(beta, best);
            if (beta <= alpha) break;
        }
        return best;
    }
}

// ===== HEURISTIC =====
function evaluate() {
    let score = 0;

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {

            if (gameBoard[i][j] === "") continue;

            let val = getScore(i, j);

            if (gameBoard[i][j] === ai) score += val;
            else score -= val;
        }
    }

    return score;
}

function getScore(row, col) {
    let dirs = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];
    let total = 0;

    for (let [dx, dy] of dirs) {
        let count = 1;

        let x = row + dx,
            y = col + dy;
        while (x >= 0 && x < 15 && y >= 0 && y < 15 && gameBoard[x][y] === gameBoard[row][col]) {
            count++;
            x += dx;
            y += dy;
        }

        x = row - dx;
        y = col - dy;
        while (x >= 0 && x < 15 && y >= 0 && y < 15 && gameBoard[x][y] === gameBoard[row][col]) {
            count++;
            x -= dx;
            y -= dy;
        }

        if (count >= 5) total += 100000;
        else if (count === 4) total += 10000;
        else if (count === 3) total += 1000;
        else if (count === 2) total += 100;
    }

    return total;
}

// ===== MOVE OPTIMIZATION =====
function getMoves() {
    let moves = [];

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {

            if (gameBoard[i][j] !== "") continue;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let x = i + dx,
                        y = j + dy;

                    if (x >= 0 && x < 15 && y >= 0 && y < 15 && gameBoard[x][y] !== "") {
                        moves.push([i, j]);
                        dx = 2;
                        break;
                    }
                }
            }
        }
    }

    return moves.length ? moves : [
        [7, 7]
    ];
}