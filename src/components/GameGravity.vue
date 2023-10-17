<template>
    <canvas id="mainCanvas" ref="canvas" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
const gameWidthDefault = 800;
const gameHeightDefault = 333;

const screens = [
    { name: "Opening", n: null},
    { name: 'Level',
        n: 1,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 400 },
        player: {
            pos: { x: 400, y: 400 },
            height: 30,
            width: 45,
            vel: { x: 0, y: 0 },
            movingUp: false,
            movingDown: false,
            movingLeft: false,
            movingRight: false,
            touchingGround: false,
            touchingLeftWall: false,
            touchingRightWall: false,
        },
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

        portals: [{
            x: 700,
            y: 300,
            destination: 2
        }
    ]},
    { name: 'Win', n: null },
    { name: 'Lose', n: null },
]

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
                gravity: { x: 0, y: .1 },

                spawnPoint: { x: 400, y: 400 },

                player: {
                    pos: { x: 400, y: 400 },
                    height: 30,
                    width: 45,
                    vel: { x: 0, y: 0 },
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

                portals: [{
                    x: 700,
                    y: 300,
                    destination: 2
                }]

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

                case 'KeyA':
                    this.gs.player.movingLeft = true;
                    break;

                case 'KeyD':
                    this.gs.player.movingRight = true;
                    break;

                case 'KeyJ':
                    // This allows the player to jump if he is touching the ground
                    if (this.gs.player.touchingGround) {
                        this.gs.player.jumping = true;
                    }
                    break;
            }
        },
        handleKeyUp(event) {
            switch (event.code) {

                case 'KeyA':
                    this.gs.player.movingLeft = false;
                    break;

                case 'KeyD':
                    this.gs.player.movingRight = false;
                    break;

                case 'KeyJ':
                    this.gs.player.jumping = false; 
                    break;
            }
        },
        updateGameState(timestamp) {

            let player = this.gs.player;

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
                    player.pos.x + player.width / 2 > obstacle.x - obstacle.width / 2 &&
                    player.pos.x - player.width / 2 < obstacle.x + obstacle.width / 2 &&
                    player.pos.y + player.height / 2 > obstacle.y - obstacle.height / 2 &&
                    player.pos.y - player.height / 2 < obstacle.y + obstacle.height / 2
                ) {
                    if (player.pos.y + player.height <= obstacle.y) {
                       player.touchingGround = true;
                    }
                    else if (player.pos.x <= obstacle.x + obstacle.width && player.pos.x >= obstacle.x) {
                        player.touchingLeftWall = true;
                    }
                    else if (player.pos.x + player.width >= obstacle.x && player.pos.x + player.width <= obstacle.x + obstacle.width) {
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

            // If the player touches the border of the canvas, he dies
            if (
                player.pos.x - player.width / 2 < 0 ||
                player.pos.x + player.width / 2 > this.dataGameWidth ||
                player.pos.y - player.height / 2 < 0 ||
                player.pos.y + player.height / 2 > this.dataGameHeight
            ) {
                player.pos.x = 400;
                player.pos.y = 400;
            }



            /**************************************
             * 
             *       Movement
             * 
             * *************************************/

            // Player's vertical velocity  
            if (!player.touchingGround) {
                player.vel.y += this.gs.gravity.y;
            } else if (player.jumping) {
                player.vel.y = -5;
            } else {
                player.vel.y = 0;
            }

            // Player's horizontal velocity is determined by whether he is moving left or right
            if (player.movingLeft) {
                player.vel.x = -5;
            } else if (player.movingRight) {
                player.vel.x = 5;
            } else {
                player.vel.x = 0;
            }

            // Move the player's position according to his velocity
            player.pos.x += player.vel.x;
            player.pos.y += player.vel.y;


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
            this.hiddenCtx.fillRect(
                player.pos.x - player.width / 2,
                player.pos.y - player.height / 2,
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
             *       Next Frame
             * 
             * *************************************/

            requestAnimationFrame(this.updateGameState);
        }
    }
}
</script>
