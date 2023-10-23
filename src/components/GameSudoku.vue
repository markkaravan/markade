<template>
    <div id="leftSide">
        <canvas id="mainCanvas" ref="canvas" @click="handleClick" :width="600" :height="dataGameHeight"></canvas>
        <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    </div>

    <!-- <div id="rightSide">
        <div id="buttons">
            <button id="easyButton" @click="generateEasyPuzzle">Generate Easy Puzzle</button>
            <button id="mediumButton" @click="generateMediumPuzzle">Generate Medium Puzzle</button>
            <button id="hardButton" @click="generateHardPuzzle">Generate Hard Puzzle</button>
            <button id="clearButton" @click="clearBoard">Clear</button>
            <button id="solveButton" @click="solveBoard">Solve</button>
        </div>
        <div id="instructions">
            <p>Instructions:</p>
            <p>Click on a tile to select it. Use the arrow keys to move the selection around the board.</p>
            <p>Press a number key to enter a value into the selected tile.</p>
            <p>Press the spacebar to toggle "inspect mode". In inspect mode, the selected tile's details are shown in the console.</p>
            <p>Press the "Generate Easy Puzzle" button to generate a new puzzle.</p>
            <p>Press the "Clear" button to clear the board.</p>
            <p>Press the "Solve" button to solve the puzzle.</p>
        </div>
    </div> -->
</template>

<script>
    const gameWidthDefault = 800;
    const gameHeightDefault = 600;
    const boardOffsetX = 50;
    const boardOffsetY = 100;
    const tileWidth = 50;
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonColor = 'lightgray';
    const buttonOffsetX = 550;
    const buttonOffsetY = 100;
    const buttonFont = '20px Arial';
    const buttonTextColor = 'black';

    const sudokuPuzzles = [
        {   name: "Easy1",
            board:
                [
                    [5, 0, 3, 9, 0, 0, 0, 7, 0],
                    [8, 0, 2, 6, 1, 0, 5, 0, 9],
                    [6, 0, 0, 0, 5, 7, 8, 0, 1],
                    [0, 2, 6, 0, 7, 0, 4, 1, 0],
                    [0, 5, 0, 0, 2, 0, 7, 0, 3],
                    [3, 0, 7, 0, 6, 0, 0, 0, 8],
                    [0, 0, 0, 7, 0, 0, 0, 9, 0],
                    [0, 6, 9, 0, 0, 2, 0, 5, 7],
                    [0, 0, 5, 0, 0, 6, 0, 0, 4]
                ]
        }
    ];
    

    export default {
        name: 'GameSudoku',
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
                board: [],
                isPaused: false,
                inspectMode: true,
            }
        },

        mounted() {
            // This is the canvas context
            this.ctx = this.$refs.canvas.getContext('2d');

            // This is the hidden canvas context
            this.hiddenCanvas = this.$refs.hiddenCanvas;
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');

            window.addEventListener('keydown', this.handleKeyDown);

            this.initializeBoard();

            this.gameLoop();
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

            gameLoop(){
                this.renderBoard();
                if (!this.isPaused) {
                    requestAnimationFrame(this.gameLoop);
                }
            },

            copy (obj) {
                return JSON.parse(JSON.stringify(obj));
            },

            handleKeyDown(event) {
                if (event.code === 'KeyE') {
                    this.generatePuzzle("Easy1");
                } else if (event.code === "KeyM") {
                    this.generatePuzzle("")
                } else if (event.code === "KeyH") {
                    this.generatePuzzle("")
                } else if (event.code === "KeyC") {
                    this.clearBoard();
                } else if (event.code === "KeyS") {
                    this.solvePuzzle();
                } else if (event.code === "KeyI") {
                    this.inspectMode = !this.inspectMode;
                } else if (event.code === "KeyP") {
                    console.log("Toggle pause, isPaused: ", this.isPaused);
                    this.isPaused = !this.isPaused;
                    if (!this.isPaused) {
                        this.gameLoop();
                    }
                }
                // produce if statements for 0-9 keys
                else if (event.code === "Digit1") {
                    this.changeNumber(1);
                } else if (event.code === "Digit2") {
                    this.changeNumber(2);
                } else if (event.code === "Digit3") {
                    this.changeNumber(3);
                } else if (event.code === "Digit4") {
                    this.changeNumber(4);
                } else if (event.code === "Digit5") {
                    this.changeNumber(5);
                } else if (event.code === "Digit6") {
                    this.changeNumber(6);
                } else if (event.code === "Digit7") {
                    this.changeNumber(7);
                } else if (event.code === "Digit8") {
                    this.changeNumber(8);
                } else if (event.code === "Digit9") {
                    this.changeNumber(9);
                } else if (event.code === "Digit0") {
                    this.changeNumber(0);
                }
            },

            // mouse hover event where it shows the current row and tile in console.log 
            // and shows the tile's image in the top right corner of the screen
            handleMouseMove(event) {
                // Calculate the row and column of the clicked square
                // const rect = this.$refs.canvas.getBoundingClientRect();
                // const x = event.clientX - rect.left;
                // const y = event.clientY - rect.top;
                // const col = Math.floor((x - boardOffsetX) / tileWidth);
                // const row = Math.floor((y - boardOffsetY) / tileWidth);
                // console.log("Row: ", row, "Col: ", col);
            },

            handleClick(event) {
                // Calculate the row and column of the clicked square
                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);
                this.board[row][col].mode = "active";
                // All other tiles are set to normal mode
                for (let r = 0; r < this.board.length; r++) {
                    for (let c = 0; c < this.board[r].length; c++) {
                        if (r !== row || c !== col) {
                            this.board[r][c].mode = "normal";
                        }
                    }
                }
                console.log("Clicked: ", this.board[row][col]);
                console.log(this.board);
            },

            findActiveTile() {
                let activeTile = null;
                for (let row = 0; row < this.board.length; row++) {
                    for (let col = 0; col < this.board[row].length; col++) {
                        if (this.board[row][col].mode === "active") {
                            activeTile = this.board[row][col];
                        }
                    }
                }
                return activeTile;
            },

            changeNumber(number) {
                console.log("Changing number...");
                let activeTile = this.findActiveTile();
                if (activeTile !== null && number >= 0 && number <= 9) {
                    activeTile.value = number;
                    activeTile.possibleValues = [];
                } else if (activeTile !== null && number === 0) {
                    activeTile.value = null;
                    activeTile.possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                }
            },

            initializeBoard() {
                const rows = 8;
                const cols = 8;
                // Initialize the board with empty tiles
                for (let row = 0; row <= rows; row++) {
                    this.board[row] = [];
                    for (let col = 0; col <= cols; col++) {
                        this.board[row][col] = {
                            row,
                            col,
                            value: null,
                            mode: 'normal',
                            possibleValues: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                        };
                    }
                }
                console.log("Initialized board: ", this.board);
            },

            generatePuzzle(puzzleName) {
                const puzzle = sudokuPuzzles.find(p => p.name === puzzleName);
                if (!puzzle) {
                    console.log("Puzzle not found: ", puzzleName);
                    return;
                }
                // Initialize the board.  Then loop through the puzzle and set the values
                this.initializeBoard();
                for (let row = 0; row < puzzle.board.length; row++) {
                    for (let col = 0; col < puzzle.board[row].length; col++) {
                        // if this is a value between 1 and 9, set the value, otherwise, set it to null
                        const value = puzzle.board[row][col];
                        if (value >= 1 && value <= 9) {
                            this.board[row][col].value = value;
                            this.board[row][col].possibleValues = []
                        } else {
                            this.board[row][col].value = null;
                            this.board[row][col].possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        }
                        
                    }
                }
            },

            generateMediumPuzzle() {
                console.log("Generating medium puzzle...");
            },

            generateHardPuzzle() {
                console.log("Generating hard puzzle...");
            },

            clearBoard() {
                // clear the board
                this.initializeBoard();
            },

            solvePuzzle() {
                console.log("Solving puzzle...");
            }, 

            renderBoard() {
                // Draw black background to hidden context
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

                // A black text that says "Sudoku"
                this.hiddenCtx.font = '40px Arial';
                this.hiddenCtx.fillStyle = 'black';
                this.hiddenCtx.fillText('Sudoku', 20, 50);


                /***************************************
                 * 
                 *      Render the board
                 * 
                 ***************************************/

                for (let row = 0; row < this.board.length; row++) {
                    for (let col = 0; col < this.board[row].length; col++) {
                        const tile = this.board[row][col];
                        // Each tile is a white square with a 1px black border
                        let x = boardOffsetX + tile.col * tileWidth;
                        let y = boardOffsetY + tile.row * tileWidth;
                        this.hiddenCtx.fillStyle = (tile.mode === 'active')? '#ddd': 'white';
                        this.hiddenCtx.fillRect(x, y, tileWidth, tileWidth);
                        this.hiddenCtx.lineWidth = 1;
                        this.hiddenCtx.strokeStyle = 'black';
                        this.hiddenCtx.strokeRect(x, y, tileWidth, tileWidth);
                        // render the value of the tile if it's not null
                        if (tile.value !== null) {
                            this.hiddenCtx.fillStyle = 'black';
                            this.hiddenCtx.font = '30px Arial';
                            this.hiddenCtx.fillText(tile.value, x + 15, y + 35);
                        }
                        // If a tile is in inspect mode, render the possible values
                        // The values are rendered in tiny font within the tile, 3 x 3 according to their position in the possibleValues array
                        if (this.inspectMode && tile.value === null) {
                            this.hiddenCtx.fillStyle = 'gray';
                            this.hiddenCtx.font = '10px Arial';
                            for (let i = 0; i < tile.possibleValues.length; i++) {
                                const value = tile.possibleValues[i];
                                const valueCol = i % 3;
                                const valueRow = Math.floor(i / 3);
                                this.hiddenCtx.fillText(value, x + 5 + valueCol * 15, y + 10 + valueRow * 15);
                            }
                        }
                    }
                }

                // Render a thick border around the board
                this.hiddenCtx.lineWidth = 5;
                this.hiddenCtx.strokeStyle = 'black';
                this.hiddenCtx.strokeRect(boardOffsetX, boardOffsetY, 450, 450);

                // Render a thick border around each 3x3 square
                this.hiddenCtx.lineWidth = 3;
                this.hiddenCtx.strokeStyle = 'black';
                for (let row = 0; row < this.board.length; row += 3) {
                    for (let col = 0; col < this.board[row].length; col += 3) {
                        const x = boardOffsetX + col * tileWidth;
                        const y = boardOffsetY + row * tileWidth;
                        this.hiddenCtx.strokeRect(x, y, tileWidth * 3, tileWidth * 3);
                    }
                }

                /***************************************
                 * 
                 *      Render the buttons
                 * 
                 ***************************************/

                // If the game is paused, render a big blue text in the middle that says "PAUSED"
                if (this.isPaused) {
                    this.hiddenCtx.fillStyle = 'blue';
                    this.hiddenCtx.font = '80px Arial';
                    this.hiddenCtx.fillText('PAUSED', 100, 300);
                }
                console.log("YO");

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