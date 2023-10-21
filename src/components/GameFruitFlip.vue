<template>
    <canvas id="mainCanvas" ref="canvas" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
    const gameWidthDefault = 800;
    const gameHeightDefault = 333;

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
                    // let currentScreen = screens.find(screen => screen.name === "Opening");
                    // // iterate through all properties of currentScreen and add them to this.gs
                    // for (let prop in currentScreen) {
                    //     this.gs[prop] = currentScreen[prop];
                    // }
                    this.gs.name = "Opening";
                    this.gs.lives = 3;
                    this.gs.blinkTimer = Date.now();
                    this.gs.showText = true;
                } else if (screenName === "Level") {
                    // Load the level
                } else if (screenName === "Level End") {
                    // Load the level end screen
                }
            },
        

            gameLoop() {
                if (this.gs.name === "Opening") {
                    this.renderOpeningScreen();
                } else if (this.gs.name === "Level") {
                    this.drawLevelScreen();
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
        } // methods
    }; // export default

</script>