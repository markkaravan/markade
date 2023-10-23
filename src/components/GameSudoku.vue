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
        },

        {   name: "Medium1",
            board:
                [
                    [0, 0, 0, 4, 5, 3, 6, 7, 8],
                    [0, 0, 0, 0, 0, 8, 0, 0, 0],
                    [8, 7, 0, 0, 0, 6, 0, 0, 0],
                    [5, 0, 2, 0, 0, 0, 3, 0, 4],
                    [0, 0, 0, 0, 3, 4, 0, 9, 2],
                    [0, 0, 3, 2, 6, 0, 0, 0, 0],
                    [0, 0, 8, 0, 0, 0, 0, 0, 9],
                    [6, 0, 0, 0, 8, 0, 0, 5, 3],
                    [0, 0, 7, 3, 0, 2, 1, 8, 0]
                ]
        },

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
                inspectMode: true,
                previousSolvedState: null,
                solutionObj: {
                    id: Math.floor(Math.random() * 100000000),
                    boardOld: null,
                    boardNew: null,
                    children: []
                }
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

            // generate an easy puzzle
            this.generatePuzzle("Easy1");

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
                if (event.code === 'KeyE') {
                    this.generatePuzzle("Easy1");
                } else if (event.code === "KeyM") {
                    this.generatePuzzle("Medium1")
                } else if (event.code === "KeyH") {
                    this.generatePuzzle("")
                } else if (event.code === "KeyC") {
                    this.clearBoard();
                } else if (event.code === "KeyS") {
                    this.solvePuzzle();
                } else if (event.code === "KeyI") {
                    this.inspectMode = !this.inspectMode;
                } else if (event.code === "KeyV") {
                    this.boardIsValid(this.solutionObj.boardNew);
                } else if (event.code === "KeyF") {
                    this.boardIsFull(this.solutionObj.boardNew);
                } else if (event.code === "KeyP") {
                    let board = this.copy(this.solutionObj.boardNew);
                    this.solutionObj.boardOld = this.copy(board);
                    let newBoard = this.prunePossibleValues(board);
                    this.solutionObj.boardNew = this.copy(newBoard);
                
                // produce if statements for 0-9 keys
                } else if (event.code === "Digit1") {
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
                this.renderBoard();
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
                let board = this.solutionObj.boardNew;
                // Calculate the row and column of the clicked square
                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);
                board[row][col].mode = "active";
                // All other tiles are set to normal mode
                for (let r = 0; r < board.length; r++) {
                    for (let c = 0; c < board[r].length; c++) {
                        if (r !== row || c !== col) {
                            board[r][c].mode = "normal";
                        }
                    }
                }
                console.log("Clicked: ", board[row][col]);
                console.log(board);
                this.renderBoard();
            },

            findActiveTile() {
                let board = this.solutionObj.boardNew;
                let activeTile = null;
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        if (board[row][col].mode === "active") {
                            activeTile = board[row][col];
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
                let board = []
                for (let row = 0; row <= rows; row++) {
                    board[row] = [];
                    for (let col = 0; col <= cols; col++) {
                        board[row][col] = {
                            row,
                            col,
                            value: null,
                            mode: 'normal',
                            possibleValues: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                        };
                    }
                }
                this.previousSolvedState = this.copy(board);
                // Solution obj
                this.solutionObj.boardNew = this.copy(board);
                console.log("Initialized board: ", this.solutionObj.boardNew);
            },

            generatePuzzle(puzzleName) {
                const puzzle = sudokuPuzzles.find(p => p.name === puzzleName);
                if (!puzzle) {
                    console.log("Puzzle not found: ", puzzleName);
                    return;
                }
                // Initialize the board.  Then loop through the puzzle and set the values
                this.initializeBoard();
                let board = this.copy(this.solutionObj.boardNew);
                for (let row = 0; row < puzzle.board.length; row++) {
                    for (let col = 0; col < puzzle.board[row].length; col++) {
                        // if this is a value between 1 and 9, set the value, otherwise, set it to null
                        const value = puzzle.board[row][col];
                        if (value >= 1 && value <= 9) {
                            board[row][col].value = value;
                            board[row][col].possibleValues = []
                        } else {
                            board[row][col].value = null;
                            board[row][col].possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        }
                    }
                }
                this.solutionObj.boardNew = this.copy(board);
            },


            clearBoard() {
                // clear the board
                this.initializeBoard();
            },

            solvePuzzle(solutionObj) {
                console.log("Solving puzzle...");
                let board = this.copy(solutionObj.boardNew);
                let newBoard = this.prunePossibleValues(board);
                this.solutionObj.boardNew = this.copy(newBoard);
            }, 

            prunePossibleValues(board) {
                const prunePossibleRowValuesForTile = (row, col) => {
                    // Find all tiles in the same row that have a value, and remove that value from the possible values of the tile
                    let tile = board[row][col];
                    for (let c = 0; c < board[row].length; c++) {
                        if (c !== col && board[row][c].value !== null) {
                            const value = board[row][c].value;
                            tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                        }
                    }
                };

                const prunePossibleColValuesForTile = (row, col) => {
                    // Find all tiles in the same col that have a value, and remove that value from the possible values of the tile
                    let tile = board[row][col];
                    for (let r = 0; r < board.length; r++) {
                        if (r !== row && board[r][col].value !== null) {
                            const value = board[r][col].value;
                            tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                        }
                    }
                };

                const prunePossibleNeighborhoodValuesForTile = (row, col) => {
                    // Find all tiles in the same 3x3 neighborhood that have a value, and remove that value from the possible values of the tile
                    let tile = board[row][col];
                    const neighborhoodRow = Math.floor(row / 3);
                    const neighborhoodCol = Math.floor(col / 3);
                    for (let r = neighborhoodRow * 3; r < neighborhoodRow * 3 + 3; r++) {
                        for (let c = neighborhoodCol * 3; c < neighborhoodCol * 3 + 3; c++) {
                            if (r !== row && c !== col && board[r][c].value !== null) {
                                const value = board[r][c].value;
                                tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                            }
                        }
                    }
                };

                // Loop through the board and call prunePossibleValuesForTile for each tile
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        if (board[row][col].value === null) {
                            prunePossibleRowValuesForTile(row, col);
                            prunePossibleColValuesForTile(row, col);
                            prunePossibleNeighborhoodValuesForTile(row, col);
                        }
                    }
                }

                // Loop through the board and set the value of any tile that has only one possible value
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        if (board[row][col].value === null && board[row][col].possibleValues.length === 1) {
                            board[row][col].value = board[row][col].possibleValues[0];
                            board[row][col].possibleValues = [];
                        }
                    }
                }
                return board;
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

            boardsAreEqual(board1, board2) {
                if (board1.length !== board2.length) {
                    return false;
                }
                for (let row = 0; row < board1.length; row++) {
                    if (board1[row].length !== board2[row].length) {
                        return false;
                    }
                    for (let col = 0; col < board1[row].length; col++) {
                        if (board1[row][col].value !== board2[row][col].value) {
                            return false;
                        }
                    }
                }
                return true;
            },

            boardIsValid(board) {
                console.log("Checking if board is valid...");
                const rowIsValid = (row) => {
                    let values = [];
                    for (let col = 0; col < board[row].length; col++) {
                        const value = board[row][col].value;
                        if (value !== null) {
                            if (values.includes(value)) {
                                return false;
                            } else {
                                values.push(value);
                            }
                        }
                    }                    
                    return this.arraysAreEqual(values.sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
                };

                const colIsValid = (col) => {
                    const values = [];
                    for (let row = 0; row < board.length; row++) {
                        const value = board[row][col].value;
                        if (value !== null) {
                            if (values.includes(value)) {
                                return false;
                            } else {
                                values.push(value);
                            }
                        }
                    }
                    return this.arraysAreEqual(values.sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
                };

                const neighborhoodIsValid = (row, col) => {
                    const values = [];
                    const neighborhoodRow = Math.floor(row / 3);
                    const neighborhoodCol = Math.floor(col / 3);
                    for (let r = neighborhoodRow * 3; r < neighborhoodRow * 3 + 3; r++) {
                        for (let c = neighborhoodCol * 3; c < neighborhoodCol * 3 + 3; c++) {
                            const value = board[r][c].value;
                            if (value !== null) {
                                if (values.includes(value)) {
                                    return false;
                                } else {
                                    values.push(value);
                                }
                            }
                        }
                    }
                    return this.arraysAreEqual(values.sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
                };
                
                // loop through board and check if each row, col, and neighborhood is valid
                for (let row = 0; row < board.length; row++) {
                    if (!rowIsValid(row)) {
                        console.log("Row fail: ", row);
                        return false;
                    }
                }
                for (let col = 0; col < board[0].length; col++) {
                    if (!colIsValid(col)) {
                        console.log("Col fail: ", col);
                        return false;
                    }
                }
                for (let row = 0; row < board.length; row += 3) {
                    for (let col = 0; col < board[0].length; col += 3) {
                        if (!neighborhoodIsValid(row, col)) {
                            console.log("Neighborhood fail: ", row, col);
                            return false;
                        }
                    }
                }
                console.log("Survival of the fittest!");
                return true;
            },

            boardIsFull(board) {
                let full = true;
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        let tile = board[row][col];
                        if (tile.value === null) {
                            full = false;
                        }
                    }
                }
                console.log("Board is full: ", full);
                return full;
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
                let board = this.solutionObj.boardNew;

                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        const tile = board[row][col];
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
                for (let row = 0; row < board.length; row += 3) {
                    for (let col = 0; col < board[row].length; col += 3) {
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