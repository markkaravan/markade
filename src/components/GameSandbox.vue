<template>
    <canvas ref="canvas" :height="gameHeight" :width="gameWidth"></canvas>
</template>

<script>
export default {
    props: {
        gameHeight: {
            type: Number,
            required: true
        },
        gameWidth: {
            type: Number,
            required: true
        }
    },
    mounted() {
        this.ctx = this.$refs.canvas.getContext('2d');
        // this.hiddenCanvas = document.createElement('canvas');
        // this.hiddenCanvas.width = this.gameWidth;
        // this.hiddenCanvas.height = this.gameHeight;
        // this.hiddenCtx = this.hiddenCanvas.getContext('2d');
        this.player = {
            x: this.gameWidth / 2,
            y: this.gameHeight / 2,
            width: 10,
            height: 20,
            xVelocity: 0,
            yVelocity: 0,
            jumping: false
        };
        this.obstacles = [
            {
                x: 0,
                y: this.gameHeight - 10,
                width: this.gameWidth,
                height: 10
            }
        ];
        this.gravity = 0.5;
        this.keys = [];
        window.addEventListener('keydown', e => {
            this.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.keyCode] = false;
        });
        this.gameLoop();
    },
    methods: {
        gameLoop() {
            this.update();
            this.draw();
            requestAnimationFrame(this.gameLoop);
        },
        update() {
            if (this.keys[65]) {
                this.player.xVelocity -= 0.5;
            }
            if (this.keys[68]) {
                this.player.xVelocity += 0.5;
            }
            if (this.keys[32] && !this.player.jumping) {
                this.player.yVelocity -= 10;
                this.player.jumping = true;
            }
            this.player.yVelocity += this.gravity;
            this.player.x += this.player.xVelocity;
            this.player.y += this.player.yVelocity;
            this.player.xVelocity *= 0.9;
            this.player.yVelocity *= 0.9;
            if (this.player.y + this.player.height > this.gameHeight) {
                this.player.y = this.gameHeight - this.player.height;
                this.player.yVelocity = 0;
                this.player.jumping = false;
            }
            this.obstacles.forEach(obstacle => {
                if (this.checkCollision(this.player, obstacle)) {
                    if (this.player.y < obstacle.y) {
                        this.player.y = obstacle.y - this.player.height;
                        this.player.yVelocity = 0;
                        this.player.jumping = false;
                    } else if (this.player.x < obstacle.x) {
                        this.player.x = obstacle.x - this.player.width;
                        this.player.xVelocity = 0;
                    } else if (this.player.x > obstacle.x) {
                        this.player.x = obstacle.x + obstacle.width;
                        this.player.xVelocity = 0;
                    }
                }
            });
        },
        draw() {
            this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.obstacles.forEach(obstacle => {
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            });
            // this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
            // this.ctx.drawImage(this.hiddenCanvas, 0, 0);
        },
        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }
    }
};
</script>
