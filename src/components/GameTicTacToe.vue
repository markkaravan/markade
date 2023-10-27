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
                completionState: null,
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
                // If you press spacebar and the game is over, reset the board
                if (event.keyCode === 32 && this.completionState !== null) {
                    this.initializeBoard();
                }
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
                    this.renderBoard();
                    return;
                }

                this.playersTurn = false;
                this.computerMove();

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

            computerMove() {
                // computer picks a random open tile
                let row, col;
                do {
                    row = Math.floor(Math.random() * 3);
                    col = Math.floor(Math.random() * 3);
                } while (this.board[row][col] !== null);
                this.board[row][col] = 'O';
                this.playersTurn = true;
                this.renderBoard();

                // Check for win
                if (this.checkForWin()) {
                    this.renderBoard();
                    return;
                }
            },

            initializeBoard() {
                this.board = [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null],
                ];
                this.completionState = null;
                this.playersTurn = true;
                this.renderBoard();
            },

            checkForWin() {
                // Check for horizontal win
                for (let row = 0; row < 3; row++) {
                    if (this.board[row][0] !== null && this.board[row][0] === this.board[row][1] && this.board[row][1] === this.board[row][2]) {
                        this.completionState = {
                            winner: this.board[row][0],
                            winStreak: [[row, 0], [row, 1], [row, 2]]
                        };
                        return true;
                    }
                }

                // Check for vertical win
                for (let col = 0; col < 3; col++) {
                    if (this.board[0][col] !== null && this.board[0][col] === this.board[1][col] && this.board[1][col] === this.board[2][col]) {
                        this.completionState = {
                            winner: this.board[0][col],
                            winStreak: [[0, col], [1, col], [2, col]]
                        };
                        return true;
                    }
                }

                // Check for diagonal win
                if (this.board[0][0] !== null && this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2]) {
                    this.completionState = {
                        winner: this.board[0][0],
                        winStreak: [[0, 0], [1, 1], [2, 2]]
                    };
                    return true;
                }

                if (this.board[0][2] !== null && this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0]) {
                    this.completionState = {
                        winner: this.board[0][2],
                        winStreak: [[2, 0], [1, 1], [0, 2]]
                    };
                    console.log("LL TR disagonal", this.completionState);
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
                            this.hiddenCtx.fillStyle = 'green';
                            this.hiddenCtx.fillText('X', tileWidth * col + boardOffsetX + valueOffsetX, tileWidth * row + boardOffsetY + valueOffsetY);
                        } else if (tile === 'O') {
                            this.hiddenCtx.fillStyle = 'blue';
                            this.hiddenCtx.fillText('O', tileWidth * col + boardOffsetX + valueOffsetX, tileWidth * row + boardOffsetY + valueOffsetY);
                        }
                    }
                }

                // If the winStreak array is not null, draw a thick red line through the three winning tiles
                if (this.completionState && this.completionState.winner !== null) {
                    const strokeColor = this.completionState.winner === 'X' ? 'green' : 'blue';
                    let winStreak = this.completionState.winStreak;
                    this.hiddenCtx.strokeStyle = strokeColor;
                    this.hiddenCtx.lineWidth = 15;
                    this.hiddenCtx.beginPath();
                    // If the winStreak is horizontal, draw a line through the middle of the three tiles
                    if (winStreak[0][0] === winStreak[1][0] && winStreak[1][0] === winStreak[2][0]) {
                        this.hiddenCtx.moveTo(tileWidth * winStreak[0][1] + boardOffsetX, tileWidth * winStreak[0][0] + boardOffsetY + valueOffsetY);
                        this.hiddenCtx.lineTo(tileWidth * winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * winStreak[2][0] + boardOffsetY + valueOffsetY);
                    }
                    // If the winStreak is vertical, draw a line through the middle of the three tiles
                    else if (winStreak[0][1] === winStreak[1][1] && winStreak[1][1] === winStreak[2][1]) {
                        this.hiddenCtx.moveTo(tileWidth * winStreak[0][1] + boardOffsetX + valueOffsetX, tileWidth * winStreak[0][0] + boardOffsetY);
                        this.hiddenCtx.lineTo(tileWidth * winStreak[2][1] + boardOffsetX + valueOffsetX, tileWidth * winStreak[2][0] + boardOffsetY + (valueOffsetY * 2));
                    }
                    // If the winStreak is diagonal from top left to bottom right, draw a line through the middle of the three tiles
                    else if (this.arraysAreEqual(winStreak[0], [0,0]) && this.arraysAreEqual(winStreak[2], [2,2])) {
                            this.hiddenCtx.moveTo(tileWidth * winStreak[0][1] + boardOffsetX, tileWidth * winStreak[0][0] + boardOffsetY);
                            this.hiddenCtx.lineTo(tileWidth * winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * winStreak[2][0] + boardOffsetY + (valueOffsetY * 2));
                    }
                    // If the winStreak is diagonal from bottom left to top right, draw a line through the middle of the three tiles
                    else if (this.arraysAreEqual(winStreak[0], [2,0]) && this.arraysAreEqual(winStreak[2], [0,2])) {
                            this.hiddenCtx.moveTo(tileWidth * winStreak[0][1] + boardOffsetX, tileWidth * winStreak[0][0] + boardOffsetY + (valueOffsetY * 2));
                            this.hiddenCtx.lineTo(tileWidth * winStreak[2][1] + boardOffsetX + (valueOffsetX * 2), tileWidth * winStreak[2][0] + boardOffsetY);
                    }
                    this.hiddenCtx.stroke();


            



                    // Draw a rectangle with a white interior and a black border in the middle of the screen
                    this.hiddenCtx.fillStyle = 'white';
                    this.hiddenCtx.fillRect(this.gameWidth / 2 - 275, 170, 300, 100);
                    this.hiddenCtx.strokeStyle = 'black';
                    this.hiddenCtx.lineWidth = 5;
                    this.hiddenCtx.strokeRect(this.gameWidth / 2 - 275, 170, 300, 100);
                    

                    this.hiddenCtx.font = '40px Arial';
                    this.hiddenCtx.fillStyle = 'black';
                    this.hiddenCtx.fillText(`${this.completionState.winner} wins!`, this.gameWidth / 2 - 125, 200);

                    this.hiddenCtx.font = '20px Arial';
                    this.hiddenCtx.fillStyle = 'black';
                    this.hiddenCtx.fillText("Press spacebar to play again", this.gameWidth / 2 - 125, 250);

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