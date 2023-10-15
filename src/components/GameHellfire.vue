<template>
  <div class="game-wrapper" :class="{ 'game-window-paused': gs.isPaused }">
    <div class="opening-screen" v-if="gs.currentScreen.name === 'Opening'">
      <h1 class="video-game-title">Hellfire</h1>
      <h2 class="video-game-subtitle" v-if="gs.currentScreen.name === 'Opening'">{{ gs.openingSubtitle }}</h2>
    </div>
    <div class="level-screen" v-if="gs.currentScreen.name === 'Level'">
      <div class="game-background" :style="{ backgroundPositionX: gs.backgroundPositionX + 'px' }"></div>
      <div class="game-window" :style="{ top: '-' + dataGameHeight + 'px', width: dataGameWidth + 'px' }">
        <div class="game-header">
          <div class="score">Score: {{ gs.score }}</div>
          <div class="time-remaining">Time Remaining: {{ gs.displayTime }}</div>
          <div class="lives">Lives: {{ gs.lives }}</div>
        </div>
        <div class="player" :style="{ top: gs.player.position.y + 'px', left: gs.player.position.x + 'px', width: gs.player.width + 'px', height: gs.player.height + 'px' }"></div>
        <div class="bullet" v-for="bullet in gs.bullets" :key="bullet.id" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px' }"></div>
        <div class="enemy" v-for="enemy in gs.enemies" :key="enemy.id" :class="['enemy', 'enemy-' + enemy.name]" :style="{ top: enemy.position.y + 'px', left: enemy.position.x + 'px', width: enemy.width + 'px', height: enemy.height + 'px' }"></div>
        <div class="enemy-bullet" v-for="bullet in gs.enemyBullets" :key="bullet.id" :class="['enemy-bullet']" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px'}"></div>
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
const gameWidthDefault = 800;
const gameHeightDefault = 333;

const playerWidth = 65;
const playerHeight = 90;

const bulletSpeed = 300;
const bulletWidth = 10;
const bulletHeight = 5;

const enemyWidth = 30;
const enemyHeight = 30;

const enemyBulletWidth = 15;
const enemyBulletHeight = 10;
const enemyBulletSpeed = -300;

const transitionScreenDelay = 2000;
const goalSize = 50;
// Define the enemies
const enemies = [
  {
    name: 'blue', 
    width: 80, 
    height: 80, 
    speed: 400,
    hp: 10,
    points: 10,
  },
  {
    name: 'yellow', 
    width: 180, 
    height: 180, 
    speed: 50,
    hp: 10,
    points: 20,
  },
  {
    name: 'purple', 
    width: 250, 
    height: 250, 
    speed: 270,
    hp: 10,
    points: 30,
    lastBulletTime: null,
  },
  {
    name: 'red', 
    width: 250, 
    height: 250, 
    speed: 170,
    hp: 10,
    points: 40,
  },
  {
    name: 'red-small', 
    width: 100, 
    height: 100, 
    speed: 270,
    hp: 10,
    points: 20,
  },
  {
    name: 'green', 
    width: 250, 
    height: 250, 
    speed: 270,
    hp: 30,
    points: 70,
  },
]
// Define the screens
const screens = [
  { name: 'Opening', n: null },
  {
    name: 'Level',
    n: 1,
    levelTime: 30,
    levelData: {
      backgroundImage: 'hellfire_background_level_1.png',
      enemyData: [
        // {name: 'red', spawnProbability: 0.25}, 
        {name: 'purple', spawnProbability: 0.25},
      ],

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
  timeRemaining: 30,
  score: 0,
  startTime: null,
  displayTime: null,
  lives: 3, 
};

export default {
  name: 'GameHellfire',
  props: {
    gameWidth: {
      type: Number,
      required: true
    },
    gameHeight: {
      type: Number,
      required: true
    },
  },

  data() {
    return {
      dataGameWidth: gameWidthDefault,
      dataGameHeight: gameHeightDefault,
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
    this.dataGameWidth = 1200;
    this.dataGameHeight = 400;
    console.log("Mounted:", this.gameWidth, this.gameHeight);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
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
    copyObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    
    initializePlayer() {
      this.gs.player = {
        position: { x: 10, y: this.dataGameHeight / 2 - playerHeight },
        width: playerWidth,
        height: playerHeight,
        moveUp: false,
        moveDown: false,
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

          // Set the start time
          this.gs.startTime = new Date();
          //this.gs.timeRemaining = this.gs.currentScreen.levelData.levelTime;

          // Begin the scrolling background
          this.gs.backgroundPositionX = 0;

          this.initializePlayer();
          
          this.gs.enemies = [];

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
        if (event.code === 'KeyW' || event.code === 'ArrowUp') {
          this.gs.player.moveUp = true;
        }
        if (event.code === 'KeyS' || event.code === 'ArrowDown') {
          this.gs.player.moveDown = true;
        }

        if (event.code === 'Space') {
          const bulletX = this.gs.player.position.x + this.gs.player.width / 2 - bulletWidth / 2 + 5;
          const bulletY = this.gs.player.position.y - bulletHeight + 16;
          this.gs.bullets.push({
            position: { x: bulletX, y: bulletY },
            width: bulletWidth,
            height: bulletHeight
          });
        }
      }
    },

    handleKeyUp(event) {
      if (event.code === 'KeyW' || event.code === 'ArrowUp') {
        this.gs.player.moveUp = false;
      }
      if (event.code === 'KeyS' || event.code === 'ArrowDown') {
        this.gs.player.moveDown = false;
      }

      // Pause the game
      if (event.key === 'p') {
        this.gs.isPaused = !this.gs.isPaused;
      }
    },

    generateRandomId() {
      const min = 10000000;
      const max = 99999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
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
        if (this.gs.player.moveUp && this.gs.player.position.y > 0) {
          this.gs.player.position.y -= playerSpeed * timeDelta;
        }
        if (this.gs.player.moveDown && this.gs.player.position.y < (this.dataGameHeight - this.gs.player.height)) {
          this.gs.player.position.y += playerSpeed * timeDelta;
        }
        /***** End Move the player *****/

        // Set time remaining display
        this.gs.displayTime = Math.floor((this.gs.currentScreen.levelTime - (new Date() - this.gs.startTime) / 1000));

        /*** Spawn enemies ***/
        const random = Math.random();
        this.gs.enemyData.forEach((enemyType) => {
          let enemy = enemies.find((enemy) => enemy.name === enemyType.name);
          if (random < (enemyType.spawnProbability / 50)) {
            const enemyX = this.dataGameWidth
            const enemyY = Math.random() * (this.dataGameHeight - enemy.height);
            let newEnemy = {
              ...enemy,
              id: this.generateRandomId(),
              position: { x: enemyX, y: enemyY },
              direction: { x: -1, y: 0 },
            }
            this.gs.enemies.push(newEnemy);
           }
        });
        /** Enemies spawned **/

        // Update the background position
        this.gs.backgroundPositionX -= 10 * timeDelta;

        // Update bullet position
        this.gs.bullets.forEach((bullet) => {
          bullet.position.x += bulletSpeed * timeDelta;
        });

        // Remove bullets that are offscreen  
        this.gs.bullets = this.gs.bullets.filter((bullet) => {
          return bullet.position.x < this.dataGameWidth - bulletWidth + 1;
        });


        // Update enemy bullet position
        this.gs.enemyBullets.forEach((bullet) => {
          bullet.position.x += enemyBulletSpeed * timeDelta;
        });

        // Remove enemy bullets that are offscreen  
        this.gs.enemyBullets = this.gs.enemyBullets.filter((bullet) => {
          return bullet.position.x > 0; // + enemyBulletWidth - 1;
        });

        // Check for collisions between bullets and enemies
        this.gs.bullets.forEach((bullet) => {
          this.gs.enemies.forEach((enemy, index) => {
            if (this.checkCollision(bullet, enemy)) {
              // Remove 10 hp from the enemy
              enemy.hp -= 10;

              // If the enemy has no hp left, remove it from the enemies array
              if (enemy.hp <= 0) {
                if (enemy.name === 'red') {
                  let smallRed = enemies.find((enemy) => enemy.name === 'red-small');
                  // Small red enemy has 3 different directions
                  this.gs.enemies.push({
                    ...smallRed,
                    id: this.generateRandomId(),
                    position: { x: enemy.position.x, y: enemy.position.y },
                    direction: { x: -1, y: -1 },
                  });
                  this.gs.enemies.push({
                    ...smallRed,
                    id: this.generateRandomId(),
                    position: { x: enemy.position.x, y: enemy.position.y },
                    direction: { x: -1, y: 0 },
                  });
                  this.gs.enemies.push({
                    ...smallRed,
                    id: this.generateRandomId(),
                    position: { x: enemy.position.x, y: enemy.position.y },
                    direction: { x: -1, y: 1 },
                  });
                }
                // Add points to the score
                this.gs.score += enemy.points;
                // Remove the enemy from the enemies array
                this.gs.enemies.splice(index, 1);
              }

              // Remove the bullet from the bullets array
              this.gs.bullets.splice(this.gs.bullets.indexOf(bullet), 1);
            }
          });
        });

        /*****  Move the enemies *****/
        this.gs.enemies.forEach((enemy) => {
          if (enemy.name === 'blue') {
            const angle = Math.atan2(this.gs.player.position.y - enemy.position.y, this.gs.player.position.x - enemy.position.x);
            const xVelocity = enemy.speed * Math.cos(angle);
            const yVelocity = enemy.speed * Math.sin(angle);
            enemyPosition.x += xVelocity * timeDelta;
            enemyPosition.y += yVelocity * timeDelta;
          } else if (enemy.name === 'yellow') {
            enemy.position.x -= enemy.speed * timeDelta;
            enemy.position.y = Math.sin(enemy.position.x / 50) * 50 + this.dataGameHeight / 2;
          } else if (enemy.name === 'purple') {
            enemy.position.x -= enemy.speed * timeDelta;
            // Fire a bullet once every two seconds
            enemy.lastBulletTime = enemy.lastBulletTime || 0;
            if (Date.now() - enemy.lastBulletTime > 2000) {
              console.log("FIRING ENEMY BULLET", this.gs.enemyBullets);
              this.gs.enemyBullets.push({
                id: this.generateRandomId(),
                width: enemyBulletWidth,
                height: enemyBulletHeight,
                position: {
                  x: enemy.position.x - enemy.width / 2,
                  y: enemy.position.y + enemy.height / 2
                },
                direction: { x: -1, y: 0}
              });
              enemy.lastBulletTime = Date.now();
            }
          } else if (enemy.name === 'red') {
            enemy.position.x -= enemy.speed * timeDelta;
          } else if (enemy.name === 'red-small') {
            enemy.position.x += enemy.speed * enemy.direction.x * timeDelta;
            enemy.position.y += enemy.speed * enemy.direction.y * timeDelta;
          } else if (enemy.name === 'green') {
            enemy.position.x -= enemy.speed * timeDelta;
          }

          // Check for collision with the game borders
          if (enemy.position.y < 0 || enemy.position.y > this.dataGameHeight - enemy.height) {
            enemy.direction.y *= -1;
            enemy.position.y = Math.max(0, Math.min(enemy.position.y, this.dataGameHeight - enemy.height));
          }
        });
        // this.gs.enemies.forEach((enemy) => {

        // });

        // Update enemy bullet position
        this.gs.enemyBullets.forEach((enemyBullet) => {
          enemyBullet.position.x += enemyBulletSpeed * timeDelta;
        });


        // Remove enemy bullets that are offscreen  
        this.gs.enemyBullets = this.gs.enemyBullets.filter((enemyBullet) => {
          return enemyBullet.position.x > 0;
        });


        // Check for collisions between player and enemies
        this.gs.enemies.forEach((enemy) => {
          if (this.checkCollision(this.gs.player, enemy)) {
            if (this.gs.lives >= 1) {
              this.gs.lives--;
              this.loadScreen('Level', this.gs.currentScreen.n);
            } else {
              this.loadScreen('Lose');
            }
          }
        });

        // Check for collisions between enemy bullets and player
        this.gs.enemyBullets.forEach((bullet) => {
          if (this.checkCollision(this.gs.player, bullet)) {
            if (this.gs.lives >= 1) {
              this.gs.lives--;
              this.loadScreen('Level', this.gs.currentScreen.n);
            } else {
              this.loadScreen('Lose');
            }
          }
        });

        // Win condition
        if (this.gs.displayTime < 0) {
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


    .game-background {
      position: relative;
      height: 100%;
      background-image: url('@/assets/images/hellfire_background_level_1.png');
      background-size: cover;
      background-position-x: -50px;
    }
    .game-window {
      position: relative;
      width: 800px;
      height: 100%;
      /* top: -336px; */
      background-color: transparent;
      .game-header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 24px;
        font-weight: bold;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        z-index: 1;
      }
      .score, .time-remaining, .lives {
        margin: 0 20px;
      }
      .player, .goal, .enemy {
        position: absolute;
        background-size: contain;
        background-repeat: no-repeat;
      }
      .player {
        background-image: url('@/assets/images/hellfire-player-default.png');
      }

      .goal {
        background-image: url('@/assets/images/heart.png');
      }

      .enemy-blue {
        background-image: url('@/assets/images/demon_blue_A.png');
      }

      .enemy-yellow {
        background-image: url('@/assets/images/demon_yellow_A.png');
      }

      .enemy-purple {
        background-image: url('@/assets/images/demon_purple_A.png');
      }

      .enemy-red {
        background-image: url('@/assets/images/demon_red_A.png');
      }

      .enemy-red-small {
        background-image: url('@/assets/images/demon_red_small_A.png');
      }

      .enemy-green {
        background-image: url('@/assets/images/demon_green_A.png');
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
    background-color: white;
  }

  .enemy-bullet {
    position: absolute;
    width: 200px;
    height: 100px;
    background-color: yellow;
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