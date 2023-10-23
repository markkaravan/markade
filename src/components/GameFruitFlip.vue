<template>
    <img ref="fruitCherry" :src="'/src/assets/images/fruit_cherry.png'" :style="{ display: 'none' }">
    <img ref="fruitGrapes" :src="'/src/assets/images/fruit_grapes.png'" :style="{ display: 'none' }">
    <img ref="fruitGreenApple" :src="'/src/assets/images/fruit_kiwi.png'" :style="{ display: 'none' }">
    <img ref="fruitBlueberry" :src="'/src/assets/images/fruit_blueberry.png'" :style="{ display: 'none' }">
    <img ref="fruitYellow" :src="'/src/assets/images/fruit_banana.png'" :style="{ display: 'none' }">
    <img ref="fruitOrange" :src="'/src/assets/images/fruit_orange_full.png'" :style="{ display: 'none' }">

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
    const scorePositionX = 50;
    const scorePositionY = 50;
    const fruitTypes = [
        { name: "red", fruit: "strawberry", imgRef: "fruitCherry" },
        { name: "orange", fruit: "orange", imgRef: "fruitOrange" },
        { name: "yellow", fruit: "banana", imgRef:  "fruitYellow" },
        { name: "green", fruit: "pear", imgRef: "fruitGreenApple"  },
        { name: "blue", fruit: "blueberry", imgRef: "fruitBlueberry" },
        { name: "purple", fruit: "grape", imgRef:  "fruitGrapes"  }
    ];
    const pointColors = [ 
        { cn: 1,  color: 'white' },
        { cn: 2,  color: 'yellow' },
        { cn: 3,  color: 'orange' },
        { cn: 4,  color: 'red' },
        { cn: 5,  color: 'purple' },
        { cn: 6,  color: 'blue' },
        { cn: 7,  color: 'green' },
        { cn: 8,  color: 'pink' },
        { cn: 9,  color: 'brown' },
        { cn: 10, color: 'black' },
    ]

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
                    inspectMode: false,
                    pointsDisplayArray: [],
                    cascadeNumber: 0,
                    mode: "notPlaying", // "filling", "playing", "detectingClusters", "droppingFruits", "replacingFruits"
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
                    this.gs.board = [];
                    for (let row = 0; row < rows; row++) {
                        this.gs.board[row] = [];
                        for (let col = 0; col < columns; col++) {
                            this.gs.board[row][col] = null;
                        }
                    }
                    this.changeMode("replaceEmptyTiles");
                    this.replaceEmptyTiles();
                    this.gs.timerStart = Date.now();
                    this.gs.currentFruitType = this.selectRandomFruitType();
                } else if (screenName === "Level End") {
                    this.gs.name = "Level End";
                    this.gs.blinkTimer = Date.now();
                    this.gs.showText = true;
                }
            },
        
            generateFruit(fruitType, x, y, falling = false) {
                return {
                    name: fruitType.name,
                    fruit: fruitType.fruit,
                    image: this.$refs[fruitType.imgRef],
                    x: x,
                    y: y,
                    falling: falling,
                    fallVelocity: 0,
                }
            },

            boardIsFull() {
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        if (this.gs.board[row][col] === null) {
                            return false;
                        }
                    }
                }
                return true;
            },

            changeMode(newMode) {
                if (newMode === "playing") {
                    this.gs.mode = "playing";
                    this.gs.cascadeNumber = 0;
                    console.log("Changing mode: playing")
                } else if (newMode === "checkAndRemove") {
                    this.gs.mode = "checkAndRemove";
                    console.log("Changing mode: checkAndRemove")
                } else if (newMode === "droppingFruits") {
                    this.gs.mode = "droppingFruits";
                    console.log("Changing mode: droppingFruits")
                } else if (newMode === "replaceEmptyTiles") {
                    this.gs.mode = "replaceEmptyTiles";
                    console.log("Changing mode: replaceEmptyTiles")
                } else if (newMode === "notPlaying") {
                    this.gs.mode = "notPlaying";
                    console.log("Changing mode: notPlaying")
                } else {
                    console.log("ERROR: changeMode() called with invalid mode: ", newMode);
                }
            },

            gameLoop() {
                if (this.gs.name === "Opening") {
                    this.renderOpeningScreen();
                } else if (this.gs.name === "Level") {
                    this.updateGameState();
                } else if (this.gs.name === "Level End") {
                    this.renderLevelEndScreen();
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

            renderLevelEndScreen() {
                // Draw black background to hidden context
                this.hiddenCtx.fillStyle = 'black';
                this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

                // Render white text in the middle that says "Great job!" ont he first line
                // and "your score was {this.gs.score} points"
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.font = '100px Helvetica';
                this.hiddenCtx.fillText('Great job!', this.dataGameWidth / 2 - 220, this.dataGameHeight / 2 + 50);
                this.hiddenCtx.font = '24px Helvetica';
                this.hiddenCtx.fillText(`Your score was ${this.gs.score} points`, this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 100);
                
                // If it has been > 1 second since the last blink, toggle the showText boolean
                if (Date.now() - this.gs.blinkTimer > 1000) {
                    this.gs.blinkTimer = Date.now();
                    this.gs.showText = !this.gs.showText;
                }

                // Draw blinking white subtext that says "press spacebar to start game"
                if (this.gs.showText) {
                    this.hiddenCtx.fillStyle = 'white';
                    this.hiddenCtx.font = '24px Helvetica';
                    this.hiddenCtx.fillText('Press spacebar to play again', this.dataGameWidth / 2 - 150, this.dataGameHeight - 50);
                }

                // Draw to main canvas
                this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
                this.ctx.drawImage(this.hiddenCanvas, 0, 0);
            },

            handleKeyDown(event) {
                if (this.gs.name === 'Opening' || this.gs.name === 'Level End') {
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
                    } else if (event.code === 'KeyI') {
                        this.gs.inspectMode = !this.gs.inspectMode;
                    }
                }
            },

            // mouse hover event where it shows the current row and tile in console.log 
            // and shows the tile's image in the top right corner of the screen
            handleMouseMove(event) {
                // Calculate the row and column of the clicked square
                const rect = this.$refs.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const col = Math.floor((x - boardOffsetX) / tileWidth);
                const row = Math.floor((y - boardOffsetY) / tileWidth);

                // If inspect mode is on, it shows the details of the tile and stops here
                if (this.gs.inspectMode) {
                    console.log("Inspecting: ", this.gs.board[row][col]);
                    return;
                }
            },

            // replaceEmptyTiles() finds all empty tiles.
            // It does this by looping through rows from the highest value to lowest value, then looping through the columns from left to right.
            // It generates an array called emptyTiles that contains the row and column of each empty tile, sorted by row and then column.
            // It then loops through the emptyTiles array and replaces each empty tile with a random fruit.
            // Before replacing the empty tile, it checks the tile to the left (if any), right (if any) and below (if any) to see if it is the same fruit.
            // It selects a random fruit that is NOT in the adjacent tiles, and replaces the empty tile with that fruit.
            // If there are no fruits that are not in the adjacent tiles, it selects a random fruit.
            replaceEmptyTiles() {
                this.changeMode("replaceEmptyTiles");
                let emptyTiles = [];
                for (let row = rows-1; row >= 0; row--) {
                    for (let col = 0; col < columns; col++) {
                        if (this.gs.board[row][col] === null) {
                            emptyTiles.push({ row, col });
                        }
                    }
                }
                emptyTiles.sort((a, b) => {
                    if (a.row < b.row) {
                        return 1;
                    } else if (a.row > b.row) {
                        return -1;
                    } else {
                        if (a.col < b.col) {
                            return -1;
                        } else if (a.col > b.col) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
                for (let tile of emptyTiles) {
                    let adjacentFruits = [];
                    if (tile.col > 0 && this.gs.board[tile.row][tile.col - 1]) {
                        adjacentFruits.push(this.gs.board[tile.row][tile.col - 1].name);
                    }
                    if (tile.col < columns - 1 && this.gs.board[tile.row][tile.col + 1]) {
                        adjacentFruits.push(this.gs.board[tile.row][tile.col + 1].name);
                    }
                    if (tile.row < rows - 1 && this.gs.board[tile.row + 1][tile.col]) {
                        adjacentFruits.push(this.gs.board[tile.row + 1][tile.col].name);
                    }
                    let randomFruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                    // TODO fix this, it works but it's gay
                    while (adjacentFruits.includes(randomFruitType.name)) {
                        randomFruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                    }
                    this.gs.board[tile.row][tile.col] = this.generateFruit(randomFruitType, tile.col * tileWidth + boardOffsetX, tile.row * tileWidth + boardOffsetY);
                }
                this.changeMode("playing");
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
                if (!this.gs.board[row] || !this.gs.board[row][col]) {
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
                this.gs.cascadeNumber++;
                let cn = this.gs.cascadeNumber;
                
                for (let tile of cluster) {
                    // direction is an x, y velocity that is found by getting the difference between the tile's position and the score display's position
                    let x = tile.col * tileWidth + boardOffsetX;
                    let y = tile.row * tileWidth + boardOffsetY;
                    let id = Math.floor(Math.random() * 100000000);


                    this.gs.pointsDisplayArray.push({
                        id: id,
                        x: x,
                        y: y,
                        points: 100 * cn,
                        direction: {
                            x: - (x / 1000),
                            y: - (y / 1000),
                        },
                        fontSize: 24 + (cn * 2),
                        fontColor: (cn <= 10)? pointColors.find(pc => pc.cn === cn).color : 'white',
                        speed: cn,
                    });
                    this.gs.board[tile.row][tile.col] = null;
                }
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

                // If inspect mode is on, it shows the details of the tile and stops here
                if (this.gs.inspectMode) {
                    console.log("Inspecting: ", this.gs.board[row][col]);
                    return;
                }

                // Determine whether a tile was clicked
                if (row < 0 || row >= rows || col < 0 || col >= columns) {
                    console.log("nothing clicked");
                    return;
                }

                // If the clicked square is the same color as the current fruit, do nothing
                if (this.gs.board[row][col] && this.gs.board[row][col].name === this.gs.currentFruitType.name) {
                    console.log("same color");
                    return; 
                }

                // Replace the fruit at the clicked square with the current fruit
                this.gs.board[row][col] = this.generateFruit(this.gs.currentFruitType, col * tileWidth + boardOffsetX, row * tileWidth + boardOffsetY);
                

                // Look for clusters
                this.changeMode("checkAndRemove");
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
                            // Draw the tile's image
                            this.hiddenCtx.drawImage(tile.image, tile.x, tile.y, tileWidth, tileWidth);
                        }
                    }
                }

                /**************************************************************** 
                 * 
                 *              MODE: checkAndRemove 
                 * 
                 ***************************************************************/

                 if (this.gs.mode === "checkAndRemove") {
                    // A cluster is a series of adjacent tiles of the same fruit type
                    // Iterate through the board and find clusters
                    let clusterToRemove = null;
                    let abort = false;
                    for (let row = 0; row < rows && !abort; row++) {
                        for (let col = 0; col < columns && !abort; col++) {
                            let fruitType = this.gs.board[row][col];
                            if (fruitType === null) {
                                continue;
                            }
                            let cluster = this.findCluster(row, col, fruitType.name, new Set());
                            if (cluster.length >= 3) {
                                clusterToRemove = cluster;
                                abort = true;
                            }
                        }
                    }
                    if (clusterToRemove) {
                        this.removeCluster(clusterToRemove);
                        // Find each tile in the cluster that has the lowest row value for each column
                        // Mark the tiles above as falling
                        let lowestRowForCol = new Map();
                        let affectedCols = new Set();
                        for (let tile of clusterToRemove) {
                            affectedCols.add(tile.col);
                            if (!lowestRowForCol.has(tile.col)) {
                                lowestRowForCol.set(tile.col, tile.row);
                            } else {
                                if (tile.row > lowestRowForCol.get(tile.col)) {
                                    lowestRowForCol.set(tile.col, tile.row);
                                }
                            }
                        }
                        for (let [col, row] of lowestRowForCol) {
                            for (let r = row-1; r >= 0; r--) {
                                if (this.gs.board[r][col]) {
                                    this.gs.board[r][col].falling = true;
                                }
                            }
                        }
                        this.changeMode("droppingFruits");
                        this.gs.currentFruitType = this.selectRandomFruitType();

                    } else {
                        // If there are no clusters, see if the board is full
                        console.log("NO CLUSTER TO REMOVE, CHECKING IF BOARD IS FULL",  this.boardIsFull());
                        if (this.boardIsFull()) {
                            this.changeMode("playing");
                        } else {
                            this.replaceEmptyTiles();
                        }

                    }
                }



                /**************************************************************** 
                 * 
                 *              MODE: droppingFruits 
                 * 
                 ***************************************************************/
                if (this.gs.mode === "droppingFruits") {

                    // Update the falling fruit position
                    // Loop through rows, bottom to top, then loop through the cols
                    let fallingArray = [];
                    for (let row = rows-1; row >= 0; row--) {
                        for (let col = 0; col < columns; col++) {
                            let tile = this.gs.board[row][col];
                            if (tile && tile.falling) {
                                tile.y += tile.fallVelocity;
                                tile.fallVelocity += (0.1 * this.gs.cascadeNumber);
                                // Collision detection: get the tile's new row  
                                let newRow = Math.floor((tile.y - boardOffsetY) / tileWidth);
                                // if the tile below the new row is not falling, or the row is the bottom, it has reached the bottom
                                if (newRow >= rows-1 || (this.gs.board[newRow + 1] && this.gs.board[newRow + 1][col] && !this.gs.board[newRow + 1][col].falling)) {
                                    // Set the board at the new row to the tile, and set the tile's y to the new row, then remove the tile from the old row
                                    this.gs.board[newRow][col] = tile;
                                    this.gs.board[newRow][col].y = newRow * tileWidth + boardOffsetY;
                                    this.gs.board[row][col] = null;
                                    this.gs.board[newRow][col].falling = false;
                                    this.gs.board[newRow][col].fallVelocity = 0;
                                    this.gs.board[newRow][col].name = tile.name;
                                } else {
                                    fallingArray.push(tile);
                                }
                            }
                        }
                    }
                    if (fallingArray.length === 0) {
                        this.changeMode("checkAndRemove");
                    } else {
                        // Draw the board's falling tiles
                        for (let row = 0; row < rows; row++) {
                            for (let col = 0; col < columns; col++) {
                                let tile = this.gs.board[row][col];
                                if (tile && tile.falling) {
                                    let tile = this.gs.board[row][col];
                                    this.hiddenCtx.drawImage(tile.image, tile.x, tile.y, tileWidth, tileWidth);
                                }
                            }
                        }
                    }
                }

                // If the timer reaches 0, end the game
                if (levelSeconds - Math.floor((Date.now() - this.gs.timerStart) / 1000) <= 0) {
                    this.changeMode("notPlaying");
                
                    this.loadScreen('Level End');
                }

                // Draw the timer and the score.  The timer is at the top middle and the score is at the top left.
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.font = '24px Helvetica';
                this.hiddenCtx.fillText('Timer', this.dataGameWidth / 2 - 150, 50);
                this.hiddenCtx.fillText('Score', scorePositionX, scorePositionY);
                let timerDisplay = levelSeconds - Math.floor((Date.now() - this.gs.timerStart) / 1000);
                this.hiddenCtx.fillText(timerDisplay, this.dataGameWidth / 2 - 150, 80);
                this.hiddenCtx.fillText(this.gs.score, 50, 80);

                // Draw the current fruit type at the right middle of the screen
                if (this.gs.mode === "playing") {
                    this.hiddenCtx.fillStyle = this.gs.currentFruitType.name;
                    this.hiddenCtx.font = '24px Helvetica';
                    this.hiddenCtx.fillText('Current Fruit', this.dataGameWidth - 200, this.dataGameHeight / 2 - 50);
                    // Display the fruit as an image
                    this.hiddenCtx.drawImage(this.$refs[this.gs.currentFruitType.imgRef], this.dataGameWidth - 200, this.dataGameHeight / 2, tileWidth, tileWidth);
                }

                // Draw the board's points display
                for (let i = 0; i < this.gs.pointsDisplayArray.length; i++) {
                    let pointsDisplay = this.gs.pointsDisplayArray[i];
                    pointsDisplay.x += pointsDisplay.direction.x * pointsDisplay.speed;
                    pointsDisplay.y += pointsDisplay.direction.y * pointsDisplay.speed;
                    pointsDisplay.speed += 0.4;
                    this.hiddenCtx.fillStyle = pointsDisplay.fontColor || white;
                    this.hiddenCtx.font = pointsDisplay.fontSize + 'px Helvetica';
                    this.hiddenCtx.fillText(pointsDisplay.points, pointsDisplay.x, pointsDisplay.y);
                    if (pointsDisplay.y < 0) {
                        this.gs.score += pointsDisplay.points;
                    }
                }
                let tempPointsDisplayArray = [];
                for (let i = 0; i < this.gs.pointsDisplayArray.length; i++) {
                    let pointsDisplay = this.gs.pointsDisplayArray[i];
                    if (pointsDisplay.y > scorePositionY) {
                        tempPointsDisplayArray.push(pointsDisplay);
                    } else {
                        this.gs.score += pointsDisplay.points * this.gs.cascadeNumber;
                    }
                }
                this.gs.pointsDisplayArray = tempPointsDisplayArray;

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