<template>
    <div class="game-level-quest">
      <div class="opening-screen" v-if="gs.currentScreen.name === 'Opening'">
        <h1 class="video-game-title">Level Quest</h1>
        <h2 class="video-game-subtitle" v-if="gs.currentScreen.name === 'Opening'">{{ gs.openingSubtitle }}</h2>
      </div>
      <div class="level-screen" v-if="gs.currentScreen.name === 'Level'">
        <div class="game-window" :style="{ backgroundColor: gs.backgroundColor }">
          <div class="player" :style="{ top: gs.playerPosition.y + 'px', left: gs.playerPosition.x + 'px' }"></div>
          <div class="goal" :style="{ top: gs.goalPosition.y + 'px', left: gs.goalPosition.x + 'px' }"></div>
          <div class="enemy" :style="{ top: gs.enemyPosition.y + 'px', left: gs.enemyPosition.x + 'px' }"></div>
        </div>
      </div>
      <div class="transition-screen" v-if="gs.currentScreen.name === 'Transition'">
        <h1 class="transition-title">LEVEL {{ gs.currentScreen.n }}</h1>
      </div>
      <div class="win-screen" v-if="gs.currentScreen.name === 'Win'">
        <h1 class="win-title">YOU WIN</h1>
      </div>
      <div class="lose-screen" v-if="gs.currentScreen.name === 'Lose'">
        <h1 class="lose-title">YOU LOSE</h1>
      </div>
    </div>
  </template>
  
  <script>
  const gameWidth = 800;
  const gameHeight = 333;
  // Define the screens
  const screens = [
    { name: 'Opening', n: null },
    { name: 'Level', n: 1, 
      levelData: {
        goalPosition: { x: gameWidth-50, y: 250 },
        enemyPosition: { x: 550, y: 250 },
        backgroundColor: 'rgb(173, 216, 230)', // light blue
    } },
    { name: 'Level', n: 2, levelData: {
        goalPosition: { x: gameWidth-50, y: 50 },
        enemyPosition: { x: 250, y: 250 },
        backgroundColor: 'rgb(0, 0, 255)', // blue
    } },
    { name: 'Level', n: 3, levelData: {
        goalPosition: { x: gameWidth-50, y: gameHeight-50 },
        enemyPosition: { x: 550, y: 50 },
        backgroundColor: 'rgb(0, 0, 139)', // dark blue
    } },
    { name: 'Level', n: 4, levelData: {
        goalPosition: { x: gameWidth-50, y: gameHeight-50 },
        enemyPosition: { x: 550, y: 50 },
        backgroundColor: 'rgb(255, 165, 0)', // orange
    } },
    { name: 'Win', n: null },
    { name: 'Lose', n: null }
  ]
  const defaultGameState = {
    currentScreen: screens.find(screen => screen.name === 'Opening'),
    openingSubtitle: 'Push Spacebar to start.',
    playerPosition: { x: 50, y: 250 },
    goalPosition: { x: (gameWidth - 50), y: 250 },
    enemyPosition: { x: 550, y: 250 },        
    enemyDirection: { x: 1, y: 0 },
    enemyIntervalId: null,
    backgroundColor: null,
  };
  
  export default {
    name: 'GameLevelQuest',
    data() {
      return {
        gs: this.copyObject(defaultGameState) // gs stands for game state
      }
    },
    mounted() {
      window.addEventListener('keydown', this.handleKeyDown)
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleKeyDown)
    },
    methods: {
      copyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },

      loadScreen(name, n = null) {
        if (name === 'Opening') {
          this.gs = this.copyObject(defaultGameState);
        }
        else if (name === 'Level') {
          clearInterval(this.gs.enemyIntervalId);
          this.gs.enemyIntervalId = null;
          this.gs.currentScreen = {name: 'Transition', n: n};
          const nextLevel = screens.find(screen => screen.name === 'Level' && screen.n === n);
          setTimeout(() => { 
            this.gs.currentScreen = nextLevel;
            for (const [key, value] of Object.entries(this.gs.currentScreen.levelData)) {
              this.gs[key] = value;
            }
            this.gs.enemyIntervalId = setInterval(this.moveEnemy, 1000);
          }, 2000);
        }
        else if (name === 'Win') {
          this.gs.currentScreen = screens.find(screen => screen.name === 'Win');
          clearInterval(this.gs.enemyIntervalId);
          this.gs.enemyIntervalId = null;
          setTimeout(() => { this.loadScreen('Opening') }, 5000);
        }
        else if (name === 'Lose') {
          this.gs.currentScreen = screens.find(screen => screen.name === 'Lose');
          clearInterval(this.gs.enemyIntervalId);
          this.gs.enemyIntervalId = null;
          setTimeout(() => { this.loadScreen('Opening') }, 5000);
        }
      },
      handleKeyDown(event) {
        // Opening
        if (this.gs.currentScreen.name === 'Opening' && event.code === 'Space') {
          this.loadScreen('Level', 1);
        // Level
        } else if (this.gs.currentScreen.name === 'Level') {
          if (event.code === 'KeyW' && this.gs.playerPosition.y > 0) {
            this.gs.playerPosition.y -= 10
          } else if (event.code === 'KeyS' && this.gs.playerPosition.y < gameHeight-50) {
            this.gs.playerPosition.y += 10
          } else if (event.code === 'KeyA' && this.gs.playerPosition.x > 0) {
            this.gs.playerPosition.x -= 10
          } else if (event.code === 'KeyD' && this.gs.playerPosition.x < gameWidth-50) {
            this.gs.playerPosition.x += 10
          }
          if (this.checkCollision(this.gs.playerPosition, this.gs.goalPosition)) {
            if (this.gs.currentScreen.n < this.getMaxLevel()) {
              this.loadScreen('Level', this.gs.currentScreen.n+1);
            } else {
              this.loadScreen('Win');
            }
          } else if (this.checkCollision(this.gs.playerPosition, this.gs.enemyPosition)) {
            this.loadScreen('Lose');
          }
        }
      },

      moveEnemy() {
        if (this.gs.currentScreen.name === 'Level') {
          const enemyHeight = 50
          const maxX = gameWidth - enemyHeight
          const maxY = gameHeight - enemyHeight
          const minX = 400
          const minY = 0
          const newX = this.gs.enemyPosition.x + this.gs.enemyDirection.x * enemyHeight
          const newY = this.gs.enemyPosition.y + this.gs.enemyDirection.y * enemyHeight
          if (newX > maxX || newX < minX) {
            this.gs.enemyDirection.x *= -1
          }
          if (newY > maxY || newY < minY) {
            this.gs.enemyDirection.y *= -1
          }
          this.gs.enemyPosition.x += this.gs.enemyDirection.x * enemyHeight
          this.gs.enemyPosition.y += this.gs.enemyDirection.y * enemyHeight
        }
      },

      getMaxLevel() {
        return Math.max(...screens.filter(screen => screen.name === 'Level').map(screen => screen.n))
      },

      checkCollision(position1, position2) {
        const distance = Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2))
        return distance < 50
      }
    }
  }
  </script>
  
  <style scoped>
  .body {
    height: 900px;
    background-color: aqua;
  }
  .game-level-quest {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: black;
    .opening-screen {
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
    };
    .level-screen {
        height: 100%;
        .game-window {
            position: relative;
            width: 800px;
            height: 100%;
            /* background-color: blue; */
            .player {
                position: absolute;
                width: 50px;
                height: 50px;
                background-color: white;
            };
            
            .goal {
                position: absolute;
                width: 50px;
                height: 50px;
                background-color: green;
            };
            
            .enemy {
                position: absolute;
                width: 50px;
                height: 50px;
                background-color: red;
            };
        };
    }
    .win-screen, .lose-screen, .transition-screen {
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
  }
  </style>