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
                    currentFruitType: null,
                    mode: "playing",
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
                            this.gs.board[row][col] = randomFruitType;
                        }
                    }
                    this.gs.timerStart = Date.now();
                    this.gs.currentFruitType = this.selectRandomFruitType();
                } else if (screenName === "Level End") {
                    // Load the level end screen
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
                requestAnimationFrame(this.gameLoop);
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
                            console.log(cluster);
                            this.removeCluster(cluster);
                        }
                    }
                }
            },

            findCluster(row, col, fruitType, visitedTiles) {
                let cluster = [];
                this.findClusterHelper(row, col, fruitType, visitedTiles, cluster);
                return cluster;
            },

            findClusterHelper(row, col, fruitType, visitedTiles, cluster) {
                if (row < 0 || row >= rows || col < 0 || col >= columns) {
                    return;
                }
                if (visitedTiles.has(`${row},${col}`)) {
                    return;
                }
                if (this.gs.board[row][col] !== fruitType) {
                    return;
                }
                visitedTiles.add(`${row},${col}`);
                cluster.push({ row, col });
                this.findClusterHelper(row - 1, col, fruitType, visitedTiles, cluster);
                this.findClusterHelper(row + 1, col, fruitType, visitedTiles, cluster);
                this.findClusterHelper(row, col - 1, fruitType, visitedTiles, cluster);
                this.findClusterHelper(row, col + 1, fruitType, visitedTiles, cluster);
            },

            removeCluster(cluster) {
                for (let tile of cluster) {
                    this.gs.board[tile.row][tile.col] = null;
                }
                this.gs.score += cluster.length;
                console.log("this.gs.board:", this.gs.board);
            },

            handleClick(event) {
                // Calculate the row and column of the clicked square
                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);

                // Replace the fruit at the clicked square with the current fruit
                this.gs.board[row][col] = this.gs.currentFruitType;
                this.gs.mode = "detectingClusters";

                // Detect clusters
                this.detectClusters();

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

                // Draw the board
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        if (this.gs.board[row][col]) {
                            let fruitType = this.gs.board[row][col];
                            let fruit = fruitType.fruit;
                            // Don't render an image, just make the square the fruit color
                            this.hiddenCtx.fillStyle = fruitType.name;
                            const offsetX = boardOffsetX;
                            const offsetY = boardOffsetY;
                            this.hiddenCtx.fillRect(col * tileWidth + offsetX, row * tileWidth + offsetY, tileWidth, tileWidth);
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


                // Draw to main canvas
                this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
            },

        } // methods
    }; // export default

</script>