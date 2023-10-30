<template>
    <div id="leftSide">
        <canvas id="mainCanvas" ref="canvas" @click="handleClick" :width="550" :height="dataGameHeight"></canvas>
        <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="550" :height="dataGameHeight"></canvas>
    </div>

    <div id="rightSide">
        <div id="buttons">
            <button class="btn" id="easyButton" @click="generateEasyPuzzle">Easy</button>
            <button class="btn" id="mediumButton" @click="generateMediumPuzzle">Medium</button>
            <button class="btn" id="hardButton" @click="generateHardPuzzle">Hard</button>
            <button class="btn" id="impossibleButton" @click="generateImpossiblePuzzle">Impossible</button>
            <button class="btn" id="clearButton" @click="clearBoard">Clear</button>
            <button class="btn" id="solveButton" @click="solveBoard">Solve</button>
        </div>
        <!-- <div id="instructions">
            <p>Instructions:</p>
            <p>Click on a tile to select it. Use the arrow keys to move the selection around the board.</p>
            <p>Press a number key to enter a value into the selected tile.</p>
            <p>Press the spacebar to toggle "inspect mode". In inspect mode, the selected tile's details are shown in the console.</p>
            <p>Press the "Generate Easy Puzzle" button to generate a new puzzle.</p>
            <p>Press the "Clear" button to clear the board.</p>
            <p>Press the "Solve" button to solve the puzzle.</p>
        </div> -->
    </div>
</template>

<script>
    import { Mixins } from '../mixins.js';

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

    const sudokuSeeds = [
        {
            difficulty: "Easy",
            boards: [
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
                ],
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
            ],
        },
        {
            difficulty: "Medium",
            boards: [
                [
                    [0, 7, 0, 0, 0, 2, 0, 6, 1],
                    [9, 6, 0, 0, 0, 0, 0, 0, 8],
                    [0, 0, 5, 0, 0, 6, 0, 0, 0],
                    [0, 9, 6, 0, 1, 0, 0, 0, 0],
                    [2, 1, 8, 0, 0, 0, 7, 0, 5],
                    [0, 0, 0, 4, 2, 0, 0, 0, 6],
                    [5, 0, 0, 0, 6, 7, 0, 8, 4],
                    [0, 0, 0, 0, 0, 3, 2, 0, 0],
                    [8, 0, 0, 0, 0, 0, 0, 1, 3]
                ],
                [
                    [0, 0, 0, 0, 0, 1, 4, 0, 0],
                    [0, 2, 0, 0, 0, 0, 0, 0, 5],
                    [0, 0, 0, 0, 0, 5, 6, 0, 3],
                    [2, 0, 0, 0, 8, 0, 0, 6, 4],
                    [7, 0, 3, 0, 0, 0, 5, 9, 8],
                    [0, 5, 0, 4, 0, 0, 0, 0, 2],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [8, 1, 5, 0, 6, 0, 3, 0, 9],
                    [0, 0, 0, 8, 0, 9, 2, 5, 6]
                ]
            ],
        },
        {
            difficulty: "Hard",
            boards: [
                [
                    [0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [1, 5, 0, 0, 0, 9, 0, 0, 0],
                    [6, 2, 9, 0, 0, 0, 5, 0, 0],
                    [8, 6, 5, 4, 2, 0, 3, 0, 0],
                    [0, 0, 0, 9, 0, 0, 7, 8, 0],
                    [0, 0, 0, 0, 0, 3, 0, 0, 0],
                    [9, 0, 0, 7, 0, 0, 8, 0, 5],
                    [0, 3, 0, 5, 0, 0, 2, 0, 0],
                    [5, 0, 0, 0, 0, 0, 0, 7, 4]
                ],
                [
                    [0, 8, 0, 0, 2, 0, 5, 6, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 7],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 5, 0, 0, 9, 0, 4, 0, 8],
                    [0, 0, 7, 8, 0, 0, 0, 0, 3],
                    [0, 9, 0, 0, 1, 0, 0, 5, 0],
                    [2, 0, 4, 0, 0, 0, 8, 0, 0],
                    [0, 6, 0, 0, 8, 5, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 1, 0, 0],
                ]
            ],
        },
        {
            difficulty: "Impossible",
            boards: [
                [
                    [0, 6, 5, 1, 0, 4, 0, 2, 0],
                    [3, 0, 0, 0, 5, 0, 0, 0, 0],
                    [8, 0, 0, 0, 0, 0, 0, 0, 6],
                    [5, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 9, 1, 0, 4, 0, 0, 0, 3],
                    [0, 0, 0, 0, 0, 2, 7, 0, 0],
                    [0, 8, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 9, 0, 0, 0, 3, 0],
                    [0, 4, 6, 0, 1, 0, 0, 0, 9]
                ],
                [
                    [0, 7, 0, 0, 8, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 3, 0],
                    [0, 0, 6, 7, 0, 9, 4, 0, 0],
                    [0, 0, 8, 0, 4, 0, 0, 0, 0],
                    [0, 0, 0, 0, 5, 0, 2, 0, 0],
                    [0, 6, 0, 8, 0, 2, 0, 0, 1],
                    [0, 0, 7, 2, 0, 6, 9, 0, 0],
                    [0, 0, 0, 0, 0, 5, 0, 0, 0],
                    [9, 0, 0, 0, 0, 0, 0, 0, 4]
                ],
                [
                    [8, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 3, 6, 0, 0, 0, 0, 0],
                    [0, 7, 0, 0, 9, 0, 2, 0, 0],
                    [0, 5, 0, 0, 0, 7, 0, 0, 0],
                    [0, 0, 0, 0, 4, 5, 7, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 3, 0],
                    [0, 0, 1, 0, 0, 0, 0, 6, 8],
                    [0, 0, 8, 5, 0, 0, 0, 1, 0],
                    [0, 9, 0, 0, 0, 0, 4, 0, 0]
                ]
            ]
        }
    ];



    const sudokuPuzzles = [
        {   name: "Empty",
            board:
                [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                ]
        },
        //==========================

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

        //----------------------------------

        {   name: "Medium2",
            board:
                [
                    [0, 7, 0, 0, 0, 2, 0, 6, 1],
                    [9, 6, 0, 0, 0, 0, 0, 0, 8],
                    [0, 0, 5, 0, 0, 6, 0, 0, 0],
                    [0, 9, 6, 0, 1, 0, 0, 0, 0],
                    [2, 1, 8, 0, 0, 0, 7, 0, 5],
                    [0, 0, 0, 4, 2, 0, 0, 0, 6],
                    [5, 0, 0, 0, 6, 7, 0, 8, 4],
                    [0, 0, 0, 0, 0, 3, 2, 0, 0],
                    [8, 0, 0, 0, 0, 0, 0, 1, 3]
                ]
        },

        //----------------------------------

        {   name: "Medium3",
            board:
                [
                    [0, 0, 0, 0, 0, 1, 4, 0, 0],
                    [0, 2, 0, 0, 0, 0, 0, 0, 5],
                    [0, 0, 0, 0, 0, 5, 6, 0, 3],
                    [2, 0, 0, 0, 8, 0, 0, 6, 4],
                    [7, 0, 3, 0, 0, 0, 5, 9, 8],
                    [0, 5, 0, 4, 0, 0, 0, 0, 2],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [8, 1, 5, 0, 6, 0, 3, 0, 9],
                    [0, 0, 0, 8, 0, 9, 2, 5, 6]
                ]
        },
        //=====================================
        {   name: "Hard1",
            board:
                [
                    [0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [1, 5, 0, 0, 0, 9, 0, 0, 0],
                    [6, 2, 9, 0, 0, 0, 5, 0, 0],
                    [8, 6, 5, 4, 2, 0, 3, 0, 0],
                    [0, 0, 0, 9, 0, 0, 7, 8, 0],
                    [0, 0, 0, 0, 0, 3, 0, 0, 0],
                    [9, 0, 0, 7, 0, 0, 8, 0, 5],
                    [0, 3, 0, 5, 0, 0, 2, 0, 0],
                    [5, 0, 0, 0, 0, 0, 0, 7, 4]
                ]
        },
        {   name: "Hard2",
            board:
                [
                    [0, 8, 0, 0, 2, 0, 5, 6, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 7],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 5, 0, 0, 9, 0, 4, 0, 8],
                    [0, 0, 7, 8, 0, 0, 0, 0, 3],
                    [0, 9, 0, 0, 1, 0, 0, 5, 0],
                    [2, 0, 4, 0, 0, 0, 8, 0, 0],
                    [0, 6, 0, 0, 8, 5, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 1, 0, 0],
                ]
        },
        //=====================================
        {   name: "Expert1",
            board:
                [
                    [5, 3, 0, 0, 7, 2, 0, 0, 8],
                    [6, 0, 9, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [0, 5, 0, 0, 0, 0, 1, 6, 0],
                    [2, 0, 0, 3, 9, 0, 0, 0, 0],
                    [4, 0, 0, 1, 0, 0, 8, 0, 0],
                    [0, 0, 0, 0, 6, 0, 4, 9, 0],
                    [0, 0, 0, 0, 0, 5, 0, 0, 0],
                    [0, 7, 4, 0, 0, 0, 0, 0, 0]
                ]
        },
        {   name: "Expert2",
            board:
                [
                    [9, 0, 0, 0, 0, 8, 4, 0, 0],
                    [4, 0, 3, 0, 0, 0, 0, 5, 0],
                    [0, 0, 0, 0, 7, 9, 2, 0, 0],
                    [0, 5, 0, 0, 0, 0, 0, 4, 0],
                    [0, 0, 0, 6, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [3, 0, 7, 0, 0, 0, 0, 2, 0],
                    [1, 0, 0, 0, 0, 6, 0, 0, 0],
                    [0, 0, 2, 0, 4, 5, 0, 8, 0]
                ]
        },
        {   name: "Expert3",
            board:
                [
                    [9, 0, 0, 3, 7, 0, 0, 0, 0],
                    [0, 0, 3, 1, 0, 0, 0, 4, 0],
                    [0, 0, 7, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 3, 1, 7],
                    [0, 8, 0, 0, 0, 0, 9, 0, 0],
                    [0, 9, 2, 0, 0, 0, 4, 0, 0],
                    [0, 0, 0, 0, 9, 0, 0, 5, 0],
                    [5, 6, 0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 4, 0, 0, 1]
                ]
        },
        {   name: "Expert4",
            board:
                [
                    [0, 5, 0, 7, 6, 0, 0, 0, 9],
                    [0, 2, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 7, 9, 0, 0, 5, 0, 0],
                    [0, 1, 0, 0, 0, 2, 0, 0, 0],
                    [6, 0, 0, 0, 0, 1, 0, 0, 7],
                    [8, 7, 0, 5, 0, 0, 0, 0, 3],
                    [0, 0, 0, 3, 0, 0, 0, 4, 0],
                    [4, 0, 0, 0, 5, 0, 8, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 6]
                ]
        },
        {   name: "Expert5",
            board:
                [
                    [0, 0, 9, 0, 7, 0, 3, 0, 0],
                    [0, 5, 0, 0, 0, 0, 0, 0, 6],
                    [0, 0, 0, 2, 0, 6, 8, 0, 1],
                    [4, 3, 0, 0, 0, 0, 0, 0, 2],
                    [0, 0, 6, 0, 0, 0, 4, 0, 9],
                    [0, 0, 0, 7, 0, 0, 0, 0, 0],
                    [0, 9, 0, 0, 0, 3, 0, 5, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [8, 6, 0, 4, 0, 0, 0, 0, 3]
                ]
        },
        //=====================================
        {   name: "Evil1",
            board:
                [
                    [0, 6, 5, 1, 0, 4, 0, 2, 0],
                    [3, 0, 0, 0, 5, 0, 0, 0, 0],
                    [8, 0, 0, 0, 0, 0, 0, 0, 6],
                    [5, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 9, 1, 0, 4, 0, 0, 0, 3],
                    [0, 0, 0, 0, 0, 2, 7, 0, 0],
                    [0, 8, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 9, 0, 0, 0, 3, 0],
                    [0, 4, 6, 0, 1, 0, 0, 0, 9]
                ]
        },
        {   name: "Evil2",
            board:
                [
                    [0, 7, 0, 0, 8, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 3, 0],
                    [0, 0, 6, 7, 0, 9, 4, 0, 0],
                    [0, 0, 8, 0, 4, 0, 0, 0, 0],
                    [0, 0, 0, 0, 5, 0, 2, 0, 0],
                    [0, 6, 0, 8, 0, 2, 0, 0, 1],
                    [0, 0, 7, 2, 0, 6, 9, 0, 0],
                    [0, 0, 0, 0, 0, 5, 0, 0, 0],
                    [9, 0, 0, 0, 0, 0, 0, 0, 4]
                ]
        },
        //=====================================
        {   name: "WorldsHardest",
            board:
                [
                    [8, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 3, 6, 0, 0, 0, 0, 0],
                    [0, 7, 0, 0, 9, 0, 2, 0, 0],
                    [0, 5, 0, 0, 0, 7, 0, 0, 0],
                    [0, 0, 0, 0, 4, 5, 7, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 3, 0],
                    [0, 0, 1, 0, 0, 0, 0, 6, 8],
                    [0, 0, 8, 5, 0, 0, 0, 1, 0],
                    [0, 9, 0, 0, 0, 0, 4, 0, 0]
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
                inspectMode: false,
                displayBoard: null,
                solveCallCount: 0,
                solveTerminateFlag: false,
                globalBoardId: 0,
                maxDepth: 0,
                solutionObj: {
                    id: 0,
                    depth: 0,
                    board: null,
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

            // Initialize the board
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
                this.solutionObj.board = Mixins.copy(board);
                this.displayBoard = this.solutionObj.board;
                // console.log("Initialized board: ", this.solutionObj.board);

            // generate an easy puzzle
            this.generatePuzzle("WorldsHardest");

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
            handleKeyDown(event) {
                if (event.code === 'KeyE') {
                    this.generatePuzzle("Easy1");
                } else if (event.code === "KeyM") {
                    this.generatePuzzle("Medium1")
                } else if (event.code === "KeyS") {
                    let newSolutionObj = this.solvePuzzle(this.solutionObj);
                    if (newSolutionObj !== null) {
                        this.solutionObj = Mixins.copy(newSolutionObj);
                    }
                } else if (event.code === "KeyI") {
                    this.inspectMode = !this.inspectMode;
                } else if (event.code === "KeyV") {
                    // console.log(this.boardIsValid(this.solutionObj.board));
                } else if (event.code === "KeyC") {
                    // console.log(this.boardIsCorrect(this.solutionObj.board));
                } else if (event.code === "KeyF") {
                    this.boardIsFull(this.solutionObj.board);
                } else if (event.code === "KeyL") {
                    this.splitSolutionObject(this.solutionObj);
                } else if (event.code === "KeyP") {
                    let board = Mixins.copy(this.solutionObj.board);
                    let newBoard = this.prunePossibleValues(board);
                    this.solutionObj.board = Mixins.copy(newBoard);
                    this.displayBoard = this.solutionObj.board;
                } else if (event.code === "KeyU") {
                    let board = Mixins.copy(this.solutionObj.board);
                    let newBoard = this.findUniqueValues(board);
                    this.solutionObj.board = Mixins.copy(newBoard);
                    this.displayBoard = this.solutionObj.board;
                } else if (event.code === "KeyG") {
                    let board = Mixins.copy(this.solutionObj.board);
                    let newBoard = this.removeNakedSingles(board);
                    this.solutionObj.board = Mixins.copy(newBoard);
                    this.displayBoard = this.solutionObj.board;

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

            },

            handleClick(event) {
                let board = this.solutionObj.board;
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
                this.renderBoard();
            },

            findActiveTile() {
                let board = this.solutionObj.board;
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
                let activeTile = this.findActiveTile();
                if (activeTile !== null && number >= 1 && number <= 9) {
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
                this.solutionObj.board = Mixins.copy(board);
            },

            generateEasyPuzzle() {
                this.generateRandomizedPuzzle("Easy");
            },

            generateMediumPuzzle() {
                this.generateRandomizedPuzzle("Medium");
            },

            generateHardPuzzle() {
                this.generateRandomizedPuzzle("Hard");
            },

            generateImpossiblePuzzle() {
                this.generateRandomizedPuzzle("Impossible");
            },

            generateRandomizedPuzzle(difficulty) {
                // Select a random board from sudokuSeeds by the difficulty prop passing in the difficulty argument
                let seedGroup = sudokuSeeds.filter(seed => seed.difficulty === difficulty)[0];
                // Select a random board from the seedGroup
                let puzzle = seedGroup.boards[Math.floor(Math.random() * seedGroup.boards.length)];
                // Initialize the board.  Then loop through the puzzle and set the values
                this.initializeBoard();
                let board = Mixins.copy(this.solutionObj.board);
                for (let row = 0; row < puzzle.length; row++) {
                    for (let col = 0; col < puzzle[row].length; col++) {
                        // if this is a value between 1 and 9, set the value, otherwise, set it to null
                        const value = puzzle[row][col];
                        if (value >= 1 && value <= 9) {
                            board[row][col].value = value;
                            board[row][col].possibleValues = []
                        } else {
                            board[row][col].value = null;
                            board[row][col].possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        }
                    }
                }
                // Randomize the board values
                let randomizedBoard = this.randomizeBoard(Mixins.copy(board));

                let prunedBoard = this.initialPruning(Mixins.copy(randomizedBoard));
                this.solutionObj.board = Mixins.copy(prunedBoard);
                this.displayBoard = this.solutionObj.board;
                this.renderBoard();
            },

            randomizeBoard(board) {
                // create a random permutation of numbers 1-9
                let randomPermutation = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                for (let i = 0; i < randomPermutation.length; i++) {
                    const randomIndex = Math.floor(Math.random() * randomPermutation.length);
                    const temp = randomPermutation[i];
                    randomPermutation[i] = randomPermutation[randomIndex];
                    randomPermutation[randomIndex] = temp;
                }
                // Go through the board and replace the values with the random permutation
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        if (board[row][col].value !== null) {
                            board[row][col].value = randomPermutation[board[row][col].value - 1];
                        }
                    }
                }
                
                // There is a 50/50 chance of flipping the board horizontally
                if (Math.random() < 0.5) {
                    let newBoard = Mixins.copy(board);
                    for (let row = 0; row < newBoard.length; row++) {
                        for (let col = 0; col < newBoard[row].length; col++) {
                            newBoard[row][col] = {
                                row,
                                col,
                                value: board[row][8 - col].value,
                                mode: 'normal',
                                possibleValues: board[row][8 - col].possibleValues,
                            };
                        }
                    }
                    board = newBoard;
                }

                // There is a 50/50 chance of flipping the board vertically
                if (Math.random() < 0.5) {
                    let newBoard = Mixins.copy(board);
                    for (let row = 0; row < newBoard.length; row++) {
                        for (let col = 0; col < newBoard[row].length; col++) {
                            // newBoard[row][col] = board[8 - row][col];
                            newBoard[row][col] = {
                                row,
                                col,
                                value: board[8 - row][col].value,
                                mode: 'normal',
                                possibleValues: board[8 - row][col].possibleValues,
                            };
                        }
                    }
                    board = newBoard;
                }

                // Select a number between 0 and 3 and rotate the board that many times
                const numRotations = Math.floor(Math.random() * 4);
                for (let i = 0; i < numRotations; i++) {
                    let newBoard = Mixins.copy(board);
                    for (let row = 0; row < newBoard.length; row++) {
                        for (let col = 0; col < newBoard[row].length; col++) {
                            // newBoard[row][col] = board[8 - row][col];
                            newBoard[row][col] = {
                                row,
                                col,
                                value: board[col][8 - row].value,
                                mode: 'normal',
                                possibleValues: board[col][8 - row].possibleValues,
                            };
                        }
                    }
                    board = newBoard;
                }

                return board;
            },

            generatePuzzle(puzzleName) {
                const puzzle = sudokuPuzzles.find(p => p.name === puzzleName);
                if (!puzzle) {
                    return;
                }
                // Initialize the board.  Then loop through the puzzle and set the values
                this.initializeBoard();
                let board = Mixins.copy(this.solutionObj.board);
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
                let prunedBoard = this.initialPruning(board);
                this.solutionObj.board = Mixins.copy(prunedBoard);
                this.displayBoard = this.solutionObj.board;
            },


            clearBoard() {
                // clear the board
                this.initializeBoard();
            },

            solvePuzzle(solutionObj) {
                this.displayBoard = solutionObj.board;
                this.renderBoard();

                this.solveCallCount++;
                if (this.solveTerminateFlag || this.solveCallCount > 5000) {
                    return null;
                }

                if (!this.boardIsValid(solutionObj.board, solutionObj.id)) {
                    return null;
                }

                if (this.boardIsCorrect(solutionObj.board)) {
                    return solutionObj;
                }

                let oldBoard = Mixins.copy(solutionObj.board);
                let prunedBoard = this.prunePossibleValues(Mixins.copy(solutionObj.board));
                prunedBoard = this.removeNakedSingles(Mixins.copy(prunedBoard));
                prunedBoard = this.prunePossibleValues(Mixins.copy(prunedBoard));
                prunedBoard = this.findUniqueValues(Mixins.copy(prunedBoard));                


                if (!this.boardsAreEqual(oldBoard, prunedBoard)) {
                    solutionObj.board = Mixins.copy(prunedBoard);
                    return this.solvePuzzle(solutionObj);
                } else {
                    let splitSolutionObject = this.splitSolutionObject(solutionObj);
                    for (let i = 0; i < splitSolutionObject.children.length; i++) {
                        const res = this.solvePuzzle(splitSolutionObject.children[i]);
                        if (res !== null) {
                            return this.solvePuzzle(res);
                        } else {
                            continue;
                        }
                    }
                    return null;
                }
            }, 



            initialPruning(board) {
                const prunePossibleRowValuesForTile = (row, col) => {
                    // Find all tiles in the same row that have a value, and remove that value from the possible values of the tile
                    let tile = board[row][col];
                    for (let c = 0; c < board[row].length; c++) {
                        if (c !== col && board[row][c].value !== null) {
                            const value = board[row][c].value;
                            if (row==0 && tile.possibleValues.includes(value)) {
                                // console.log("Value: ", value);
                            }
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

                const prunePossibleBlockValuesForTile = (row, col) => {
                    // Find all tiles in the same 3x3 block that have a value, and remove that value from the possible values of the tile
                    let tile = board[row][col];
                    const blockRow = Math.floor(row / 3);
                    const blockCol = Math.floor(col / 3);
                    for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                        for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
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
                            prunePossibleBlockValuesForTile(row, col);
                        }
                    }
                }
                // console.log("Priuned:", board);

                return board;
            },





            prunePossibleValues(board) {

                let abort = false;
                /*****************************************
                 * 
                 *                Basic Pruning
                 * 
                 *****************************************/
                for (let row = 0; !abort && row < board.length; row++) {
                    for (let col = 0; !abort && col < board[row].length; col++) {
                        if (board[row][col].value === null) {
                            // Find all tiles in the same col that have a value, and remove that value from the possible values of the tile
                            let tile = board[row][col];
                            for (let r = 0; !abort && r < board.length; r++) {
                                if (r !== row && board[r][col].value !== null) {
                                    const value = board[r][col].value;
                                    tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                                    // abort = true;
                                }
                            }

                            // Find all tiles in the same col that have a value, and remove that value from the possible values of the tile
                            tile = board[row][col];
                            for (let r = 0; r < board.length; r++) {
                                if (r !== row && board[r][col].value !== null) {
                                    const value = board[r][col].value;
                                    tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                                    // abort = true;
                                }
                            }

                            // Find all tiles in the same 3x3 block that have a value, and remove that value from the possible values of the tile
                            tile = board[row][col];
                            const blockRow = Math.floor(row / 3);
                            const blockCol = Math.floor(col / 3);
                            for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                                for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
                                    if (r !== row && c !== col && board[r][c].value !== null) {
                                        const value = board[r][c].value;
                                        tile.possibleValues = tile.possibleValues.filter(v => v !== value);
                                        // abort = true;
                                    }
                                }
                            }
                        }
                    }
                }



                /*****************************************
                 * 
                 *                Naked Pairs
                 * 
                 *****************************************/
                // For each block on the board, look for two tiles that have only two possible values, and those values are the same.
                // If so, remove those two possible values from all other tiles in the block
                for (let blockRow = 0; !abort && blockRow < 3; blockRow++) {
                    for (let blockCol = 0; !abort && blockCol < 3; blockCol++) {
                        let possiblePairs = [];
                        for (let row = blockRow * 3; !abort && row < blockRow * 3 + 3; row++) {
                            for (let col = blockCol * 3; col < blockCol * 3 + 3; col++) {
                                if (board[row][col].value === null && board[row][col].possibleValues.length === 2) {
                                    possiblePairs.push(board[row][col]);
                                }
                            }
                        }
                        // If there are two tiles in the block that have only two possible values, and those values are the same, remove those two possible values from all other tiles in the block
                        if (possiblePairs.length === 2 && Mixins.arraysAreEqual(possiblePairs[0].possibleValues, possiblePairs[1].possibleValues)) {
                            // console.log("Found possible pairs at: ", blockRow, blockCol, possiblePairs);
                            const value1 = possiblePairs[0].possibleValues[0];
                            const value2 = possiblePairs[0].possibleValues[1];
                            for (let row = blockRow * 3; !abort && row < blockRow * 3 + 3; row++) {
                                for (let col = blockCol * 3; !abort && col < blockCol * 3 + 3; col++) {
                                    if (board[row][col].value === null && board[row][col].possibleValues.length > 2) {
                                        board[row][col].possibleValues = board[row][col].possibleValues.filter(v => v !== value1 && v !== value2);
                                    }
                                }
                            }
                            // If the possible pairs lie on the same row, remove those two possible values from all other tiles in the row
                            if (possiblePairs[0].row === possiblePairs[1].row) {
                                const row = possiblePairs[0].row;
                                for (let col = 0; !abort && col < board[row].length; col++) {
                                    if (board[row][col].value === null && board[row][col].possibleValues.length > 2) {
                                        board[row][col].possibleValues = board[row][col].possibleValues.filter(v => v !== value1 && v !== value2);
                                    }
                                }
                            }
                            // If the possible pairs lie on the same col, remove those two possible values from all other tiles in the col
                            if (possiblePairs[0].col === possiblePairs[1].col) {
                                const col = possiblePairs[0].col;
                                for (let row = 0; !abort && row < board.length; row++) {
                                    if (board[row][col].value === null && board[row][col].possibleValues.length > 2) {
                                        board[row][col].possibleValues = board[row][col].possibleValues.filter(v => v !== value1 && v !== value2);
                                        abort = true;
                                    }
                                }
                            }

                        }
                    }
                } 

                /*****************************************
                 * 
                 *                Pointing Pairs
                 * 
                 *****************************************/
                
                // Go through each block and look for a possible value that only appears in one row or one col
                // If you find one, remove that possible value from all other tiles in that row or col
                for (let blockRow = 0; !abort && blockRow < 3; blockRow++) {
                    for (let blockCol = 0; !abort && blockCol < 3; blockCol++) {
                        for (let num = 1; num <= 9; num++) {
                            let tilesWithNum = [];
                            for (let row = blockRow * 3; !abort && row < blockRow * 3 + 3; row++) {
                                for (let col = blockCol * 3; col < blockCol * 3 + 3; col++) {
                                    if (board[row][col].value === null && board[row][col].possibleValues.includes(num)) {
                                        tilesWithNum.push(board[row][col]);
                                    }
                                }
                            }
                            // If there is only one tile in the block that has that possible value, remove that possible value from all other tiles in that row or col
                            if (tilesWithNum.length === 1) {
                                const row = tilesWithNum[0].row;
                                const col = tilesWithNum[0].col;
                                // Remove the possible value from all other tiles in the row
                                for (let c = 0; c < board[row].length; c++) {
                                    if (c < blockCol * 3 || c >= blockCol * 3 + 3) {
                                        board[row][c].possibleValues = board[row][c].possibleValues.filter(v => v !== num);
                                    }
                                }
                                // Remove the possible value from all other tiles in the col
                                for (let r = 0; r < board.length; r++) {
                                    if (r < blockRow * 3 || r >= blockRow * 3 + 3) {
                                        board[r][col].possibleValues = board[r][col].possibleValues.filter(v => v !== num);
                                    }
                                }
                                abort = true;
                            }
                        }
                    }
                }

                /*****************************************
                 * 
                 *                Hidden Pairs
                 * 
                 *****************************************/
                 for (let blockRow = 0; !abort && blockRow < 3; blockRow++) {
                    for (let blockCol = 0; !abort && blockCol < 3; blockCol++) {
                        // Create a map of possible values to tiles
                        let possibleValuesToTiles = {};
                        for (let num = 1; num <= 9; num++) {
                            possibleValuesToTiles[num] = [];
                            // If the num is a possible value of a tile, add the tile to the array
                            for (let row = blockRow * 3; row < blockRow * 3 + 3; row++) {
                                for (let col = blockCol * 3; col < blockCol * 3 + 3; col++) {
                                    if (board[row][col].value === null && board[row][col].possibleValues.includes(num)) {
                                        possibleValuesToTiles[num].push(board[row][col]);
                                    }
                                }
                            }
                        }
                        // Get the elements in the map that have only two tiles
                        let possibleValuesWithTwoTiles = Object.entries(possibleValuesToTiles).filter(([key, value]) => value.length === 2);
                        // loop through the possibleValuesWithTwoTiles and see if any of them have the same two tiles
                        // if so, remove all other possible values from those two tiles
                        for (let i = 0; i < possibleValuesWithTwoTiles.length; i++) {
                            for (let j = i + 1; j < possibleValuesWithTwoTiles.length; j++) {
                                if (Mixins.arraysAreEqual(possibleValuesWithTwoTiles[i][1], possibleValuesWithTwoTiles[j][1])) {
                                    // console.log("Found a hidden pair: ", possibleValuesWithTwoTiles[i][0], possibleValuesWithTwoTiles[j][0], possibleValuesWithTwoTiles[i][1]);
                                    const value1 = possibleValuesWithTwoTiles[i][0];
                                    const value2 = possibleValuesWithTwoTiles[j][0];
                                    const tile1 = possibleValuesWithTwoTiles[i][1][0];
                                    const tile2 = possibleValuesWithTwoTiles[i][1][1];
                                    // Remove all other possible values from tile1 and tile2
                                    tile1.possibleValues = [parseInt(value1), parseInt(value2)];
                                    tile2.possibleValues = [parseInt(value1), parseInt(value2)];
                                    abort = true;
                                }
                            }
                        }
                    }
                }
                return Mixins.copy(board);
            },

            // Use this for more heuristics:
            // https://www.youtube.com/watch?v=b123EURtu3I

            removeNakedSingles(board) {
                // Initialize an array of transformations and an abort flag
                // Go through each row and look for tiles that have only one possible value
                // If you find one, add it to the transformations array and set the abort flag to true
                // If there are transformations at the end of the loop, only apply the first one.  Then return the board
                let abort = false;
                let transformations = [];
                for (let row = 0; !abort && row < board.length; row++) {
                    for (let col = 0; !abort && col < board[row].length; col++) {
                        if (board[row][col].value === null && board[row][col].possibleValues.length === 1) {
                            transformations.push({
                                row: row,
                                col: col,
                                value: board[row][col].possibleValues[0]
                            });
                            abort = true;
                        }
                    }
                }
                // Go through each col and look for tiles that have only one possible value
                // If you find one, add it to the transformations array and set the abort flag to true
                for (let col = 0; !abort && col < board[0].length; col++) {
                    for (let row = 0; !abort && row < board.length; row++) {
                        if (board[row][col].value === null && board[row][col].possibleValues.length === 1) {
                            transformations.push({
                                row: row,
                                col: col,
                                value: board[row][col].possibleValues[0]
                            });
                            abort = true;
                        }
                    }
                }

                // Go through each block and look for tiles that have only one possible value
                // If you find one, add it to the transformations array and set the abort flag to true
                for (let blockRow = 0; !abort && blockRow < 3; blockRow++) {
                    for (let blockCol = 0; !abort && blockCol < 3; blockCol++) {
                        for (let row = blockRow * 3; !abort && row < blockRow * 3 + 3; row++) {
                            for (let col = blockCol * 3; !abort && col < blockCol * 3 + 3; col++) {
                                if (board[row][col].value === null && board[row][col].possibleValues.length === 1) {
                                    transformations.push({
                                        row: row,
                                        col: col,
                                        value: board[row][col].possibleValues[0]
                                    });
                                    abort = true;
                                }
                            }
                        }
                    }
                }

                if (transformations.length > 0) {
                    const row = transformations[0].row;
                    const col = transformations[0].col;
                    const value = transformations[0].value;
                    board = this.promoteValueAndPrune(Mixins.copy(board), row, col, value);
                }
                return board;

            },

            findUniqueValues(board) {
                // Go through each row, iterate through numbers 1-9, and see if there is only one tile in that row that has that possible value
                // If so, set the value of the tile in the board to that value and set possibleValues to []
                // Stop the ENTIRE loop if you find a tile with only one possible value
                let abort = false;
                let transformations = [];
                for (let row = 0; !abort && row < board.length; row++) {
                    for (let num = 1; !abort && num <= 9; num++) {
                        let tilesWithNum = [];
                        for (let col = 0; !abort && col < board[row].length; col++) {
                            if (board[row][col].value === null && board[row][col].possibleValues.includes(num)) {
                                tilesWithNum.push(Mixins.copy(board[row][col]));
                            }
                        }
                        if (tilesWithNum.length === 1) {
                            transformations.push({
                                row: tilesWithNum[0].row,
                                col: tilesWithNum[0].col,
                                value: num
                            });
                            abort = true;
                        }
                    }
                }
                if (transformations.length > 0) {
                    const row = transformations[0].row;
                    const col = transformations[0].col;
                    const value = transformations[0].value;
                    board = this.promoteValueAndPrune(Mixins.copy(board), row, col, value);
                }
                return Mixins.copy(board);
            },

            promoteValueAndPrune(board, row, col, value) {
                board[row][col].value = value;
                board[row][col].possibleValues = [];
                // Go through the board and remove the value from the possible values of all other tiles in the row, col, and block
                for (let c = 0; c < board[row].length; c++) {
                    if (c !== col && board[row][c].value === null && board[row][c].possibleValues.includes(value)) {
                        board[row][c].possibleValues = board[row][c].possibleValues.filter(v => v !== value);
                    }
                }
                for (let r = 0; r < board.length; r++) {
                    if (r !== row && board[r][col].value === null && board[r][col].possibleValues.includes(value)) {
                        board[r][col].possibleValues = board[r][col].possibleValues.filter(v => v !== value);
                    }
                }
                const blockRow = Math.floor(row / 3);
                const blockCol = Math.floor(col / 3);
                for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                    for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
                        if (r !== row && c !== col && board[r][c].value === null && board[r][c].possibleValues.includes(value)) {
                            board[r][c].possibleValues = board[r][c].possibleValues.filter(v => v !== value);
                        }
                    }
                }
                return Mixins.copy(board);
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
                        // Compare the possible values
                        if (!Mixins.arraysAreEqual(board1[row][col].possibleValues, board2[row][col].possibleValues)) {
                            return false;
                        }
                    }
                    
                }
                return true;
            },

            hasNoMultipleValues(arr) {
                // create a function that checks if an array has two or more of the same number
                // Create a set, iterate through, add to the set, and stop if you see something in the set
                let set = new Set();
                for (let i = 0; i < arr.length; i++) {
                    if (set.has(arr[i])) {
                        return false;
                    } else {
                        set.add(arr[i]);
                    }
                }
                // remove the set from memory
                set = null;
                return true;
            },

            boardIsValid(board, id=null) {
                // console.log("Checking if board is valid...");
                const rowIsValid = (row) => {
                    let values = [];
                    for (let col = 0; col < board[row].length; col++) {
                        const value = board[row][col].value;
                        if (value !== null) {
                            values.push(value);
                        }
                    }                    
                    return this.hasNoMultipleValues(values);
                };

                const colIsValid = (col) => {
                    const values = [];
                    for (let row = 0; row < board.length; row++) {
                        const value = board[row][col].value;
                        if (value !== null) {
                            values.push(value);
                        }
                    }
                    return this.hasNoMultipleValues(values);
                };

                const blockIsValid = (row, col) => {
                    const values = [];
                    const blockRow = Math.floor(row / 3);
                    const blockCol = Math.floor(col / 3);
                    for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                        for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
                            const value = board[r][c].value;
                            if (value !== null) {
                                values.push(value);
                            }
                        }
                    }
                    return this.hasNoMultipleValues(values);
                };
                
                // loop through board and check if each row, col, and block is valid
                for (let row = 0; row < board.length; row++) {
                    if (!rowIsValid(row)) {
                        // console.log("(X) Row fail: ", row, " id: ", id, board);
                        return false;
                    }
                }
                for (let col = 0; col < board[0].length; col++) {
                    if (!colIsValid(col)) {
                        // console.log("(X) Col fail: ", col, board);
                        return false;
                    }
                }
                for (let row = 0; row < board.length; row += 3) {
                    for (let col = 0; col < board[0].length; col += 3) {
                        if (!blockIsValid(row, col)) {
                            // console.log("(X) block fail: ", row, col, board);
                            return false;
                        }
                    }
                }
                // console.log("Survival of the fittest!");
                return true;
            },

            boardIsCorrect(board) {
                // console.log("Checking if board is correct...");
                const rowIsCorrect = (row) => {
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
                    return this.hasNoMultipleValues(values);
                };

                const colIsCorrect = (col) => {
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
                    return this.hasNoMultipleValues(values);
                };

                const blockIsCorrect = (row, col) => {
                    const values = [];
                    const blockRow = Math.floor(row / 3);
                    const blockCol = Math.floor(col / 3);
                    for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
                        for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
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
                    return Mixins.arraysAreEqual(values.sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
                };

                // loop through board and check if each row, col, and block is valid
                for (let row = 0; row < board.length; row++) {
                    if (!rowIsCorrect(row)) {
                        return false;
                    }
                }
                for (let col = 0; col < board[0].length; col++) {
                    if (!colIsCorrect(col)) {
                        return false;
                    }
                }
                for (let row = 0; row < board.length; row += 3) {
                    for (let col = 0; col < board[0].length; col += 3) {
                        if (!blockIsCorrect(row, col)) {
                            return false;
                        }
                    }
                }
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
                return full;
            },

            splitSolutionObject(solutionObj) {
                let board = Mixins.copy(solutionObj.board);
                let minPossibleValues = 10;
                let minPossibleValuesTile = null;
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        let tile = board[row][col];
                        if (tile.value === null && tile.possibleValues.length < minPossibleValues) {
                            minPossibleValues = tile.possibleValues.length;
                            minPossibleValuesTile = tile;
                        }
                    }
                }
                for (let i = 0; i < minPossibleValuesTile.possibleValues.length; i++) {
                    const value = minPossibleValuesTile.possibleValues[i];
                    this.globalBoardId++;
                    let newSolutionObj = {
                        id: this.globalBoardId,
                        depth: solutionObj.depth + 1,
                        board: null,
                        children: []
                    };
                    let newBoard = this.promoteValueAndPrune(Mixins.copy(board), minPossibleValuesTile.row, minPossibleValuesTile.col, value);
                    newSolutionObj.board = newBoard;
                    solutionObj.children.push(newSolutionObj);
                }
                if (solutionObj.depth + 1 > this.maxDepth) {
                    this.maxDepth = solutionObj.depth + 1;
                }
            
                return solutionObj;
            },

            renderBoard() {
                // Draw black background to hidden context
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);


                /***************************************
                 * 
                 *      Render the board
                 * 
                 ***************************************/
                let board = this.displayBoard;
                //let board = this.solutionObj.board;

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
        width: 550px;
    }
    #rightSide {
        background-color: #fff;
        float: left;
        width: 229px;
        height: 570px;
        border: 1px solid black;
        border-left: none;
        padding-top: 30px;
        
        /* #buttons {
            margin-top: 100px;
        } */
        .btn {
            margin: 10px;
            width: 170px;
            height: 50px;
            font-size: 20px;
            background-color: #ccc;
        }
        .btn:hover {
            background-color: #ddd;
        }

        #impossibleButton {
            margin-bottom: 100px;
        }
    }

    #instructions {
        margin-top: 100px;
    }
    
</style>