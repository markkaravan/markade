<template>
    <div class="game-level-quest">
      <div class="opening-screen" v-if="currentScreen.name === 'Opening'">
        <h1 class="video-game-title">Level Quest</h1>
        <h2 class="video-game-subtitle" v-if="currentScreen.name === 'Opening'">{{ openingSubtitle }}</h2>
      </div>
      <div class="level-screen" v-if="currentScreen.name === 'Level'">
        <div class="game-window">
          <div class="player" :style="{ top: playerPosition.y + 'px', left: playerPosition.x + 'px' }"></div>
          <div class="goal" :style="{ top: goalPosition.y + 'px', left: goalPosition.x + 'px' }"></div>
          <div class="enemy" :style="{ top: enemyPosition.y + 'px', left: enemyPosition.x + 'px' }"></div>
        </div>
      </div>
      <div class="win-screen" v-if="currentScreen.name === 'Win'">
        <h1 class="win-title">YOU WIN</h1>
      </div>
      <div class="lose-screen" v-if="currentScreen.name === 'Lose'">
        <h1 class="lose-title">YOU LOSE</h1>
      </div>
    </div>
  </template>
  
  <script>
  // Define the screens
  const screens = [
    { name: 'Opening', n: null },
    { name: 'Level', n: 1 },
    { name: 'Level', n: 2 },
    { name: 'Level', n: 3 },
    { name: 'Win', n: null },
    { name: 'Lose', n: null }
  ]
  
  export default {
    name: 'GameLevelQuest',
    data() {
      return {
        currentScreen: screens[0],
        openingSubtitle: 'Push Spacebar to start.',
        playerPosition: { x: 50, y: 250 },
        goalPosition: { x: 750, y: 250 },
        enemyPosition: { x: 550, y: 250 },
        enemyDirection: { x: 1, y: 0 }
      }
    },
    mounted() {
      window.addEventListener('keydown', this.handleKeyDown)
      setInterval(this.moveEnemy, 1000)
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleKeyDown)
    },
    methods: {
      handleKeyDown(event) {
        if (this.currentScreen.name === 'Opening' && event.code === 'Space') {
          this.currentScreen = screens[1]
        } else if (this.currentScreen.name === 'Level') {
          if (event.code === 'KeyW' && this.playerPosition.y > 0) {
            this.playerPosition.y -= 10
          } else if (event.code === 'KeyS' && this.playerPosition.y < 490) {
            this.playerPosition.y += 10
          } else if (event.code === 'KeyA' && this.playerPosition.x > 0) {
            this.playerPosition.x -= 10
          } else if (event.code === 'KeyD' && this.playerPosition.x < 740) {
            this.playerPosition.x += 10
          }
          if (this.checkCollision(this.playerPosition, this.goalPosition)) {
            if (this.currentScreen.n === 1) {
              this.currentScreen = screens[2]
              this.goalPosition = { x: 750, y: 50 }
              this.enemyPosition = { x: 250, y: 250 }
            } else if (this.currentScreen.n === 2) {
              this.currentScreen = screens[3]
              this.goalPosition = { x: 750, y: 450 }
              this.enemyPosition = { x: 550, y: 50 }
            } else if (this.currentScreen.n === 3) {
              this.currentScreen = screens[4]
              setTimeout(() => {
                this.currentScreen = screens[0]
              }, 5000)
            }
          } else if (this.checkCollision(this.playerPosition, this.enemyPosition)) {
            this.currentScreen = screens[5]
            setTimeout(() => {
              this.currentScreen = screens[0]
            }, 5000)
          }
        }
      },
      moveEnemy() {
        if (this.currentScreen.name === 'Level') {
          const enemyHeight = 50
          const maxX = 800 - enemyHeight
          const maxY = 500 - enemyHeight
          const minX = 400
          const minY = 0
          const newX = this.enemyPosition.x + this.enemyDirection.x * enemyHeight
          const newY = this.enemyPosition.y + this.enemyDirection.y * enemyHeight
          if (newX > maxX || newX < minX) {
            this.enemyDirection.x *= -1
          }
          if (newY > maxY || newY < minY) {
            this.enemyDirection.y *= -1
          }
          this.enemyPosition.x += this.enemyDirection.x * enemyHeight
          this.enemyPosition.y += this.enemyDirection.y * enemyHeight
        }
      },
      checkCollision(position1, position2) {
        const distance = Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2))
        return distance < 50
      }
    }
  }
  </script>
  
  <style scoped>
  .game-level-quest {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 600;
    background-color: black;
  }
  
  .video-game-title {
    font-size: 5rem;
    color: white;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .video-game-subtitle {
    font-size: 2rem;
    color: white;
    text-align: center;
  }
  
  .game-window {
    position: relative;
    width: 800px;
    height: 200px;
    background-color: gray;
  }
  
  .player {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: white;
  }
  
  .goal {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: green;
  }
  
  .enemy {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: red;
  }
  
  .win-screen,
  .lose-screen {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 5rem;
    color: white;
    text-align: center;
    background-color: black;
  }
  </style>