<template>
    <img ref="playerUpForwardA" :src="'/src/assets/images/gravity_player_up_forward_A.png'" :style="{ display: 'none' }">
    <img ref="playerUpForwardB" :src="'/src/assets/images/gravity_player_up_forward_B.png'" :style="{ display: 'none' }">
    <img ref="playerUpBackwardA" :src="'/src/assets/images/gravity_player_up_backward_A.png'" :style="{ display: 'none' }">
    <img ref="playerUpBackwardB" :src="'/src/assets/images/gravity_player_up_backward_B.png'" :style="{ display: 'none' }">
    <canvas id="mainCanvas" ref="canvas" :width="dataGameWidth" :height="dataGameHeight"></canvas>
    <canvas id="hiddenCanvas" ref="hiddenCanvas" :style="{display: 'none'}" :width="dataGameWidth" :height="dataGameHeight"></canvas>
</template>

<script>
const gameWidthDefault = 800;
const gameHeightDefault = 333;
const portalWidth = 50;
const portalHeight = 70;
const renderPlayerEdges = false;
const walkTimerDelay = 50;

const player = {
        height: 82,
        width: 34,
        vel: { x: 0, y: 0 },
        movingUp: false,
        movingDown: false,
        movingLeft: false,
        movingRight: false,
        touchingGround: false,
        touchingLeftWall: false,
        touchingRightWall: false,
        facingForward: true,
        walkTimer: null,
        walkPlayerState: 'A',
        image: null,
    };

const screens = [
    { name: "Opening", n: null},
    { name: 'Level',
        n: 1,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 500 },
        player: JSON.parse(JSON.stringify(player)),
        obstacles: [
            {
                id: "A",
                pos: { x: 700, y: 250 },
                width: 50,
                height: 50
            },
            {
                id: "B",
                pos: { x: 500, y: 350 },
                width: 50,
                height: 50
            },
            {
                id: "C",
                pos: { x: 300, y: 500 },
                width: 50,
                height: 50
            },
            // There are two additional obstacles which cover the ground of the level.
            // Between them is a pit.
            // {
            //     x: 0,
            //     y: 600,
            //     width: 1200 / 2,
            //     height: 50
            // },
            {
                id: "D",
                pos: { x: 0, y: 550 },
                width: 900,
                height: 50
            },
            {
                id: "E",
                pos: { x: 0, y: 0 },
                width: 900,
                height: 50
            },
            // {
            //     x: 1200 / 2 + 50,
            //     y: 0,
            //     width: 900,
            //     height: 50
            // },
        ],

        portals: [
        //     {
        //     id: "1-2",
        //     x: 700,
        //     y: 300,
        //     destination: 2,
        //     color: "green",
        // }
    ],

        items: [
        //     {
        //     type: "gravity-left", 
        //     x: 700, 
        //     y: 550
        // }
    ],
    },
    { name: 'Level',
        n: 2,
        gravity: { x: 0, y: .1 },
        spawnPoint: { x: 400, y: 400 },
        player: JSON.parse(JSON.stringify(player)),
        obstacles: [
            {
                pos: { x: 300, y: 250 },
                width: 50,
                height: 50
            },
            {
                pos: { x: 400, y: 350 },
                width: 50,
                height: 50
            },
            {
                pos: { x: 500, y: 450 },
                width: 50,
                height: 50
            },
            // There are two additional obstacles which cover the ground of the level.
            // Between them is a pit.
            {
                pos: { x: 0, y: 600 },
                width: 1200 / 2,
                height: 50
            },
            {
                pos: { x: 1200 / 2 + 50, y: 600 },
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
                pos: { x: 300, y: 250 },
                width: 1200 / 2,
                height: 50
            },
            {
                pos: { x: 1200 / 2 + 50, y: 250 },
                width: 900,
                height: 50
            },
            {
                pos: { x: 300, y: 350 },
                width: 50,
                height: 50
            },
            {
                pos: { x: 400, y: 450 },
                width: 50,
                height: 50
            },
            {
                pos: { x: 500, y: 550 },
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

        changePlayerImage() {
            let player = this.gs.player;
            if (player.facingForward) {
                player.image = (player.walkPlayerState == "A")? this.$refs.playerUpForwardA : this.$refs.playerUpForwardB;
            } else {
                player.image = (player.walkPlayerState == "A")? this.$refs.playerUpBackwardA : this.$refs.playerUpBackwardB;
            }
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
                this.gs.player.image = this.gs.player.facingForward? this.$refs.playerUpForwardA : this.$refs.playerUpBackwardA;
                this.gs.player.image = this.$refs.playerUpForwardA;
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
                        this.gs.player.facingForward = false;
                        this.gs.player.walkTimer = Date.now();
                        this.changePlayerImage();
                        break;

                    case 'KeyD':
                        this.gs.player.movingRight = true;
                        this.gs.player.facingForward = true;
                        this.gs.player.walkTimer = Date.now();
                        this.changePlayerImage();
                        break;

                    case 'KeyH':
                        // This allows the player to jump if he is touching the ground
                        if (this.gs.gravity.y > 0 && this.gs.player.touchingGround) {
                            this.gs.player.jumping = true;
                        }
                        if (this.gs.gravity.y < 0 && this.gs.player.touchingCeiling) {
                            this.gs.player.jumping = true;
                        }
                        break;
                    
                    //  Special development keys to change the direction of gravity
                    case 'KeyI':
                        this.gs.gravity = { x: 0, y: -.1 };
                        break;
                    case 'KeyK':
                        this.gs.gravity = { x: 0, y: .1 };
                        break;
                    case 'KeyJ':
                        this.gs.gravity = { x: -.1, y: 0 };
                        break;
                    case 'KeyL':
                        this.gs.gravity = { x: .1, y: 0 };
                        break;
                }
            }
        },

        handleKeyUp(event) {
            switch (event.code) {

                case 'KeyA':
                    this.gs.player.movingLeft = false;
                    this.gs.player.walkTimer = null;
                    break;

                case 'KeyD':
                    this.gs.player.movingRight = false;
                    this.gs.player.walkTimer = null;
                    break;

                case 'KeyH':
                    this.gs.player.jumping = false; 
                    break;
            }
        },

        detectEncapsulation(inner, outer) {
            const threshold = .5;
            const intersectionX = Math.max(inner.pos.x, outer.pos.x);
            const intersectionWidth = Math.min(inner.pos.x + inner.width, outer.pos.x + outer.width);
            const intersectionY = Math.max(inner.pos.y, outer.pos.y);
            const intersectionHeight = Math.min(inner.pos.y + inner.height, outer.pos.y + outer.height);
            const intersectionArea = (intersectionWidth - intersectionX) * (intersectionHeight - intersectionY);
            const innerArea = inner.width * inner.height;
            const intersectionRatio = intersectionArea / innerArea;
            return (intersectionRatio > threshold);          
        },

        detectCompleteEncapsulation(inner, outer) {
            return outer.pos.x <= inner.pos.x && inner.pos.x < outer.pos.x + outer.width &&
                outer.pos.x < inner.pos.x + inner.width && inner.pos.x + inner.width <= outer.pos.x + outer.width &&
                outer.pos.y <= inner.pos.y && inner.pos.y < outer.pos.y + outer.height &&
                outer.pos.y < inner.pos.y + inner.height && inner.pos.y + inner.height <= outer.pos.y + outer.height;
        },

        detectCollision(obj1, obj2) {
            let intersect = function (aLo, aHi, bLo, bHi) {
                return Math.min(aHi, bHi) > Math.max(aLo, bLo);
            };

            let horizontalIntersection = intersect(
                obj1.pos.x, 
                obj1.pos.x + obj1.width,
                obj2.pos.x,
                obj2.pos.x + obj2.width
            )

            let verticalIntersection = intersect(
                obj1.pos.y,
                obj1.pos.y + obj1.height,
                obj2.pos.y,
                obj2.pos.y + obj2.height
            )
            
            return (horizontalIntersection && verticalIntersection);

        },

        updateGameState() {

            let player = this.gs.player;
            // Update player's walk animation
            if (player.walkTimer && (Date.now() - player.walkTimer) > walkTimerDelay) {
                player.walkTimer = Date.now();
                player.walkPlayerState = player.walkPlayerState === 'A' ? 'B' : 'A';
                this.changePlayerImage();
            }

            // The player has four adjacent edges, each of which are 3px thick.
            // The edges are green.
            // There is a top edge, which sits directly above the player
            // There is a left edge, which sits to the player's left
            // There is a bottom edge, which sits directly below the player
            // There is a right edge, which sits to the player's right
            const edgeThickness = 8;
            player.edges = [
                // Top
                { color: 'green', pos: {x: player.pos.x, y: player.pos.y - edgeThickness}, width: player.width, height: edgeThickness },
                // Left
                { color: 'cyan', pos: {x: player.pos.x - edgeThickness, y: player.pos.y}, width: edgeThickness, height: player.height },
                // Right
                { color: 'magenta', pos: {x: player.pos.x + player.width, y: player.pos.y}, width: edgeThickness, height: player.height },
                // Bottom
                { color: 'yellow', pos: {x: player.pos.x, y: player.pos.y + player.height}, width: player.width, height: edgeThickness },
            ]


            /**************************************
             * 
             *       Collision Detection (must come before movement)
             * 
             * *************************************/

            // Initialize player's touching states to false
            player.touchingGround = false;
            player.touchingCeiling = false;
            player.touchingLeftWall = false;
            player.touchingRightWall = false;

            let edgeCorrection = { x: player.pos.x, y: player.pos.y };

            // Detect player collision with the top of an object
            this.gs.obstacles.forEach(obstacle => {
                if (this.detectCollision(player, obstacle)) 
                {
                    // If the player's top edge is fully encapsulated within the obstacle, he is touching the top.  Set the edge color to dark red.
                    if ( this.detectEncapsulation(player.edges[0], obstacle)) {
                        player.touchingCeiling = true;
                        player.edges[0].color = 'darkred';
                        // Correct the player's position so that he is not inside the obstacle
                        if (player.pos.y < obstacle.pos.y + obstacle.height) {
                            edgeCorrection.y = obstacle.pos.y + obstacle.height;
                        }

                    } 

                    // If the player's left edge is fully encapsulated within the obstacle, he is touching the left.  Set the edge color to dark red.
                    if (this.detectEncapsulation(player.edges[1], obstacle)) {
                        player.touchingLeftWall = true;
                        player.edges[1].color = 'darkred';
                        console.log("TOUCHING LEFT: ", obstacle.id);
                        // Correct the player's position so that he is not inside the obstacle
                        if (player.pos.x < obstacle.pos.x + obstacle.width) {
                            edgeCorrection.x = obstacle.pos.x + obstacle.width;
                        }
                    } 

                    // If the player's right edge is fully encapsulated within the obstacle, he is touching the right.  Set the edge color to dark red.
                    if (this.detectEncapsulation(player.edges[2], obstacle)) {
                        player.touchingRightWall = true;
                        player.edges[2].color = 'darkred';
                        console.log("TOUCHING RIGHT: ", obstacle.id);
                        // Correct the player's position so that he is not inside the obstacle
                        if (player.pos.x > obstacle.pos.x - player.width) {
                            edgeCorrection.x = obstacle.pos.x - player.width;
                        }
                    } 

                    // If the player's bottom edge is fully encapsulated within the obstacle, he is touching the bottom.  Set the edge color to dark red.
                    if (this.detectEncapsulation(player.edges[3], obstacle)) {
                        player.touchingGround = true;
                        player.edges[3].color = 'darkred';
                        // Correct the player's position so that he is not inside the obstacle
                        if (player.pos.y > obstacle.pos.y - player.height) {
                            edgeCorrection.y = obstacle.pos.y - player.height;
                        }
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

            // Initialize movement with gravity
            if (this.gs.gravity.y > 0) {
                player.movingDown = true;
            }

            if (this.gs.gravity.y < 0) {
                player.movingUp = true;
            }

            // Stop player movement with object collision
            if (player.touchingLeftWall) {
                player.movingLeft = false;
            }

            if (player.touchingRightWall) {
                player.movingRight = false;
            }

            if (player.touchingCeiling) {
                player.movingUp = false;
            }

            if (player.touchingGround) {
                player.movingDown = false;
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


            /**************************************************************
             * 
             *       Movement (must come after collision detection)
             * 
             * ************************************************************/

            // Player's vertical velocity if gravity is normal 
            if (this.gs.gravity.y > 0) {
                if (player.jumping) {
                    player.vel.y = -5;
                    player.jumping = false;
                } else {
                    player.vel.y += this.gs.gravity.y;
                }
            }

            // Player's vertical velocity if gravity is reversed
            if (this.gs.gravity.y < 0) {
                if (player.jumping) {
                    player.vel.y = 5;
                    player.jumping = false;
                } else {
                    player.vel.y += this.gs.gravity.y;
                }
            }


            // Player's horizontal velocity is determined by whether he is moving left or right
            if (player.movingLeft) {
                player.vel.x = -3;
            } else if (player.movingRight) {
                player.vel.x = 3;
            } else {
                player.vel.x = 0;
            }

            // If the player is colliding with an object, set his velocity in that direction to zero
            if (player.touchingGround && player.vel.y > 0) {
                player.vel.y = 0;
            }
            if (player.touchingCeiling && player.vel.y < 0) {
                player.vel.y = 0;
            }
            if (player.touchingLeftWall && player.vel.x < 0) {
                player.vel.x = 0;
            }
            if (player.touchingRightWall && player.vel.x > 0) {
                player.vel.x = 0;
            }

            // Edge correction
            player.pos.x = edgeCorrection.x;
            player.pos.y = edgeCorrection.y;

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
                    obstacle.pos.x,
                    obstacle.pos.y,
                    obstacle.width,
                    obstacle.height
                );
            });

            // Portals
            this.gs.portals.forEach(portal => {
                this.hiddenCtx.fillStyle = portal.color;
                this.hiddenCtx.fillRect(
                    portal.x,
                    portal.y,
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
                    item.x,
                    item.y,
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
            // Render the player with the background of image in src/assets/images/gravity_player_A.png
            // The player is player.width x player.height
            // Don't worry about the player edges
            // this.hiddenCtx.fillStyle = 'blue';
            // this.hiddenCtx.fillRect(
            //     player.pos.x,
            //     player.pos.y,
            //     player.width,
            //     player.height
            // );
            // let playerImage = new Image();
            // const image = this.$refs.playerUpBackwardA;

            // Facing right
            // this.hiddenCtx.drawImage(image, player.pos.x, player.pos.y, player.width, player.height);

            // Facing left
            // this.hiddenCtx.scale(-1,1);
            // this.hiddenCtx.drawImage(image, -player.pos.x - player.width, player.pos.y, player.width, player.height);

            // this.hiddenCtx.rotate(Math.PI/4);
            this.hiddenCtx.drawImage(player.image, player.pos.x, player.pos.y, player.width, player.height);



            // Render each of the player edges
            if (renderPlayerEdges) {
                player.edges.forEach(edge => {
                    this.hiddenCtx.fillStyle = edge.color;
                    this.hiddenCtx.fillRect(
                        edge.pos.x,
                        edge.pos.y,
                        edge.width,
                        edge.height
                    );
                });
            }


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
