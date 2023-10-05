<template>
  <div v-if="gameOver" class="game-over">
    <h2>Game Over</h2>
    <button @click="runGame">Play Again?</button>
  </div>
  <div class="game-window" ref="gameWindow">
    <div class="player" ref="player"></div>
    <div class="bullet" v-for="(bullet, index) in bullets" :key="index" :style="{ top: bullet.y + 'px', left: bullet.x + 'px' }"></div>
    <div class="asteroid" v-for="(asteroid, index) in asteroids" :key="index" :class="'asteroid-' + asteroid.size" :style="{ top: asteroid.y + 'px', left: asteroid.x + 'px' }"></div>
  </div>
</template>

<script>
export default {
  name: 'GameAsteroids',
  data() {
    return {
      playerX: 287.5,
      playerY: 187.5,
      playerAngle: 0,
      playerSpeed: 0,
      playerMaxSpeed: 5,
      bullets: [],
      asteroids: [],
      gameOver: false,
      numberOfAsteroids: 1,
      intervalHandle: null,
    }
  },
  
  methods: {
    runGame() {

      // Initialize the game
      this.playerX = 287.5;
      this.playerY = 187.5;
      this.playerAngle = 0;
      this.playerSpeed = 0;
      this.playerMaxSpeed = 5;
      this.bullets = [];
      this.asteroids = [];
      this.gameOver = false;
      this.numberOfAsteroids = 4;
      clearInterval(this.intervalHandle);

      // Get references to the game window, player, bullet, and asteroid elements
      const gameWindow = this.$refs.gameWindow
      const player = this.$refs.player
      // const bullets = this.bullets
      // const asteroids = this.asteroids

      // Set up the player
      player.style.width = '0'
      player.style.height = '0'
      player.style.borderTop = '12.5px solid white'
      player.style.borderLeft = '12.5px solid transparent'
      player.style.borderRight = '12.5px solid transparent'
      player.style.position = 'absolute'
      player.style.top = `${this.playerY}px`
      player.style.left = `${this.playerX}px`
      player.style.transform = `rotate(${this.playerAngle}deg)`

      // Set up the asteroids
      for (let i = 0; i < this.numberOfAsteroids; i++) {
        const asteroid = document.createElement('div')
        asteroid.classList.add('asteroid')
        asteroid.classList.add('asteroid-large')
        asteroid.style.width = `${Math.floor(Math.random() * 50) + 50}px`
        asteroid.style.height = `${Math.floor(Math.random() * 50) + 50}px`
        asteroid.style.borderRadius = '50%'
        asteroid.style.backgroundColor = 'white'
        asteroid.style.position = 'absolute'
        asteroid.style.top = `${Math.floor(Math.random() * (gameWindow.offsetHeight - parseInt(asteroid.style.height)))}px`
        asteroid.style.left = `${Math.floor(Math.random() * (gameWindow.offsetWidth - parseInt(asteroid.style.width)))}px`
        this.asteroids.push({
          element: asteroid,
          x: parseInt(asteroid.style.left),
          y: parseInt(asteroid.style.top),
          width: parseInt(asteroid.style.width),
          height: parseInt(asteroid.style.height),
          velocity: Math.floor(Math.random() * 2) + 1,
          angle: Math.floor(Math.random() * 360),
          size: 'large'
        })
        gameWindow.appendChild(asteroid)
      }
      // Listen for key events to move the player and fire bullets
      window.addEventListener('keydown', e => {
        if (e.key === 'w') {
        this.playerSpeed = Math.min(this.playerSpeed + 0.5, this.playerMaxSpeed)
      } else if (e.key === 's') {
        this.playerSpeed = Math.max(this.playerSpeed - 0.5, 0)
      } else if (e.key === 'a') {
        this.playerAngle -= 10
          player.style.transform = `rotate(${this.playerAngle}deg)`
        } else if (e.key === 'd') {
          this.playerAngle += 10
          player.style.transform = `rotate(${this.playerAngle}deg)`
        } else if (e.key === ' ') {
          this.bullets.push({
            x: this.playerX + 12.5 * Math.sin(this.playerAngle * Math.PI / 180),
            y: this.playerY - 12.5 * Math.cos(this.playerAngle * Math.PI / 180),
            angle: this.playerAngle,
            dist: 0
          })
        }
      })

      // Move the player and wrap around the screen
      this.intervalHandle = setInterval(() => {
        if (this.gameOver == true) {
          return
        }
        this.playerX += this.playerSpeed * Math.sin(this.playerAngle * Math.PI / 180)
        this.playerY -= this.playerSpeed * Math.cos(this.playerAngle * Math.PI / 180)
        if (this.playerX < -12.5) {
          this.playerX = gameWindow.offsetWidth + 12.5
        } else if (this.playerX > gameWindow.offsetWidth + 12.5) {
          this.playerX = -12.5
        }
        if (this.playerY < -12.5) {
          this.playerY = gameWindow.offsetHeight + 12.5
        } else if (this.playerY > gameWindow.offsetHeight + 12.5) {
          this.playerY = -12.5
        }
        player.style.top = `${this.playerY}px`
        player.style.left = `${this.playerX}px`
        // Move the bullets and wrap around the screen
        this.bullets.forEach((bullet, index) => {
          bullet.x += 10 * Math.sin(bullet.angle * Math.PI / 180)
          bullet.y -= 10 * Math.cos(bullet.angle * Math.PI / 180)
          bullet.dist += 10
          if (bullet.x < -2.5) {
            bullet.x = gameWindow.offsetWidth + 2.5
          } else if (bullet.x > gameWindow.offsetWidth + 2.5) {
            bullet.x = -2.5
          }
          if (bullet.y < -2.5) {
            bullet.y = gameWindow.offsetHeight + 2.5
          } else if (bullet.y > gameWindow.offsetHeight + 2.5) {
            bullet.y = -2.5
          }
          if (bullet.dist > 500) {
            this.bullets.splice(index, 1)
          }

          // Check for collisions with asteroids
          this.asteroids.forEach((asteroid, asteroidIndex) => {
            const dx = bullet.x - (asteroid.x + asteroid.width / 2)
            const dy = bullet.y - (asteroid.y + asteroid.height / 2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < asteroid.width / 2) {
              gameWindow.removeChild(asteroid.element)
              this.asteroids.splice(asteroidIndex, 1)
              this.bullets.splice(index, 1)
              if (asteroid.size === 'large') {
                for (let i = 0; i < this.numberOfAsteroids; i++) {
                  const mediumAsteroid = document.createElement('div')
                  mediumAsteroid.classList.add('asteroid')
                  mediumAsteroid.classList.add('asteroid-medium')
                  mediumAsteroid.style.width = `${Math.floor(Math.random() * 25) + 25}px`
                  mediumAsteroid.style.height = `${Math.floor(Math.random() * 25) + 25}px`
                  mediumAsteroid.style.borderRadius = '50%'
                  mediumAsteroid.style.backgroundColor = 'red'
                  mediumAsteroid.style.position = 'absolute'
                  mediumAsteroid.style.top = `${asteroid.y}px`
                  mediumAsteroid.style.left = `${asteroid.x}px`
                  this.asteroids.push({
                    element: mediumAsteroid,
                    x: parseInt(mediumAsteroid.style.left),
                    y: parseInt(mediumAsteroid.style.top),
                    width: parseInt(mediumAsteroid.style.width),
                    height: parseInt(mediumAsteroid.style.height),
                    velocity: Math.floor(Math.random() * 2) + 2,
                    angle: Math.floor(Math.random() * 360),
                    size: 'medium'
                  })
                  gameWindow.appendChild(mediumAsteroid)
                }
              } else if (asteroid.size === 'medium') {
                for (let i = 0; i < this.numberOfAsteroids; i++) {
                  const smallAsteroid = document.createElement('div')
                  smallAsteroid.classList.add('asteroid')
                  smallAsteroid.classList.add('asteroid-small')
                  smallAsteroid.style.width = `${Math.floor(Math.random() * 15) + 15}px`
                  smallAsteroid.style.height = `${Math.floor(Math.random() * 15) + 15}px`
                  smallAsteroid.style.borderRadius = '50%'
                  smallAsteroid.style.backgroundColor = 'blue'
                  smallAsteroid.style.position = 'absolute'
                  smallAsteroid.style.top = `${asteroid.y}px`
                  smallAsteroid.style.left = `${asteroid.x}px`
                  this.asteroids.push({
                    element: smallAsteroid,
                    x: parseInt(smallAsteroid.style.left),
                    y: parseInt(smallAsteroid.style.top),
                    width: parseInt(smallAsteroid.style.width),
                    height: parseInt(smallAsteroid.style.height),
                    velocity: Math.floor(Math.random() * 3) + 3,
                    angle: Math.floor(Math.random() * 360),
                    size: 'small'
                  })
                  gameWindow.appendChild(smallAsteroid)
                }
              }
            }
          })
        })
        // Move the asteroids and wrap around the screen
        this.asteroids.forEach(asteroid => {
          asteroid.x += asteroid.velocity * Math.sin(asteroid.angle * Math.PI / 180)
          asteroid.y -= asteroid.velocity * Math.cos(asteroid.angle * Math.PI / 180)
          if (asteroid.x < -asteroid.width) {
            asteroid.x = gameWindow.offsetWidth
          } else if (asteroid.x > gameWindow.offsetWidth) {
            asteroid.x = -asteroid.width
          }
          if (asteroid.y < -asteroid.height) {
            asteroid.y = gameWindow.offsetHeight
          } else if (asteroid.y > gameWindow.offsetHeight) {
            asteroid.y = -asteroid.height
          }
          asteroid.element.style.top = `${asteroid.y}px`
          asteroid.element.style.left = `${asteroid.x}px`

          // Check for collisions with the player
          const distance = Math.sqrt((this.playerX - asteroid.x) ** 2 + (this.playerY - asteroid.y) ** 2)
          if (distance < .2 * asteroid.width) {
            this.gameOver = true
            clearInterval(this.intervalHandle)
          }
        })


        // Check if there are any asteroids left
        if (this.asteroids.length === 0) {
          this.gameOver = true
        }
      }, 50)
      }
    },

  mounted() {
    this.runGame();
  },
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

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.player {
  width: 0;
  height: 0;
  border-top: 12.5px solid white;
  border-left: 12.5px solid transparent;
  border-right: 12.5px solid transparent;
  position: absolute;
  top: 187.5px;
  left: 287.5px;
  transform: rotate(90deg);
}

.bullet {
  width: 5px;
  height: 5px;
  background-color: white;
  position: absolute;
  border-radius: 50%;
}

.asteroid {
  border-radius: 50%;
  position: absolute;
}

.asteroid-large {
  background-color: white;
}

.asteroid-medium {
  background-color: red;
}

.asteroid-small {
  background-color: blue;
}
</style>