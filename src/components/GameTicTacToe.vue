<template>
    <div id="leftSide">
        <canvas id="mainCanvas" ref="canvas" @click="handleClick" :width="600" :height="dataGameHeight"></canvas>
        <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    </div>
</template>

<script>
    const gameWidthDefault = 800;
    const gameHeightDefault = 600;
    const tileWidth = 150;
    const boardOffsetX = 50;
    const boardOffsetY = 100;
    const valueOffsetX = 75;
    const valueOffsetY = 75;


    export default {
        name: 'GameTicTacToe',
        props: {
            gameWidth: {
                type: Number,
                required: true
            },
            gameHeight: {
                type: Number,
                required: true
            }
        },

        data() {
            return {
                dataGameWidth: gameWidthDefault,
                dataGameHeight: gameHeightDefault,
                board: [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null],
                ],
                hoveredTile: null,
                playersTurn: true,
                winStreak: null,
            }
        },

        mounted() {
            // This is the canvas context
            this.ctx = this.$refs.canvas.getContext('2d');

            // This is the hidden canvas context
            this.hiddenCanvas = this.$refs.hiddenCanvas;
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');

            window.addEventListener('keydown', this.handleKeyDown);

            this.renderBoard();
        },

        beforeDestroy() {
            window.removeEventListener('keydown', this.handleKeyDown);
        },

        // Moving Props to Data
        // This is dumb but I guess it's better than using ref()'s
        watch: {
            gameWidth: function(newWidth) {
            this.dataGameWidth = newWidth;
            },
            gameHeight: function(newHeight) {
            this.dataGameHeight = newHeight;
            }
        },

        methods: {

            copy (obj) {
                return JSON.parse(JSON.stringify(obj));
            },

            handleKeyDown(event) {
            },

            handleMouseMove(event) {

            },

            handleClick(event) {
                if (!this.playersTurn) {
                    return;
                }

                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);
                if (col < 0 || col > 2 || row < 0 || row > 2) {
                    return;
                } else {
                    if (this.board[row][col] === null) {
                        this.board[row][col] = 'X';
                    }
                }
                console.log(this.board);
                this.renderBoard();

                this.processPlayerMove();
            },

            processPlayerMove() {
                // Check for win
                if (this.checkForWin()) {
                    console.log('Player wins!');
                    this.renderBoard();
                    return;
                }

                // // Check for tie
                // if (this.checkForTie()) {
                //     alert('Tie game!');
                //     this.initializeBoard();
                //     return;
                // }

                // Computer's turn
                //this.playersTurn = false;
                // this.computerMove();
            },

            checkForWin() {
                // Check for horizontal win
                for (let row = 0; row < 3; row++) {
                    if (this.board[row][0] !== null && this.board[row][0] === this.board[row][1] && this.board[row][1] === this.board[row][2]) {
                        this.winStreak = [[row, 0], [row, 1], [row, 2]];
                        return true;
                    }
                }

                // Check for vertical win
                for (let col = 0; col < 3; col++) {
                    if (this.board[0][col] !== null && this.board[0][col] === this.board[1][col] && this.board[1][col] === this.board[2][col]) {
                        this.winStreak = [[0, col], [1, col], [2, col]];
                        return true;
                    }
                }

                // Check for diagonal win
                if (this.board[0][0] !== null && this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2]) {
                    this.winStreak = [[0, 0], [1, 1], [2, 2]];
                    return true;
                }
                if (this.board[0][2] !== null && this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0]) {
                    this.winStreak = [[2, 0], [1, 1], [0, 2]];
                    return true;
                }

                return false;
            },

            clearBoard() {
                // clear the board
                this.initializeBoard();
            },

            arraysAreEqual(arr1, arr2) {
                if (arr1.length !== arr2.length) {
                    return false;
                }
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] !== arr2[i]) {
                        return false;
                    }
                }
                return true;
            },

            renderBoard() {
                // Draw white background to hidden context
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

                // A black text that says "Tic Tac Toe" in the top middle of the screen
                // this.hiddenCtx.textAlign = 'center';
                this.hiddenCtx.font = '40px Arial';
                this.hiddenCtx.fillStyle = 'black';
                this.hiddenCtx.fillText('Tic Tac Toe', 20, 50);

                // // Draw the board as a 3x3 grid.  Tiles are 100x100, white squares with black borders.  Do not draw any other lines, or X's or O's.
                // this.hiddenCtx.strokeStyle = 'black';
                // this.hiddenCtx.lineWidth = 2;
                // for (let i = 0; i < 3; i++) {
                //     for (let j = 0; j < 3; j++) {
                //         this.hiddenCtx.strokeRect(tileWidth * i + boardOffsetX, tileWidth * j + boardOffsetY, tileWidth, tileWidth);
                //     }
                // }

                // Draw thick black lines between the middle two columns and rows
                this.hiddenCtx.lineWidth = 5;
                this.hiddenCtx.beginPath();
                this.hiddenCtx.moveTo(tileWidth + boardOffsetX, boardOffsetY);
                this.hiddenCtx.lineTo(tileWidth + boardOffsetX, tileWidth * 3 + boardOffsetY);
                this.hiddenCtx.stroke();
                this.hiddenCtx.beginPath();
                this.hiddenCtx.moveTo(tileWidth * 2 + boardOffsetX, boardOffsetY);
                this.hiddenCtx.lineTo(tileWidth * 2 + boardOffsetX, tileWidth * 3 + boardOffsetY);
                this.hiddenCtx.stroke();

                this.hiddenCtx.beginPath();
                this.hiddenCtx.moveTo(boardOffsetX, tileWidth + boardOffsetY);
                this.hiddenCtx.lineTo(tileWidth * 3 + boardOffsetX, tileWidth + boardOffsetY);
                this.hiddenCtx.stroke();
                this.hiddenCtx.beginPath();
                this.hiddenCtx.moveTo(boardOffsetX, tileWidth * 2 + boardOffsetY);
                this.hiddenCtx.lineTo(tileWidth * 3 + boardOffsetX, tileWidth * 2 + boardOffsetY);
                this.hiddenCtx.stroke();


                // Draw x's and o's, if any.  X's are red and O's are blue.
                this.hiddenCtx.font = '100px Arial';
                this.hiddenCtx.textAlign = 'center';
                this.hiddenCtx.textBaseline = 'middle';
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const tile = this.board[row][col];
                        if (tile === 'X') {
                            this.hiddenCtx.fillStyle = 'red';
                            this.hiddenCtx.fillText('X', tileWidth * col + boardOffsetX + valueOffsetX, tileWidth * row + boardOffsetY + valueOffsetY);
                        } else if (tile === 'O') {
                            this.hiddenCtx.fillStyle = 'blue';
                            this.hiddenCtx.fillText('O', tileWidth * col + boardOffsetX + valueOffsetX, tileWidth * row + boardOffsetY + valueOffsetY);
                        }
                    }
                }

                // If the winStreak array is not null, draw a thick red line through the three winning tiles
                if (this.winStreak !== null) {
                    this.hiddenCtx.strokeStyle = 'red';
                    this.hiddenCtx.lineWidth = 15;
                    this.hiddenCtx.beginPath();
                    // If the winSteak is horizontal, draw a line through the middle of the three tiles
                    if (this.winStreak[0][0] === this.winStreak[1][0] && this.winStreak[1][0] === this.winStreak[2][0]) {
                        this.hiddenCtx.moveTo(tileWidth * this.winStreak[0][1] + boardOffsetX, tileWidth * this.winStreak[0][0] + boardOffsetY + valueOffsetY);
                        this.hiddenCtx.lineTo(tileWidth * this.winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * this.winStreak[2][0] + boardOffsetY + valueOffsetY);
                    }
                    // If the winStreak is vertical, draw a line through the middle of the three tiles
                    else if (this.winStreak[0][1] === this.winStreak[1][1] && this.winStreak[1][1] === this.winStreak[2][1]) {
                        this.hiddenCtx.moveTo(tileWidth * this.winStreak[0][1] + boardOffsetX + valueOffsetX, tileWidth * this.winStreak[0][0] + boardOffsetY);
                        this.hiddenCtx.lineTo(tileWidth * this.winStreak[2][1] + boardOffsetX + valueOffsetX, tileWidth * this.winStreak[2][0] + boardOffsetY + (valueOffsetY * 2));
                    }
                    // If the winStreak is diagonal from top left to bottom right, draw a line through the middle of the three tiles
                    else if (this.arraysAreEqual(this.winStreak[0], [0,0]) && this.arraysAreEqual(this.winStreak[2], [2,2])) {
                            this.hiddenCtx.moveTo(tileWidth * this.winStreak[0][1] + boardOffsetX, tileWidth * this.winStreak[0][0] + boardOffsetY);
                            this.hiddenCtx.lineTo(tileWidth * this.winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * this.winStreak[2][0] + boardOffsetY + (valueOffsetY * 2));
                    }
                    // If the winStreak is diagonal from top right to bottom left, draw a line through the middle of the three tiles
                    else if (this.arraysAreEqual(this.winStreak[0], [2,0]) && this.arraysAreEqual(this.winStreak[2], [0,2])) {
                            this.hiddenCtx.moveTo(tileWidth * this.winStreak[0][1] + boardOffsetX, tileWidth * this.winStreak[0][0] + boardOffsetY + (valueOffsetY * 2));
                            this.hiddenCtx.lineTo(tileWidth * this.winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * this.winStreak[2][0] + boardOffsetY);
                    }
                    this.hiddenCtx.stroke();
                }




            


                // Draw to main canvas
                this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
            },

        } // methods
    }; // export default

</script>

<style scoped>
    #mainCanvas {
        border: 1px solid black;
    }
    #hiddenCanvas {
        border: 1px solid black;
    }
    #leftSide {
        float: left;
    }
    #rightSide {
        float: right;
    }
    #buttons {
        margin-top: 100px;
    }
    #instructions {
        margin-top: 100px;
    }
    
</style>