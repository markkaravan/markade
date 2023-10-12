<template>
  <div class="game-wrapper" :class="{ 'game-window-paused': gs.isPaused }">
    <div class="opening-screen" v-if="gs.currentScreen.name === 'Opening'">
      <h1 class="video-game-title">Galaga</h1>
      <h2 class="video-game-subtitle" v-if="gs.currentScreen.name === 'Opening'">{{ gs.openingSubtitle }}</h2>
    </div>
    <div class="level-screen" v-if="gs.currentScreen.name === 'Level'">
      <div class="game-window" :style="{ backgroundColor: gs.backgroundColor }">
        <div class="player" :style="{ top: gs.player.position.y + 'px', left: gs.player.position.x + 'px', width: gs.player.width + 'px', height: gs.player.height + 'px' }"></div>
        <div class="enemy" v-for="enemy in gs.enemies" :key="enemy.id" :class="['enemy', 'enemy-' + enemy.type]" :style="{ top: enemy.position.y + 'px', left: enemy.position.x + 'px', width: enemy.width + 'px', height: enemy.height + 'px' }"></div>
        <div class="bullet" v-for="bullet in gs.bullets" :key="bullet.id" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px' }"></div>
        <div class="enemy-bullet" v-for="bullet in gs.enemyBullets" :key="bullet.id" :class="['enemy-bullet', 'enemy-bullet-' + bullet.type]" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px' }"></div>
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

const playerWidth = 50;
const playerHeight = 50;

const bulletSpeed = 300;
const bulletWidth = 5;
const bulletHeight = 10;

const enemyWidth = 30;
const enemyHeight = 30;

const enemyBulletWidth = 5;
const enemyBulletHeight = 10;
const enemyBulletSpeed = 200;
const enemy1BulletFrequency = 0.001; // 10 seconds on average
const enemy2BulletFrequency = 0.002; // 5 seconds on average

const transitionScreenDelay = 2000;
const goalSize = 50;
// Define the screens
const screens = [
  { name: 'Opening', n: null },
  {
    name: 'Level',
    n: 1,
    levelData: {
      backgroundColor: 'rgb(173, 216, 230)', // light blue
      // enemies: 3,
      enemies: [
        ['enemy1', 'enemy2', 'enemy1', 'enemy2', 'enemy1'], 
        ['enemy2', 'enemy1', 'enemy2', 'enemy1', 'enemy2'], 
        ['enemy1', 'enemy2', 'enemy1', 'enemy2', 'enemy1']
      ]
    },
  },
  { name: 'Win', n: null },
  { name: 'Lose', n: null },
];
const defaultGameState = {
  currentScreen: screens.find((screen) => screen.name === 'Opening'),
  openingSubtitle: 'Push Spacebar to start.',
  player: null,
  backgroundColor: null,
  enemies: [],
  bullets: [],
  enemyBullets: [],
  isPaused: false,
};

export default {
  name: 'GameLevelQuest',

  data() {
    return {
      gs: {...defaultGameState }, // gs stands for game state
      lastTimestamp: null,
    };
  },

  computed: {
    keys() {
      return {
        left: 0,
        up: 0,
        right: 0,
        down: 0
      };
    }
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    requestAnimationFrame(this.updateGameState);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  },

  methods: {
    copyObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    
    initializePlayer() {
      this.gs.player = {
        position: { x: gameWidth / 2 - playerWidth / 2, y: gameHeight - playerHeight },
        width: playerWidth,
        height: playerHeight,
        moveLeft: false,
        moveRight: false,
      }
    },

    initializeEnemies() {
      this.gs.enemies = [];
      for (let i = 0; i < this.gs.currentScreen.levelData.enemies.length; i++) {
        for (let j = 0; j < this.gs.currentScreen.levelData.enemies[i].length; j++) {
          const offsetX = (gameWidth / 2) - ((this.gs.currentScreen.levelData.enemies[i].length * 100) / 2);
          const enemyX = (j * 50) + offsetX;
          const enemyY = i * 50;
          this.gs.enemies.push({
            id: i + "," + j,
            row: i,
            col: j,
            type: this.gs.currentScreen.levelData.enemies[i][j],
            position: { x: enemyX, y: enemyY },
            direction: { x: -1, y: 0 },
            width: enemyWidth,
            height: enemyHeight,
          });
        }
      }
    },

    loadScreen(name, n = null) {
      /*****  Opening Screen *****/
      if (name === 'Opening') {
        this.gs = this.copyObject(defaultGameState);
      } /*****  End Opening Screen *****/
      


      /*****  Level Screen *****/
      else if (name === 'Level') {
        this.gs.currentScreen = { name: 'Transition', n: n };
        const nextLevel = screens.find((screen) => screen.name === 'Level' && screen.n === n);
        setTimeout(() => {
          this.gs.currentScreen = nextLevel;
          // Add game state properties from levelData to game state
          for (const [key, value] of Object.entries(this.gs.currentScreen.levelData)) {
            this.gs[key] = value;
          }

          this.initializePlayer();
          this.initializeEnemies();

        }, transitionScreenDelay);
      }  /***** End Level Screen *****/
      


      /*****  Win Screen *****/
      else if (name === 'Win') {
        this.gs.currentScreen = screens.find((screen) => screen.name === 'Win');
        setTimeout(() => {
          this.loadScreen('Opening');
        }, transitionScreenDelay);
      } /*****  End Win Screen *****/
      


      /*****  Lose Screen *****/
      else if (name === 'Lose') {
        this.gs.currentScreen = screens.find((screen) => screen.name === 'Lose');
        setTimeout(() => {
          this.loadScreen('Opening');
        }, transitionScreenDelay);
      } /*****  End Lose Screen *****/
    },


    handleKeyDown(event) {
      // Opening screen keyboard actions
      if (this.gs.currentScreen.name === 'Opening' && event.code === 'Space') {
        this.loadScreen('Level', 1); 
      } // End opening screen keyboard actions

      else if (this.gs.currentScreen.name === 'Level') {
        if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
          this.gs.player.moveLeft = true;
        }
        if (event.code === 'KeyD' || event.code === 'ArrowRight') {
          this.gs.player.moveRight = true;
        }

        if (event.code === 'Space') {
          const bulletX = this.gs.player.position.x + this.gs.player.width / 2 - bulletWidth / 2;
          const bulletY = this.gs.player.position.y - bulletHeight;
          this.gs.bullets.push({
            position: { x: bulletX, y: bulletY },
            width: bulletWidth,
            height: bulletHeight
          });
        }
      }
    },

    handleKeyUp(event) {
      if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
        this.gs.player.moveLeft = false;
      }
      if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        this.gs.player.moveRight = false;
      }

      // Pause the game
      if (event.key === 'p') {
        this.gs.isPaused = !this.gs.isPaused;
      }
    },

    updateGameState(timestamp) {
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
      }
      const timeDelta = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      if (this.gs.currentScreen.name === 'Level' && !this.gs.isPaused) {

        /*****  Move the player *****/
        const playerSpeed = 200;
        if (this.gs.player.moveLeft && this.gs.player.position.x > 0) {
          this.gs.player.position.x -= playerSpeed * timeDelta;
        }
        if (this.gs.player.moveRight && this.gs.player.position.x < (gameWidth - this.gs.player.width)) {
          this.gs.player.position.x += playerSpeed * timeDelta;
        }
        /***** End Move the player *****/


        /*****  Move the enemies *****/
        const enemySpeed = 100;
        this.gs.enemies.forEach((enemy) => {
          enemy.position.x += enemy.direction.x * enemySpeed * timeDelta;
          enemy.position.y += enemy.direction.y * enemySpeed * timeDelta;

          // Check for collision with the game borders
          const offsetLeft = enemy.col * 50;
          const offsetRight = (this.gs.currentScreen.levelData.enemies[enemy.row].length - enemy.col) * 50;
          if (enemy.position.x < offsetLeft || enemy.position.x > gameWidth - enemy.width - offsetRight) {
            enemy.direction.x *= -1;
            enemy.position.x = Math.max(0, Math.min(enemy.position.x, gameWidth - enemy.width));
          }
          if (enemy.position.y < 0 || enemy.position.y > gameHeight - enemy.height) {
            enemy.direction.y *= -1;
            enemy.position.y = Math.max(0, Math.min(enemy.position.y, gameHeight - enemy.height));
          }
          // Fire enemy bullets
          if (Math.random() < (enemy.type === 'enemy1' ? enemy1BulletFrequency : enemy2BulletFrequency)) {
            const bulletX = enemy.position.x + enemy.width / 2 - enemyBulletWidth / 2;
            const bulletY = enemy.position.y + enemy.height;
            this.gs.enemyBullets.push({
              position: { x: bulletX, y: bulletY },
              width: enemy.type === 'enemy1' ? enemyBulletWidth / 2 : enemyBulletWidth,
              height: enemy.type === 'enemy1' ? enemyBulletHeight / 2 : enemyBulletHeight,
              speed: enemy.type === 'enemy1' ? enemyBulletSpeed * 2 : enemyBulletSpeed,
              direction: { x: 0, y: 1 },
              type: enemy.type,
            });
          }
        });

        // Update enemy bullet position
        this.gs.enemyBullets.forEach((enemyBullet) => {
          enemyBullet.position.y += enemyBulletSpeed * timeDelta;
        });


        // Remove enemy bullets that are offscreen  
        this.gs.enemyBullets = this.gs.enemyBullets.filter((enemyBullet) => {
          return enemyBullet.position.y < gameHeight;
        });

        // Update bullet position
        this.gs.bullets.forEach((bullet) => {
          bullet.position.y -= bulletSpeed * timeDelta;
        });

        // Remove bullets that are offscreen  
        this.gs.bullets = this.gs.bullets.filter((bullet) => {
          return bullet.position.y > 0;
        });

        // Check for collisions between bullets and enemies
        this.gs.bullets.forEach((bullet) => {
          this.gs.enemies.forEach((enemy, index) => {
            if (this.checkCollision(bullet, enemy)) {
              // Remove the enemy from the enemies array
              this.gs.enemies.splice(index, 1);
              // Remove the bullet from the bullets array
              this.gs.bullets.splice(this.gs.bullets.indexOf(bullet), 1);
            }
          });
        });

        // Check for collisions between player and enemies
        this.gs.enemies.forEach((enemy) => {
          if (this.checkCollision(this.gs.player, enemy)) {
            this.loadScreen('Lose');
          }
        });

        // Check for collisions between enemy bullets and player
        this.gs.enemyBullets.forEach((bullet) => {
          if (this.checkCollision(this.gs.player, bullet)) {
            this.loadScreen('Lose');
          }
        });

        // Win condition
        if (this.gs.enemies.length === 0) {
          if (this.gs.currentScreen.n < this.getMaxLevel()) {
            this.loadScreen('Level', this.gs.currentScreen.n + 1);
          } else {
            this.loadScreen('Win');
          }
        }   
      }
      requestAnimationFrame(this.updateGameState);
    },

    getMaxLevel() {
      return Math.max(...screens.filter((screen) => screen.name === 'Level').map((screen) => screen.n));
    },

    checkCollision(obj1, obj2) {
      const obj1Left = obj1.position.x;
      const obj1Right = obj1.position.x + obj1.width;
      const obj1Top = obj1.position.y;
      const obj1Bottom = obj1.position.y + obj1.height;

      const obj2Left = obj2.position.x;
      const obj2Right = obj2.position.x + obj2.width;
      const obj2Top = obj2.position.y;
      const obj2Bottom = obj2.position.y + obj2.height;

      return obj1Left < obj2Right && obj1Right > obj2Left && obj1Top < obj2Bottom && obj1Bottom > obj2Top;
    },
  },
};
</script>

<style scoped>
.game-wrapper {
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

      .enemy.enemy-enemy1 {
        background-image: url('@/assets/images/badguy.jpeg');
      }

      .enemy.enemy-enemy2 {
        background-image: url('@/assets/images/spacedude.png');
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

  .enemy-bullet {
    position: absolute;
    background-color: yellow;
  }

  .enemy-bullet-enemy1 {
    width: 2.5px;
    height: 5px;
    background-color: yellow;
  }

  .enemy-bullet-enemy2 {
    width: 5px;
    height: 10px;
    background-color: red;
  }

  .game-window-paused {
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 48px;
    color: #fff;
    z-index: 1000;
  }
}
</style>