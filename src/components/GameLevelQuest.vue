<template>
  <div class="game-level-quest">
    <div class="opening-screen" v-if="gs.currentScreen.name === 'Opening'">
      <h1 class="video-game-title">Level Quest</h1>
      <h2 class="video-game-subtitle" v-if="gs.currentScreen.name === 'Opening'">{{ gs.openingSubtitle }}</h2>
    </div>
    <div class="level-screen" v-if="gs.currentScreen.name === 'Level'">
      <div class="game-window" :style="{ backgroundColor: gs.backgroundColor }">
        <div class="player" :style="{ top: gs.player.position.y + 'px', left: gs.player.position.x + 'px' }"></div>
        <div class="goal" :style="{ top: gs.goalPosition.y + 'px', left: gs.goalPosition.x + 'px' }"></div>
        <div class="enemy" v-for="enemy in gs.enemies" :key="enemy.id" :style="{ top: enemy.position.y + 'px', left: enemy.position.x + 'px' }"></div>
        <div class="bullet" v-for="bullet in gs.bullets" :key="bullet.id" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px' }"></div>
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
const bulletSpeed = 300;
const initialPlayerPosition = { x: 50, y: 250 };
const transitionScreenDelay = 2000;
// Define the screens
const screens = [
  { name: 'Opening', n: null },
  {
    name: 'Level',
    n: 1,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: 250 },
      backgroundColor: 'rgb(173, 216, 230)', // light blue
      enemies: 3,
    },
  },
  {
    name: 'Level',
    n: 2,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: 50 },
      backgroundColor: 'rgb(0, 0, 255)', // blue
      enemies: 2,
    },
  },
  {
    name: 'Level',
    n: 3,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: gameHeight - 50 },
      backgroundColor: 'rgb(0, 0, 139)', // dark blue
      enemies: 3,
    },
  },
  {
    name: 'Level',
    n: 4,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: gameHeight - 50 },
      enemyPosition: { x: 550, y: 50 },
      backgroundColor: 'rgb(255, 165, 0)', // orange
      enemies: 4,
    },
  },
  { name: 'Win', n: null },
  { name: 'Lose', n: null },
];
const defaultGameState = {
  currentScreen: screens.find((screen) => screen.name === 'Opening'),
  openingSubtitle: 'Push Spacebar to start.',
  player: { position:  initialPlayerPosition },
  goalPosition: { x: gameWidth - 50, y: 250 },
  // enemyIntervalId: null,
  backgroundColor: null,
  enemies: [],
  bullets: [],
};

export default {
  name: 'GameLevelQuest',
  data() {
    return {
      gs: {...defaultGameState }, // gs stands for game state
      lastTimestamp: null,
    };
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    requestAnimationFrame(this.updateGameState);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    copyObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    loadScreen(name, n = null) {
      // Opening
      if (name === 'Opening') {
        this.gs = this.copyObject(defaultGameState);
      // Level
      } else if (name === 'Level') {
        // clearInterval(this.gs.enemyIntervalId);
        // this.gs.enemyIntervalId = null;
        this.gs.currentScreen = { name: 'Transition', n: n };
        const nextLevel = screens.find((screen) => screen.name === 'Level' && screen.n === n);
        setTimeout(() => {
          this.gs.currentScreen = nextLevel;
          // Add game state properties from levelData to game state
          for (const [key, value] of Object.entries(this.gs.currentScreen.levelData)) {
            this.gs[key] = value;
          }

          // Initialize the player
          this.gs.player = { position: this.copyObject(initialPlayerPosition) };

          // Add enemies to game state
          this.gs.enemies = [];
          for (let i = 1; i <= this.gs.currentScreen.levelData.enemies; i++) {
            const enemyX = Math.floor(Math.random() * (gameWidth / 2 - 50) + gameWidth / 2);
            const enemyY = Math.floor(Math.random() * (gameHeight - 50));
            this.gs.enemies.push({
              id: i,
              position: { x: enemyX, y: enemyY },
              direction: { x: 1, y: 0 },
            });
          }

        }, transitionScreenDelay);
      } else if (name === 'Win') {
        this.gs.currentScreen = screens.find((screen) => screen.name === 'Win');
        setTimeout(() => {
          this.loadScreen('Opening');
        }, transitionScreenDelay);
      } else if (name === 'Lose') {
        this.gs.currentScreen = screens.find((screen) => screen.name === 'Lose');
        setTimeout(() => {
          this.loadScreen('Opening');
        }, transitionScreenDelay);
      }
    },
    handleKeyDown(event) {
      // Opening
      if (this.gs.currentScreen.name === 'Opening' && event.code === 'Space') {
        this.loadScreen('Level', 1);
        // Level
      } else if (this.gs.currentScreen.name === 'Level') {
        if (event.code === 'KeyW' && this.gs.player.position.y > 0) {
          this.gs.player.position.y -= 10;
        } else if (event.code === 'KeyS' && this.gs.player.position.y < gameHeight - 50) {
          this.gs.player.position.y += 10;
        } else if (event.code === 'KeyA' && this.gs.player.position.x > 0) {
          this.gs.player.position.x -= 10;
        } else if (event.code === 'KeyD' && this.gs.player.position.x < gameWidth - 50) {
          this.gs.player.position.x += 10;
        }
        if (event.code === 'Space' && event.repeat === false) {
          const bulletX = this.gs.player.position.x + 50;
          const bulletY = this.gs.player.position.y + 25;
          this.gs.bullets.push({ id: Date.now(), position: { x: bulletX, y: bulletY } });
        }
        console.log("this.gs.player.position", this.gs.player.position, "this.gs.goalPosition", this.gs.goalPosition );
        if (this.checkCollision(this.gs.player.position, this.gs.goalPosition)) {
          if (this.gs.currentScreen.n < this.getMaxLevel()) {
            this.loadScreen('Level', this.gs.currentScreen.n + 1);
          } else {
            this.loadScreen('Win');
          }
        } 
      }
    },

    updateGameState(timestamp) {
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
      }
      const elapsed = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      if (this.gs.currentScreen.name === 'Level') {
        // Move the enemies
        for (let i = 0; i < this.gs.enemies.length; i++) {
          const enemyHeight = 50;
          const maxX = gameWidth - enemyHeight;
          const maxY = gameHeight - enemyHeight;
          let enemy = this.gs.enemies[i];
          const newX = enemy.position.x + enemy.direction.x * (enemyHeight * (elapsed / 1000));
          const newY = enemy.position.y + enemy.direction.y * (enemyHeight * (elapsed / 1000));
          if (newX > maxX || newX < 0) {
            enemy.direction.x *= -1;
          }
          if (newY > maxY || newY < 0) {
            enemy.direction.y *= -1;
          }
          enemy.position.x = newX;
          enemy.position.y = newY;
          // Check for collision with player
          if (this.checkCollision(this.gs.player.position, enemy.position)) {
            this.loadScreen('Lose');
          }
        }
        // Move the bullets
        for (let i = 0; i < this.gs.bullets.length; i++) {
          const bullet = this.gs.bullets[i];
          bullet.position.x += bulletSpeed * (elapsed / 1000);
          // Check if the bullet has hit the right end of the screen
          if (bullet.position.x > gameWidth) {
            this.gs.bullets.splice(i, 1);
            i--;
          } else {
            // Check for collisions between the bullet and enemies
            for (let j = 0; j < this.gs.enemies.length; j++) {
              const enemy = this.gs.enemies[j];
              if (this.checkCollision(bullet.position, enemy.position)) {
                // Remove the enemy from the enemies array
                this.gs.enemies.splice(j, 1);
                // Remove the bullet from the bullets array
                this.gs.bullets.splice(i, 1);
                i--;
                break;
              }
            }
          }
        }
      }
      requestAnimationFrame(this.updateGameState);
    },

    getMaxLevel() {
      return Math.max(...screens.filter((screen) => screen.name === 'Level').map((screen) => screen.n));
    },

    checkCollision(position1, position2) {
      const distance = Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
      return distance < 50;
    },
  },
};
</script>

<style scoped>
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
  }
  .level-screen {
    height: 100%;
    .game-window {
      position: relative;
      width: 800px;
      height: 100%;
      .player, .goal, .enemy {
        position: absolute;
        width: 50px;
        height: 50px;
        background-size: contain;
        background-repeat: no-repeat;
      }
      .player {
        background-image: url('@/assets/images/spacedude.png');
      }

      .goal {
        background-image: url('@/assets/images/heart.png');
      }

      .enemy {
        background-image: url('@/assets/images/badguy.jpeg');
      }
    }
  }
  .win-screen,
  .lose-screen,
  .transition-screen {
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
  .bullet {
    position: absolute;
    width: 20px;
    height: 10px;
    background-color: purple;
  }
}
</style>