<template>
    <canvas id="mainCanvas" ref="canvas" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
const gameWidthDefault = 800;
const gameHeightDefault = 333;
const portalWidth = 50;
const portalHeight = 70;

const player = {
        height: 30,
        width: 20,
        vel: { x: 0, y: 0 },
        movingUp: false,
        movingDown: false,
        movingLeft: false,
        movingRight: false,
        touchingGround: false,
        touchingLeftWall: false,
        touchingRightWall: false,
    };

const screens = [
    { name: "Opening", n: null},
    { name: 'Level',
        n: 1,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 400 },
        player: JSON.parse(JSON.stringify(player)),
        obstacles: [
            {
                x: 700,
                y: 350,
                width: 50,
                height: 50
            },
            {
                x: 500,
                y: 450,
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
            id: "1-2",
            x: 700,
            y: 300,
            destination: 2,
            color: "green",
        }],

        items: [{
            type: "gravity-up", 
            x: 700, 
            y: 550
        }],
    },
    { name: 'Level',
        n: 2,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 400 },
        player: JSON.parse(JSON.stringify(player)),
        obstacles: [
            {
                x: 300,
                y: 350,
                width: 50,
                height: 50
            },
            {
                x: 500,
                y: 450,
                width: 50,
                height: 50
            },
            {
                x: 700,
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
            id: "1-2",
            x: 300,
            y: 300,
            destination: 1,
            color: "green",
        },
        {
            id: "2-3",
            x: 700,
            y: 500,
            destination: 3,
            color: "purple",
        }
        ]
    },
    { name: 'Level',
        n: 3,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 400 },
        player: JSON.parse(JSON.stringify(player)),
        obstacles: [
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
            {
                x: 300,
                y: 350,
                width: 50,
                height: 50
            },
            {
                x: 400,
                y: 450,
                width: 50,
                height: 50
            },
            {
                x: 500,
                y: 550,
                width: 50,
                height: 50
            },
        ],

        portals: [{
            id: "2-3",
            x: 300,
            y: 300,
            destination: 2,
            color: "purple",
        },
        {
            id: "3-win",
            x: 700,
            y: 550,
            destination: "Win",
            color: "blue",
        }
    ]

    },
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
            gs: screens.find(screen => screen.name === 'Opening' && screen.n === null),
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

        loadScreen(screenName, levelNumber=null, portalId=null) {
            if (screenName === "Opening") {
                let currentScreen = screens.find(screen => screen.name === "Opening");
                // iterate through all properties of currentScreen and add them to this.gs
                for (let prop in currentScreen) {
                    this.gs[prop] = currentScreen[prop];
                }
                this.gs.name = "Opening";
                this.gs.lives = 3;
                this.gs.blinkTimer = Date.now();
                this.gs.showText = true;
            } else if (screenName === "Level") {
                let currentScreen = screens.find(screen => screen.name === screenName && screen.n === levelNumber);
                // iterate through all properties of currentScreen and add them to this.gs
                for (let prop in currentScreen) {
                    this.gs[prop] = currentScreen[prop];
                }
                this.gs.player = this.copy(player);
                this.gs.player.justSpawnedInPortal = "none";
                if (portalId) {
                    let portal = this.gs.portals.find(portal => portal.id === portalId);
                    this.gs.player.justSpawnedInPortal = portalId;
                    this.gs.spawnPoint = { x: portal.x, y: portal.y };
                }
                this.gs.player.pos = { x: this.gs.spawnPoint.x, y: this.gs.spawnPoint.y };
            } else if (screenName === "Win") {
                let currentScreen = screens.find(screen => screen.name === "Win");
                // iterate through all properties of currentScreen and add them to this.gs
                for (let prop in currentScreen) {
                    this.gs[prop] = currentScreen[prop];
                }
                this.gs.name = "Win";
                this.gs.messageTimer = Date.now();
            } else if (screenName === "Lose") {
                let currentScreen = screens.find(screen => screen.name === "Lose");
                // iterate through all properties of currentScreen and add them to this.gs
                for (let prop in currentScreen) {
                    this.gs[prop] = currentScreen[prop];
                }
                this.gs.name = "Lose";
                this.gs.messageTimer = Date.now();
            }
        },

        gameLoop() {
            if (this.gs.name === 'Opening') {
                this.renderOpeningScreen();
            } else if (this.gs.name === 'Win') {
                this.renderWinScreen();
            } else if (this.gs.name === 'Lose') {
                this.renderLoseScreen();
            } else {
                this.updateGameState();
            }
            requestAnimationFrame(this.gameLoop);
        },

        renderOpeningScreen() {
            // Draw black background to hidden context
            this.hiddenCtx.fillStyle = 'black';
            this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

            // Draw white header text saying the title of the game
            this.hiddenCtx.fillStyle = 'white';
            this.hiddenCtx.font = '100px Helvetica';
            this.hiddenCtx.fillText('Gravity', this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 50);

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

        renderWinScreen() {
            // Draw black background to hidden context
            this.hiddenCtx.fillStyle = 'black';
            this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

            // Draw white header text saying the title of the game
            this.hiddenCtx.fillStyle = 'white';
            this.hiddenCtx.font = '100px Helvetica';
            this.hiddenCtx.fillText('You win!', this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 50);

            // If it has been 2 seconds since gs.winTimer, go back to the opening screen
            if (Date.now() - this.gs.messageTimer > 2000) {
                this.loadScreen('Opening', null);
            }

            // Draw to main canvas
            this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
            this.ctx.drawImage(this.hiddenCanvas, 0, 0);
        },

        renderLoseScreen() {
            // Draw black background to hidden context
            this.hiddenCtx.fillStyle = 'black';
            this.hiddenCtx.fillRect(0, 0, this.dataGameWidth, this.dataGameHeight);

            // Draw white header text saying the title of the game
            this.hiddenCtx.fillStyle = 'white';
            this.hiddenCtx.font = '100px Helvetica';
            this.hiddenCtx.fillText('You lose', this.dataGameWidth / 2 - 150, this.dataGameHeight / 2 + 50);

            // If it has been 2 seconds since gs.winTimer, go back to the opening screen
            if (Date.now() - this.gs.messageTimer > 2000) {
                this.loadScreen('Opening', null);
            }

            // Draw to main canvas
            this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
            this.ctx.drawImage(this.hiddenCanvas, 0, 0);
        },

        handleKeyDown(event) {

            if (this.gs.name === 'Opening') {
                if (event.code === 'Space') {
                    //this.gs.name = 'Level';
                    this.loadScreen('Level', 1); 
                }
                return;
            } else {
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
        updateGameState() {

            let player = this.gs.player;


            /**************************************
             * 
             *       Collision Detection (must come before movement)
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

            // Detect player collision with the top of an item
            this.gs.items.forEach(item => {
                if (
                    player.pos.x + player.width / 2 > item.x - 25 &&
                    player.pos.x - player.width / 2 < item.x + 25 &&
                    player.pos.y + player.height / 2 > item.y - 25 &&
                    player.pos.y - player.height / 2 < item.y + 25
                ) {
                    if (item.type === "gravity-up") {
                        this.gs.player.touchingGround = false;
                        this.gs.gravity = { x: 0, y: -.1 };
                    } else if (item.type === "gravity-down") {
                        this.gs.gravity = { x: 0, y: .1 };
                    } else if (item.type === "gravity-left") {
                        this.gs.gravity = { x: -.1, y: 0 };
                    } else if (item.type === "gravity-right") {
                        this.gs.gravity = { x: .1, y: 0 };
                    }
                    this.gs.items = this.gs.items.filter(i => i !== item);
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
                this.gs.lives--;
                if (this.gs.lives <= 0) {
                    this.loadScreen('Lose', null);
                } else {
                    this.loadScreen('Level', this.gs.n);
                }
            }

            // No portal collision detection if the player just spawned
            if (this.gs.player.justSpawnedInPortal === "none") {
                // If a player reaches the portal, he is transported to the next level
                this.gs.portals.forEach(portal => {
                    if (
                        // portal must fully encapsulate the player
                        player.pos.x - player.width / 2 > portal.x - portalWidth / 2 &&
                        player.pos.x + player.width / 2 < portal.x + portalWidth / 2 &&
                        player.pos.y - player.height / 2 > portal.y - portalHeight / 2 &&
                        player.pos.y + player.height / 2 < portal.y + portalHeight / 2
                    ) {
                        if (portal.destination === 'Win') {
                            this.loadScreen('Win', null);
                        } else if (typeof portal.destination === 'number') {
                            this.gs.player.justSpawnedInPortal = "none";
                            this.loadScreen('Level', portal.destination, portal.id);
                        }
                    }
                });
            }

            // If the player has justSpawnedInPortal, detect when he fully leaves the portal and change this value to null
            if (this.gs.player.justSpawnedInPortal !== "none") {
                let portal = this.gs.portals.find(portal => portal.id === this.gs.player.justSpawnedInPortal);
                let player = this.gs.player;
                if (
                    player.pos.x - player.width / 2 > portal.x - portalWidth / 2 &&
                    player.pos.x + player.width / 2 < portal.x + portalWidth / 2 &&
                    player.pos.y - player.height / 2 > portal.y - portalHeight / 2 &&
                    player.pos.y + player.height / 2 < portal.y + portalHeight / 2
                ) {
                    // Do nothing
                } else {
                    this.gs.player.justSpawnedInPortal = "none";
                }
            }


            /**************************************
             * 
             *       Movement (must come after collision detection)
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
                player.vel.x = -3;
            } else if (player.movingRight) {
                player.vel.x = 3;
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

            // Portals
            this.gs.portals.forEach(portal => {
                this.hiddenCtx.fillStyle = portal.color;
                this.hiddenCtx.fillRect(
                    portal.x - portalWidth / 2,
                    portal.y - portalHeight / 2,
                    portalWidth,
                    portalHeight
                );
            });

            // Items
            // Each item is a 50x50 purple square.  There are four kinds: gravity-up, gravity-down, gravity-left and gravity-right.
            // If the player touches the gravity-up item, gravity is reversed.
            // If the player touches the gravity-down item, gravity is set to normal.
            // If the player touches the gravity-left item, gravity is set to left.
            // If the player touches the gravity-right item, gravity is set to right.
            // THere is small text that says "up", "down", "left", or "right" inside the item.
            this.gs.items.forEach(item => {
                this.hiddenCtx.fillStyle = 'purple';
                this.hiddenCtx.fillRect(
                    item.x - 25,
                    item.y - 25,
                    50,
                    50
                );
                this.hiddenCtx.fillStyle = 'white';
                this.hiddenCtx.font = '24px Helvetica';
                let text = "";
                if (item.type === "gravity-up") {
                    text = "U";
                } else if (item.type === "gravity-down") {
                    text = "D";
                } else if (item.type === "gravity-left") {
                    text = "L";
                } else if (item.type === "gravity-right") {
                    text = "R";
                }
                this.hiddenCtx.fillText(text, item.x - 10, item.y + 10);
            });


            // Player
            this.hiddenCtx.fillStyle = 'black';
            this.hiddenCtx.fillRect(
                player.pos.x - player.width / 2,
                player.pos.y - player.height / 2,
                player.width,
                player.height
            );

            // Lives
            this.hiddenCtx.fillStyle = 'black';
            this.hiddenCtx.font = '24px Helvetica';
            this.hiddenCtx.fillText('Lives: ' + this.gs.lives, 10, 30);

            // Draw
            this.ctx.clearRect(0, 0, this.dataGameWidth, this.dataGameHeight);
            this.ctx.drawImage(this.hiddenCanvas, 0, 0);
 
        }
    }
}
</script>
