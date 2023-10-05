<template>
    <router-link to="/">
      <h3>Back</h3>
    </router-link>
  
    <div class="game-window" ref="gameWindow">
      <div class="player" ref="player"></div>
      <div class="bullet" v-for="(bullet, index) in bullets" :key="index" :style="{ top: bullet.y + 'px', left: bullet.x + 'px' }"></div>
      <div class="enemy" v-for="(enemy, index) in enemies" :key="index" :style="{ top: enemy.y + 'px', left: enemy.x + 'px', backgroundColor: enemy.color }"></div>
      <h2 v-if="gameOver" class="game-over">YOU LOSE</h2>
      <button v-if="gameOver" class="reset-button" @click="resetGame">Reset</button>
      <h2 v-if="gameWon" class="game-won">YOU WIN</h2>
      <button v-if="gameWon" class="reset-button" @click="resetGame">Play Again</button>
      <div class="timer">{{ timer }}</div>
      <div v-if="playerExploded" class="player-explosion" :style="{ top: playerY + 'px' }"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameShooter',
    data() {
      return {
        playerY: 175,
        bullets: [],
        enemies: [],
        gameOver: false,
        gameWon: false,
        playerExploded: false,
        timer: 30
      }
    },
    mounted() {
      // Get references to the game window and player elements
      const gameWindow = this.$refs.gameWindow
      const player = this.$refs.player
  
      // Set up the player
      player.style.width = '0'
      player.style.height = '0'
      player.style.borderTop = '12.5px solid transparent'
      player.style.borderBottom = '12.5px solid transparent'
      player.style.borderRight = '25px solid #fff'
      player.style.position = 'absolute'
      player.style.top = `${this.playerY}px`
      player.style.left = '50px'
      player.style.transform = 'rotate(45deg)'
  
      // Listen for key events to move the player and shoot bullets
      window.addEventListener('keydown', e => {
        if (e.key === 'q' && this.playerY > 0) {
          this.playerY -= 10
          player.style.top = `${this.playerY}px`
        } else if (e.key === 'a' && this.playerY < gameWindow.offsetHeight - player.offsetHeight) {
          this.playerY += 10
          player.style.top = `${this.playerY}px`
        } else if (e.key === ' ') {
          this.bullets.push({
            x: 75,
            y: this.playerY + 10
          })
        }
      })
  
      // Move bullets across the screen and remove enemies when hit or out of bounds
      setInterval(() => {
        this.bullets.forEach(bullet => {
          bullet.x += 10
          this.enemies.forEach((enemy, index) => {
            if (bullet.x >= enemy.x && bullet.x <= enemy.x + 25 && bullet.y >= enemy.y && bullet.y <= enemy.y + 25) {
              this.enemies.splice(index, 1)
            }
          })
        })
        this.enemies.forEach(enemy => {
          if (enemy.color === 'red') {
            enemy.x -= 5
          } else if (enemy.color === 'blue') {
            enemy.x -= 5
            enemy.y = 50 * Math.sin(enemy.x / 50) + 175
          } else if (enemy.color === 'yellow') {
            enemy.x -= 7.5
          } else if (enemy.color === 'green') {
            enemy.x -= 2.5
            enemy.y += (this.playerY - enemy.y) / 50
          }
          if (enemy.x < -25) {
            this.enemies.splice(this.enemies.indexOf(enemy), 1)
          } else if (enemy.x <= 75 && enemy.x + 25 >= 50 && enemy.y <= this.playerY + 25 && enemy.y + 25 >= this.playerY) {
            this.gameOver = true
            this.playerExploded = true
            setTimeout(() => {
              this.playerExploded = false
            }, 1000)
          }
        })
      }, 50)
  
      // Generate enemies at random intervals
      setInterval(() => {
        const enemyY = Math.floor(Math.random() * (gameWindow.offsetHeight - 25))
        const enemyColor = ['red', 'blue', 'yellow', 'green'][Math.floor(Math.random() * 4)]
        this.enemies.push({
          x: 575,
          y: enemyY,
          color: enemyColor
        })
      }, 2000)
  
      // Start the timer
      setInterval(() => {
        if (this.timer > 0) {
          this.timer--
        } else {
          this.gameWon = true
        }
      }, 1000)
    },
    methods: {
      resetGame() {
        this.playerY = 175
        this.bullets = []
        this.enemies = []
        this.gameOver = false
        this.gameWon = false
        this.playerExploded = false
        this.timer = 30
        this.$refs.player.style.top = `${this.playerY}px`
      }
    }
  }
  </script>
  
  <style>
  .game-window {
    width: 600px;
    height: 400px;
    background-color: #333;
    position: relative;
    margin: 0 auto;
  }
  
  .player {
    width: 0;
    height: 0;
    border-top: 25px solid transparent;
    border-bottom: 25px solid transparent;
    border-right: 50px solid #fff;
    position: absolute;
    top: 175px;
    left: 50px;
    transform: rotate(45deg);
  }
  
  .bullet {
    width: 10px;
    height: 2px;
    background-color: #fff;
    position: absolute;
  }
  
  .enemy {
    width: 25px;
    height: 25px;
    border-radius: 50% 50% 0 0;
    position: absolute;
    transform: rotate(45deg);
  }
  
  .game-over {
    color: #fff;
    font-size: 3em;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .game-won {
    color: #fff;
    font-size: 3em;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .reset-button {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    font-size: 1.5em;
    background-color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .timer {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px;
    font-size: 2em;
    color: #fff;
    text-align: right;
  }
  
  .player-explosion {
    width: 50px;
    height: 50px;
    background-color: #fff;
    position: absolute;
    top: 175px;
    left: 25px;
    z-index: 1;
    transform: rotate(45deg);
    animation: explode 1s linear;
  }
  
  @keyframes explode {
    0% {
      transform: rotate(45deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: rotate(45deg) scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: rotate(45deg) scale(2);
      opacity: 0;
    }
  }
  </style>
  
  
  <!--
  create a game for vue.js called "shooter".  It works like this:
  
  1.  There is a game window that is 600 x 400, with a dark background.
  
  2. The player is div that is 25 x 25, white, that looks like an isoceles triangle pointed toward the right side of the screen, that stays on the left side of the window.  The user can move this player up and down with 'q' and 'a' respectively.
  
  3.  The player shoots bullets that travel across the screen when you press spacebar.  The number of bullets is unlimited.
  
  4.  Enemies will randomly be generated at the right side of the game window and move left.  They look like pac-man ghosts, and can be one of the following colors: red, blue, yellow and green.  They disappear when hit by a bullet.  When they move out of the game window, they disappear.  The enemies move in the following fashion:
  
  Red: normal to the left
  Blue: sinusoidally to the left
  Yellow: 1.5x faster than the others to the left
  Green: moves slowly to the left, but in the vertical direction of the player.
  
  5. If an enemy collides with the player, the game is over and an h2 appears over the game window saying "YOU LOSE" with a button that allows you to reset. There is no alert, and all players, enemies and bullets disappear.
  
  6.  No image assets are used for the time being.
  
  7. There is a timer at the top of the game window that starts at 30 seconds and ticks down.  If the player survives by the time the counter reaches zero, an h2 appears over the game window saying "YOU WIN" with a button that allows you to play again.  There is no alert, and all players, enemies and bullets disappear.
  
  
  -->