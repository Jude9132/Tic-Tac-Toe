//  state, stores all variables in an object named state
const state = {
  board:      Array(9).fill(null), 
  current:    'X',
  gameOver:   false,
  vsComputer: false,
  scores:     { X: 0, O: 0, draws: 0 },
};

// possible wins
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],         // diags
];
 
// HTML elements
const cells    = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const modeBtn  = document.getElementById('mode-btn');
const scoreX   = document.getElementById('score-x-num');
const scoreO   = document.getElementById('score-o-num');
const scoreD   = document.getElementById('score-draws-num');
 
// check winner
function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return null;
}
 
function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className   = cls;
}

// renders board
function renderBoard() {
  cells.forEach((cell, i) => {
    const val = state.board[i];
    cell.textContent = val ?? '';
    cell.className   = 'cell' + (val ? ` ${val.toLowerCase()}` : '');
    cell.disabled    = !!val || state.gameOver;
    cell.setAttribute('aria-label', val ? `Cell ${i + 1}: ${val}` : `Cell ${i + 1}`);
  });
}
 
function updateScores() {
  scoreX.textContent = state.scores.X;
  scoreO.textContent = state.scores.O;
  scoreD.textContent = state.scores.draws;
}
 
// MOVES!!! runs everytime a player makes a move, aborts if game is won or player takes a used cell+continues to render game
function handleMove(index) {
  if (state.board[index] || state.gameOver) return;
 
  state.board[index] = state.current;
  renderBoard();
 
  const result = checkWinner(state.board);
  if (result) {
    endGame(result);
    return;
  }
 
  state.current = state.current === 'X' ? 'O' : 'X';
  setStatus(
    state.vsComputer && state.current === 'O'
      ? 'CPU is thinking…'
      : `Player ${state.current}'s turn`,
    `${state.current.toLowerCase()}-turn`
  );
 
  if (state.vsComputer && state.current === 'O') {
    cells.forEach(c => { c.disabled = true; });
    setTimeout(cpuMove, 420);
  }
}
 
function cpuMove() {
  if (state.gameOver) return;
  const move = bestMove(state.board);
  if (move !== -1) handleMove(move);
}
 
function endGame({ winner, line }) {
  state.gameOver = true;
  cells.forEach(c => { c.disabled = true; });
 
  if (winner === 'draw') {
    state.scores.draws++;
    setStatus('It\'s a draw!', 'win');
  } else {
    state.scores[winner]++;
    line.forEach(i => cells[i].classList.add('win'));
    const label = state.vsComputer && winner === 'O' ? 'CPU wins!' : `Player ${winner} wins!`;
    setStatus(label, 'win');
  }
 
  updateScores();
}
 
function resetGame() {
  state.board    = Array(9).fill(null);
  state.current  = 'X';
  state.gameOver = false;
  renderBoard();
  setStatus(`Player X's turn`, 'x-turn');
}

 // AI 
function minimax(board, isMax, depth = 0) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === 'O') return  10 - depth;
    if (result.winner === 'X') return -10 + depth;
    return 0;
  }
 
  const scores = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = isMax ? 'O' : 'X';
    scores.push(minimax(board, !isMax, depth + 1));
    board[i] = null;
  }
 
  return isMax ? Math.max(...scores) : Math.min(...scores);
}
 
function bestMove(board) {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = 'O';
    const score = minimax(board, false);
    board[i] = null;
    if (score > best) { best = score; move = i; }
  }
  return move;
}
 
//Events
cells.forEach(cell => {
  cell.addEventListener('click', () => handleMove(Number(cell.dataset.index)));
});
 
resetBtn.addEventListener('click', resetGame);
 
modeBtn.addEventListener('click', () => {
  state.vsComputer = !state.vsComputer;
  modeBtn.textContent = state.vsComputer ? '2 Players' : 'vs CPU';
  modeBtn.classList.toggle('active', state.vsComputer);
  resetGame();
});
 
// initialise game
renderBoard();
setStatus(`Player X's turn`, 'x-turn');
