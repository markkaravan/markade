<template>
    <canvas id="mainCanvas" ref="canvas" @click="handleClick" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
    const gameWidthDefault = 800;
    const gameHeightDefault = 600;
    const boardOffsetX = 100;
    const boardOffsetY = 100;
    const rows = 10;
    const columns = 10;
    const tileWidth = 50;
    const levelSeconds = 60;
    const fruitTypes = [
        { name: "red", fruit: "strawberry" },
        { name: "orange", fruit: "orange" },
        { name: "yellow", fruit: "banana" },
        { name: "green", fruit: "pear" },
        { name: "blue", fruit: "blueberry" },
        { name: "purple", fruit: "grape" }
    ];

    const screens = [
        { name: "Opening"},
        { name: "Level"},
        { name: "Level End"}
    ];

    export default {
        name: 'GameFruitFlip',
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
                gs: {
                    name: "Opening",
                    lives: 3,
                    timerStart: null,
                    score: 0,
                    isPaused: false,
                    currentFruitType: null,
                    mode: "playing", // "playing", "detectingClusters", "droppingFruits", "replacingFruits"
                    // blinkTimer: Date.now(),
                    // showText: true,
                },
            }
        },
        mounted() {
            // This is the canvas context
            this.ctx = this.$refs.canvas.getContext('2d');

            // This is the hidden canvas context
            this.hiddenCanvas = this.$refs.hiddenCanvas;
            this.hiddenCtx = this.hiddenCanvas.getContext('2d');


            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);

            this.loadScreen('Opening', null);
            this.gameLoop();
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
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
            loadScreen(screenName) {
                if (screenName === "Opening") {
                    this.gs.name = "Opening";
                    this.gs.lives = 3;
                    this.gs.blinkTimer = Date.now();
                    this.gs.showText = true;
                } else if (screenName === "Level") {
                    let currentScreen = screens.find(screen => screen.name === screenName);
                    this.gs.name = currentScreen.name;
                    this.gs.score = 0;
                    this.gs.mode = "playing";
                    // initialize this.gs.board with a 2D array of random fruitTypes
                    this.gs.board = [];
                    for (let row = 0; row < rows; row++) {
                        this.gs.board[row] = [];
                        for (let col = 0; col < columns; col++) {
                            let randomFruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                            this.gs.board[row][col] = this.generateFruit(randomFruitType.name, randomFruitType.fruit, col * tileWidth + boardOffsetX, row * tileWidth + boardOffsetY);
                        }
                    }
                    this.gs.timerStart = Date.now();
                    this.gs.currentFruitType = this.selectRandomFruitType();
                } else if (screenName === "Level End") {
                    // Load the level end screen
                }
            },
        
            generateFruit(name, fruit, x, y, falling = false) {
                return {
                    name: name,
                    fruit: fruit,
                    x: x,
                    y: y,
                    falling: falling,
                    fallVelocity: 0,
                }
            },

            gameLoop() {
                if (this.gs.name === "Opening") {
                    this.renderOpeningScreen();
                } else if (this.gs.name === "Level") {
                    this.updateGameState();
                } else if (this.gs.name === "Level End") {
                    this.drawLevelEndScreen();
                }
                // Call the game loop again
                if (!this.gs.isPaused) {
                    requestAnimationFrame(this.gameLoop);
                }
            },

            renderOpeningScreen() {
                // Draw black background to hidden context
                this.hiddenCtx.fillStyle = 'black';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

                // Draw white header text saying the title of the game
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.font = '100px Helvetica';
                this.hiddenCtx.fillText('Fruit Flip', this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 50);

                // If it has been > 1 second since the last blink, toggle the showText boolean
                if (Date.now() - this.gs.blinkTimer > 1000) {
                    this.gs.blinkTimer = Date.now();
                    this.gs.showText = !this.gs.showText;
                }

                // Draw blinking white subtext that says "press spacebar to start game"
                if (this.gs.showText) {
                    this.hiddenCtx.fillStyle = 'white';
                    this.hiddenCtx.font = '24px Helvetica';
                    this.hiddenCtx.fillText('Press spacebar to start game', this.dataGameWidth / 2 - 150, this.dataGameHeight - 50);
                }

                // Draw to main canvas
                this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
            },

            handleKeyDown(event) {
                if (this.gs.name === 'Opening') {
                    if (event.code === 'Space') {
                        this.loadScreen('Level'); 
                    }
                    return;
                } else {
                    if (event.code === 'KeyP') {
                        this.gs.isPaused = !this.gs.isPaused;
                        if (!this.gs.isPaused) {
                            this.gameLoop();
                        }
                    }
                }
            },

            detectClusters() {
                let visitedTiles = new Set();
                // A cluster is a series of adjacent tiles of the same fruit type
                // Iterate through the board and find clusters
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        let fruitType = this.gs.board[row][col];
                        if (visitedTiles.has(`${row},${col}`)) {
                            continue;
                        }
                        let cluster = this.findCluster(row, col, fruitType, visitedTiles);
                        if (cluster.length >= 3) {
                            this.removeCluster(cluster);
                        }
                    }
                }
            },

            findClusterAndRemoveCluster(row, col, fruitTypeName, visitedTiles) {
                let cluster = this.findCluster(row, col, fruitTypeName, visitedTiles);
                if (cluster.length >= 3) {
                    this.removeCluster(cluster);
                }

                // Find each tile in the cluster that has the lowest row value for each column
                let lowestRowForCol = new Map();
                let affectedCols = new Set();
                for (let tile of cluster) {
                    affectedCols.add(tile.col);
                    if (!lowestRowForCol.has(tile.col)) {
                        lowestRowForCol.set(tile.col, tile.row);
                    } else {
                        if (tile.row < lowestRowForCol.get(tile.col)) {
                            lowestRowForCol.set(tile.col, tile.row);
                        }
                    }
                }

                // Mark the tiles above as falling
                for (let [col, row] of lowestRowForCol) {
                    for (let r = row-1; r >= 0; r--) {
                        if (this.gs.board[r][col]) {
                            this.gs.board[r][col].falling = true;
                            console.log(r, col);
                        }
                    }
                }
                this.gs.mode = "droppingFruits";

                console.log(this.gs.board);

                // Return all affected columns
                return affectedCols;
            },

            findCluster(row, col, fruitTypeName, visitedTiles) {
                let cluster = [];
                this.findClusterHelper(row, col, fruitTypeName, visitedTiles, cluster);
                return cluster;
            },

            findClusterHelper(row, col, fruitTypeName, visitedTiles, cluster) {
                if (row < 0 || row >= rows || col < 0 || col >= columns) {
                    return;
                }
                if (visitedTiles.has(`${row},${col}`)) {
                    return;
                }
                if (this.gs.board[row][col].name !== fruitTypeName) {
                    return;
                }
                visitedTiles.add(`${row},${col}`);
                cluster.push({ row, col });
                this.findClusterHelper(row - 1, col, fruitTypeName, visitedTiles, cluster);
                this.findClusterHelper(row + 1, col, fruitTypeName, visitedTiles, cluster);
                this.findClusterHelper(row, col - 1, fruitTypeName, visitedTiles, cluster);
                this.findClusterHelper(row, col + 1, fruitTypeName, visitedTiles, cluster);
            },

            removeCluster(cluster) {
                for (let tile of cluster) {
                    this.gs.board[tile.row][tile.col] = null;
                }
                this.gs.score += cluster.length;
                console.log("this.gs.board:", this.gs.board);
            },

            dropFruit(affectedCols) {
                // Drop the fruit down
                for (let col of affectedCols) {
                    let row = rows - 1;
                    while (row >= 0) {
                        if (this.gs.board[row][col] === null) {
                            // Find the next fruit above this one
                            let nextFruitRow = row - 1;
                            while (nextFruitRow >= 0) {
                                if (this.gs.board[nextFruitRow][col] !== null) {
                                    // Swap the fruit
                                    this.gs.board[row][col] = this.gs.board[nextFruitRow][col];
                                    this.gs.board[nextFruitRow][col] = null;
                                    break;
                                }
                                nextFruitRow--;
                            }
                        }
                        row--;
                    }
                }
            },


            dropNewFruits(affectedCols) {
                // Drop new, randomly generated fruits from the top
                for (let col of affectedCols) {
                    let row = 0;
                    while (row < rows) {
                        if (this.gs.board[row][col] === null) {
                            let randomFruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                            this.gs.board[row][col] = randomFruitType;
                        }
                        row++;
                    }
                }
            },

            handleClick(event) {
                // Calculate the row and column of the clicked square
                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);

                // Replace the fruit at the clicked square with the current fruit
                this.gs.board[row][col] = this.generateFruit(this.gs.currentFruitType.name, this.gs.currentFruitType.fruit, col * tileWidth + boardOffsetX, row * tileWidth + boardOffsetY);
                
                // Set the game state to detecting clusters
                this.gs.mode = "detectingClusters";

                // Detect clusters and remove them
                let affectedCols = this.findClusterAndRemoveCluster(row, col, this.gs.currentFruitType.name, new Set());

                // Drop the fruit down
                // this.dropFruit(affectedCols);
                //this.markFallingFruits(affectedCols);

                this.gs.mode = "replacingFruits";

                // Drop new, randomly generated fruits from the top
                // this.dropNewFruits(affectedCols);

                // NOW LOOK FOR NEW CLUSTERS

                // Set a new current fruit
                this.gs.currentFruitType = this.selectRandomFruitType();

                // Update the game state
                this.updateGameState();
            },

            selectRandomFruitType() {
                return fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            },

            updateGameState() {
                // Draw black background to hidden context
                this.hiddenCtx.fillStyle = 'black';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

                // Draw the board's static tiles
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        let tile = this.gs.board[row][col];
                        if (tile && !tile.falling) {
                            let tile = this.gs.board[row][col];
                            this.hiddenCtx.fillStyle = tile.name;
                            const offsetX = boardOffsetX;
                            const offsetY = boardOffsetY;
                            this.hiddenCtx.fillRect(tile.x, tile.y, tileWidth, tileWidth);
                        }
                    }
                }

                // Update the position of the falling tiles
                if (this.gs.mode === "droppingFruits" || this.gs.mode === "replacingFruits") {
                    let fallingArray = [];
                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < columns; col++) {
                            let tile = this.gs.board[row][col];
                            if (tile && tile.falling) {
                                fallingArray.push(tile);
                                tile.y += tile.fallVelocity;
                                tile.fallVelocity += 0.1;
                                if (tile.y >= row * tileWidth + boardOffsetY) {
                                    tile.y = row * tileWidth + boardOffsetY;
                                    tile.falling = false;
                                    tile.fallVelocity = 0;
                                }
                            }
                        }
                    }
                    console.log("fallingArray:", fallingArray);
                }


                // Draw the board's falling tiles
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        let tile = this.gs.board[row][col];
                        if (tile && tile.falling) {
                            let tile = this.gs.board[row][col];
                            this.hiddenCtx.fillStyle = tile.name;
                            const offsetX = boardOffsetX;
                            const offsetY = boardOffsetY;
                            this.hiddenCtx.fillRect(tile.x, tile.y, tileWidth, tileWidth);
                        }
                    }
                }

                // Draw the timer and the score.  The timer is at the top middle and the score is at the top left.
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.font = '24px Helvetica';
                this.hiddenCtx.fillText('Timer', this.dataGameWidth / 2 - 150, 50);
                this.hiddenCtx.fillText('Score', 50, 50);
                let timerDisplay = levelSeconds - Math.floor((Date.now() - this.gs.timerStart) / 1000);
                this.hiddenCtx.fillText(timerDisplay, this.dataGameWidth / 2 - 150, 80);
                this.hiddenCtx.fillText(this.gs.score, 50, 80);

                // Draw the current fruit type at the right middle of the screen
                this.hiddenCtx.fillStyle = this.gs.currentFruitType.name;
                this.hiddenCtx.font = '24px Helvetica';
                this.hiddenCtx.fillText('Current Fruit', this.dataGameWidth - 200, this.dataGameHeight / 2 - 50);
                // Display the fruit as a colored square
                this.hiddenCtx.fillRect(this.dataGameWidth - 200, this.dataGameHeight / 2, tileWidth, tileWidth);

                // If the game is paused, display "PAUSED" in the center of the screen in big letters
                if (this.gs.isPaused) {
                    this.hiddenCtx.fillStyle = 'white';
                    this.hiddenCtx.font = '100px Helvetica';
                    this.hiddenCtx.fillText('PAUSED', this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 50);
                }


                // Draw to main canvas
                this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
            },

        } // methods
    }; // export default

</script>