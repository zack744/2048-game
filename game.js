class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.newGameButton = document.getElementById('new-game');

        this.initEventListeners();
        this.initBoard();
    }

    initEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.newGameButton.addEventListener('click', this.resetGame.bind(this));
        
        // Touch event support
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                diffX > 0 ? this.moveRight() : this.moveLeft();
            } else {
                // Vertical swipe
                diffY > 0 ? this.moveDown() : this.moveUp();
            }
        });
    }

    initBoard() {
        // Initialize empty board
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill(0)
        );
        
        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderBoard();
    }

    addRandomTile() {
        const emptyCells = [];
        
        // Find empty cells
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }
        
        // If empty cells exist, add a new tile
        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance of 2, 10% chance of 4
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    renderBoard() {
        // Clear existing board
        this.gameBoard.innerHTML = '';
        
        // Create tiles
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const tileValue = this.board[r][c];
                const tileElement = document.createElement('div');
                
                tileElement.classList.add('tile');
                if (tileValue !== 0) {
                    tileElement.textContent = tileValue;
                    tileElement.classList.add(`tile-${tileValue}`);
                }
                
                this.gameBoard.appendChild(tileElement);
            }
        }
        
        // Update score
        this.scoreDisplay.textContent = this.score;
    }

    move(direction) {
        let moved = false;
        
        // Rotate board based on direction to simplify logic
        const rotateBoard = (board) => {
            return board[0].map((val, index) => 
                board.map(row => row[index]).reverse()
            );
        };
        
        // Slide and merge tiles
        const slide = (row) => {
            // Remove zeros
            row = row.filter(val => val !== 0);
            
            // Merge tiles
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i+1]) {
                    row[i] *= 2;
                    this.score += row[i];
                    row.splice(i+1, 1);
                }
            }
            
            // Pad with zeros
            while (row.length < this.boardSize) {
                row.push(0);
            }
            
            return row;
        };
        
        // Rotate board to handle different directions
        switch(direction) {
            case 'left':
                this.board = this.board.map(row => slide(row));
                break;
            case 'right':
                this.board = this.board.map(row => slide(row.reverse()).reverse());
                break;
            case 'up':
                this.board = rotateBoard(this.board);
                this.board = this.board.map(row => slide(row));
                this.board = rotateBoard(rotateBoard(rotateBoard(this.board)));
                break;
            case 'down':
                this.board = rotateBoard(this.board);
                this.board = this.board.map(row => slide(row.reverse()).reverse());
                this.board = rotateBoard(rotateBoard(rotateBoard(this.board)));
                break;
        }
        
        // Check if board changed
        this.addRandomTile();
        this.renderBoard();
        this.checkGameOver();
    }

    moveLeft() { this.move('left'); }
    moveRight() { this.move('right'); }
    moveUp() { this.move('up'); }
    moveDown() { this.move('down'); }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft': this.moveLeft(); break;
            case 'ArrowRight': this.moveRight(); break;
            case 'ArrowUp': this.moveUp(); break;
            case 'ArrowDown': this.moveDown(); break;
        }
    }

    checkGameOver() {
        // Check if 2048 is reached
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 2048) {
                    alert('恭喜你！成功达到2048！');
                    return;
                }
            }
        }

        // Check if any moves are possible
        const isMovesPossible = () => {
            // Check for empty cells
            for (let r = 0; r < this.boardSize; r++) {
                for (let c = 0; c < this.boardSize; c++) {
                    if (this.board[r][c] === 0) return true;
                }
            }

            // Check for mergeable tiles
            for (let r = 0; r < this.boardSize; r++) {
                for (let c = 0; c < this.boardSize - 1; c++) {
                    if (this.board[r][c] === this.board[r][c+1]) return true;
                    if (this.board[c][r] === this.board[c+1][r]) return true;
                }
            }

            return false;
        };

        if (!isMovesPossible()) {
            alert('游戏结束！没有更多的移动可能。');
        }
    }

    resetGame() {
        this.score = 0;
        this.initBoard();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
