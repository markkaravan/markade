<template>
    <canvas id="mainCanvas" ref="canvas" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
const gameWidthDefault = 800;
const gameHeightDefault = 333;

export default {
    name: 'GameGravity',
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
                // gs has a variable called gravity that is a vector, it has an x and y component
                gravity: {
                    x: 0,
                    y: 2
                },

                player: {
                    x: 400,
                    y: 400,
                    height: 30,
                    width: 15,
                    speed: 5,
                    movingUp: false,
                    movingDown: false,
                    movingLeft: false,
                    movingRight: false,
                    touchingGround: false,
                    touchingLeftWall: false,
                    touchingRightWall: false,
                },

                // The gs has an obstacle property that is an array of objects
                // Each object has an x, y, width, and height property
                obstacles: [
                    {
                        x: 100,
                        y: 100,
                        width: 50,
                        height: 50
                    },
                    {
                        x: 200,
                        y: 200,
                        width: 50,
                        height: 50
                    },
                    {
                        x: 300,
                        y: 550,
                        width: 50,
                        height: 50
                    },
                    // There are two additional obstacles which cover the ground of the level.
                    // Between them is a pit.
                    {
                        x: 0,
                        y: 600,
                        width: 1200 / 2,
                        height: 50
                    },
                    {
                        x: 1200 / 2 + 50,
                        y: 600,
                        width: 900,
                        height: 50
                    },
                ],

                // The gs has a goal property that is an object
                // The goal object has an x, y, width, and height property
                goal: {
                    x: 700,
                    y: 300,
                    width: 50,
                    height: 50
                }

            }
        }
    },
    mounted() {
        // This is the canvas context
        this.ctx = this.$refs.canvas.getContext('2d');

        // This is the hidden canvas context
        this.hiddenCanvas = this.$refs.hiddenCanvas;
        this.hiddenCtx = this.hiddenCanvas.getContext('2d');

        this.updateGameState(performance.now());
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
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
        handleKeyDown(event) {
            switch (event.code) {
                // case 'KeyW':
                //     this.gs.player.movingUp = true;
                //     break;
                case 'KeyA':
                    this.gs.player.movingLeft = true;
                    break;
                // case 'KeyS':
                //     this.gs.player.movingDown = true;
                //     break;
                case 'KeyD':
                    this.gs.player.movingRight = true;
                    break;
            }
        },
        handleKeyUp(event) {
            switch (event.code) {
                // case 'KeyW':
                //     this.gs.player.movingUp = false;
                //     break;
                case 'KeyA':
                    this.gs.player.movingLeft = false;
                    break;
                // case 'KeyS':
                //     this.gs.player.movingDown = false;
                //     break;
                case 'KeyD':
                    this.gs.player.movingRight = false;
                    break;
            }
        },
        updateGameState(timestamp) {

            /**************************************
             * 
             *       Rendering
             * 
             * *************************************/

            // Background
            this.hiddenCtx.fillStyle = 'white';
            this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

            // Player
            this.hiddenCtx.fillStyle = 'black';
            let player = this.gs.player;

            this.hiddenCtx.fillRect(
                player.x - player.width / 2,
                player.y - player.height / 2,
                player.width,
                player.height
            );

            // Obstacles
            this.hiddenCtx.fillStyle = 'red';
            this.gs.obstacles.forEach(obstacle => {
                this.hiddenCtx.fillRect(
                    obstacle.x - obstacle.width / 2,
                    obstacle.y - obstacle.height / 2,
                    obstacle.width,
                    obstacle.height
                );
            });

            // Draw
            this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
            this.ctx.drawImage(this.hiddenCanvas, 0, 0);

            /**************************************
             * 
             *       Movement
             * 
             * *************************************/

            // Player movement
            // if the player is not touching an obstacle below him, his isGrounded variable is false
            // if the player is not grounded, he is affected by gravity and falls until he hits the ground or the board's edge
            // if (!player.isGrounded) {
            //     player.y += this.gs.gravity.y;
            // }
            // If the player is grounded, he can move left and right

            





            /**************************************
             * 
             *       Collision Detection
             * 
             * *************************************/

            // Initialize player's touching states to false
            player.touchingGround = false;
            player.touchingLeftWall = false;
            player.touchingRightWall = false;

            // Detect player collision with the top of an object
            this.gs.obstacles.forEach(obstacle => {
                if (
                    player.x + player.width / 2 > obstacle.x - obstacle.width / 2 &&
                    player.x - player.width / 2 < obstacle.x + obstacle.width / 2 &&
                    player.y + player.height / 2 > obstacle.y - obstacle.height / 2 &&
                    player.y - player.height / 2 < obstacle.y + obstacle.height / 2
                ) {
                    if (player.y + player.height <= obstacle.y) {
                       player.touchingGround = true;
                    }
                    else if (player.x <= obstacle.x + obstacle.width) {
                        player.touchingLeftWall = true;
                    }
                    else if (player.x + player.width >= obstacle.x) {
                        player.touchingRightWall = true;
                    }
                }
            });

            if (player.touchingLeftWall) {
                player.movingLeft = false;
            }

            if (player.touchingRightWall) {
                player.movingRight = false;
            }

            // Apply gravity if the player is not touching the ground
            if (!player.touchingGround) {
                player.y += this.gs.gravity.y;
            }

            // If the player is moving left, move him left
            if (player.movingLeft) {
                player.x -= player.speed;
            }

            // If the player is moving right, move him right
            if (player.movingRight) {
                player.x += player.speed;
            }


            requestAnimationFrame(this.updateGameState);
        }
    }
}
</script>
