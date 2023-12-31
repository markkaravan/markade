<template>
  <div class="game-wrapper" :class="{ 'game-window-paused': gs.isPaused }">
    <div class="opening-screen" v-if="gs.currentScreen.name === 'Opening'">
      <h1 class="video-game-title">Hellfire</h1>
      <h2 class="video-game-subtitle" v-if="gs.currentScreen.name === 'Opening'">{{ gs.openingSubtitle }}</h2>
    </div>
    <div class="level-screen" v-if="gs.currentScreen.name === 'Level'">
      <div class="game-background" :class="['game-background-' + gs.board]" :style="{ backgroundPositionX: gs.backgroundPositionX + 'px' }"></div>
      <div class="game-window" :style="{ top: '-' + dataGameHeight + 'px', width: dataGameWidth + 'px' }">
        <div class="game-header">
          <div class="score">Score: {{ gs.score }}</div>
          <div class="time-remaining">Time Remaining: {{ gs.displayTime }}</div>
          <div class="weapon">
            <div class="game-weapon-name">Weapon: {{ gs.player.weapon }}</div>
            <div class="game-weapon-duration-bar" v-if="gs.player.weaponAcquired">
              <div class="game-weapon-duration-bar-fill" :style="{ width: this.computeDurationPercent() + '%' }"></div>
            </div>
            <!-- Weapon: {{ gs.player.weapon }} -->
          </div>
          <div class="lives">Lives: {{ gs.lives }}</div>
        </div>
        <div class="player" :style="{ top: gs.player.position.y + 'px', left: gs.player.position.x + 'px', width: gs.player.width + 'px', height: gs.player.height + 'px' }"></div>
        <div class="bullet" v-for="bullet in gs.bullets" :key="bullet.id" :class="['bullet', 'bullet-' + bullet.name]" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px' }"></div>
        <div class="enemy" v-for="enemy in gs.enemies" :key="enemy.id" :class="['enemy', 'enemy-' + enemy.name]" :style="{ top: enemy.position.y + 'px', left: enemy.position.x + 'px', width: enemy.width + 'px', height: enemy.height + 'px' }"></div>
        <div class="enemy-bullet" v-for="bullet in gs.enemyBullets" :key="bullet.id" :class="['enemy-bullet']" :style="{ top: bullet.position.y + 'px', left: bullet.position.x + 'px', width: bullet.width + 'px', height: bullet.height + 'px'}"></div>
        <div class="item" v-for="item in gs.items" :key="item.id" :class="['item', 'item-' + item.name]" :style="{ top: item.position.y + 'px', left: item.position.x + 'px' }"></div>
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
import { Mixins } from '../mixins.js';

const gameWidthDefault = 800;
const gameHeightDefault = 333;

const playerWidth = 65;
const playerHeight = 90;

const bulletSpeed = 400;
const bulletWidth = 30;
const bulletHeight = 7;

const enemyWidth = 30;
const enemyHeight = 30;

const enemyBulletWidth = 30;
const enemyBulletHeight = 7;
const enemyBulletSpeed = -300;

const itemSpeed = -100;

const transitionScreenDelay = 1000;
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

const weapons = [
  { name: 'default', width: 30, height: 7, color: 'white' },
  { name: 'dual-blast', width: 50, height: 10, color: 'pink', duration: 3 },
  { name: 'missile', width: 50, height: 40, color: 'blue', duration: 3  },
]

const items = [
  { name: 'heart' },
  { name: 'dual-blast' },
  { name: 'missile' }
]

// Define the screens
const screens = [
  { name: 'Opening', n: null },
  {
    name: 'Level',
    board: 'city',
    n: 1,
    levelTime: 30,
    itemDropProbability: .2,
    items: ['heart', 'dual-blast', 'missile'],
    levelData: {
      backgroundImage: 'hellfire_background_city.png',
      enemyData: [
        {name: 'blue', spawnProbability: 0.2}, 
        {name: 'yellow', spawnProbability: 0.2}, 
        {name: 'purple', spawnProbability: 0.2},
      ],

    },
  },
  {
    name: 'Level',
    board: 'badlands',
    n: 2,
    levelTime: 30,
    itemDropProbability: .2,
    items: ['heart', 'dual-blast', 'missile'],
    levelData: {
      backgroundImage: 'hellfire_background_badlands.png',
      enemyData: [
        {name: 'blue', spawnProbability: 0.3},
        {name: 'green', spawnProbability: 0.3},
        {name: 'purple', spawnProbability: 0.3},
        {name: 'red', spawnProbability: 0.3}, 
      ],

    },
  },
  {
    name: 'Level',
    board: 'hell',
    n: 3,
    levelTime: 30,
    itemDropProbability: .2,
    items: ['heart', 'dual-blast', 'missile'],
    levelData: {
      backgroundImage: 'hellfire_background_hell.png',
      enemyData: [
        {name: 'blue', spawnProbability: 0.4},
        {name: 'red', spawnProbability: 0.4}, 
        {name: 'purple', spawnProbability: 0.4},
        {name: 'green', spawnProbability: 0.4}, 
      ],

    },
  },
  { name: 'Win', n: null },
  { name: 'Lose', n: null },
];
let defaultGameState = {
  currentScreen: screens.find((screen) => screen.name === 'Opening'),
  openingSubtitle: 'Push Spacebar to start.',
  player: null,
  backgroundColor: null,
  enemies: [],
  bullets: [],
  enemyBullets: [],
  items: [],
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
        weapon: 'default',
        weaponAcquired: null,
      }
    },

    loadScreen(name, n = null, lives = null) {
      /*****  Opening Screen *****/
      if (name === 'Opening') {
        this.gs = Mixins.copy(defaultGameState);
      } /*****  End Opening Screen *****/
      


      /*****  Level Screen *****/
      else if (name === 'Level') {
        this.gs.currentScreen = { name: 'Transition', n: n };
        const nextLevel = screens.find((screen) => screen.name === 'Level' && screen.n === n);
        this.gs.enemies = [];
        this.gs.enemyBullets = [];
        setTimeout(() => {
          this.gs.currentScreen = nextLevel;
          // Add game state properties from levelData to game state
          for (const [key, value] of Object.entries(this.gs.currentScreen.levelData)) {
            this.gs[key] = value;
          }

          // Set the lives
          if (lives) {
            this.gs.lives = lives;
          }

          // Set the board
          this.gs.board = this.gs.currentScreen.board;

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
          
          let weapon = weapons.find((weapon) => weapon.name === this.gs.player.weapon);
          if (weapon.name === 'default') {
            this.gs.bullets.push({
              id: this.generateRandomId(),
              position: { x: bulletX, y: bulletY },
              width: weapon.width,
              height: weapon.height,
              name: weapon.name
            });

          } else if (weapon.name === 'dual-blast') {
            this.gs.bullets.push({
              id: this.generateRandomId(),
              position: { x: bulletX, y: bulletY },
              width: weapon.width,
              height: weapon.height,
              name: weapon.name
            });
            this.gs.bullets.push({
              id: this.generateRandomId(),
              position: { x: bulletX, y: bulletY + 32 },
              width: weapon.width,
              height: weapon.height,
              name: weapon.name
            });

          } else if (weapon.name === 'missile') {
            this.gs.bullets.push({
              id: this.generateRandomId(),
              position: { x: bulletX, y: bulletY },
              width: weapon.width,
              height: weapon.height,
              name: weapon.name
            });
          } 
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

    loseALife() {
      if (this.gs.lives > 1) {
        this.loadScreen('Level', this.gs.currentScreen.n, this.gs.lives - 1);
      } else {
        this.loadScreen('Lose');
      }
    },  

    computeDurationPercent() {
      const weapon = weapons.find((weapon) => weapon.name === this.gs.player.weapon);
      return (100 - (new Date() - this.gs.player.weaponAcquired) / (weapon.duration * 1000) * 100);
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

              // Enemy is stunned, it moves backwards slightly
              enemy.position.x += 30;

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

                // Drop items
                if (Math.random() < this.gs.currentScreen.itemDropProbability) {

                  this.gs.items.push({
                    id: this.generateRandomId(),
                    name: this.gs.currentScreen.items[Math.floor(Math.random() * this.gs.currentScreen.items.length)],
                    position: {
                      x: enemy.position.x + enemy.width / 2 - goalSize / 2,
                      y: enemy.position.y + enemy.height / 2 - goalSize / 2
                    },
                    height: 50,
                    width: 50,
                  });
                }  

                // Add points to the score
                this.gs.score += enemy.points;
                // Remove the enemy from the enemies array
                this.gs.enemies.splice(index, 1);
              }

              // Remove the bullet from the bullets array
              if (bullet.name !== 'missile') {
                this.gs.bullets.splice(this.gs.bullets.indexOf(bullet), 1);
              }
            }
          });
        });

        /*****  Move the enemies *****/
        this.gs.enemies.forEach((enemy) => {
          if (enemy.name === 'blue') {
            const angle = Math.atan2(this.gs.player.position.y - enemy.position.y, this.gs.player.position.x - enemy.position.x);
            const xVelocity = enemy.speed * Math.cos(angle);
            const yVelocity = enemy.speed * Math.sin(angle);
            enemy.position.x += xVelocity * timeDelta;
            enemy.position.y += yVelocity * timeDelta;
          } else if (enemy.name === 'yellow') {
            // Yellow enemy moves toward the player, straight, slowly at first, then accelerates
            const angle = Math.atan2(this.gs.player.position.y - enemy.position.y, this.gs.player.position.x - enemy.position.x);
            const xVelocity = enemy.speed * Math.cos(angle);
            const yVelocity = enemy.speed * Math.sin(angle);
            enemy.position.x += xVelocity * timeDelta;
            enemy.position.y += yVelocity * timeDelta;
            enemy.speed += 10 * timeDelta;
          } else if (enemy.name === 'purple') {
            enemy.position.x -= enemy.speed * timeDelta;
            // Fire a bullet once every two seconds
            enemy.lastBulletTime = enemy.lastBulletTime || 0;
            if (Date.now() - enemy.lastBulletTime > 2000) {
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

        // Update enemy bullet position
        this.gs.enemyBullets.forEach((enemyBullet) => {
          enemyBullet.position.x += enemyBulletSpeed * timeDelta;
        });


        // Remove enemy bullets that are offscreen  
        this.gs.enemyBullets = this.gs.enemyBullets.filter((enemyBullet) => {
          return enemyBullet.position.x > 0;
        });

        // Update item position so items move in sinusoidal pattern
        this.gs.items.forEach((item) => {
          item.position.x += itemSpeed * timeDelta;
          item.position.y = Math.sin(item.position.x / 50) * 50 + this.dataGameHeight / 2;
        });

        // Remove items that are offscreen
        this.gs.items = this.gs.items.filter((item) => {
          return item.position.x > 0;
        });

        // Remove enemies that are offscreen
        this.gs.enemies = this.gs.enemies.filter((enemy) => {
          return enemy.position.x > 0;
        });

        // Check for collisions between player and items
        this.gs.items.forEach((item, index) => {
          // console.log(item.position.x, this.gs.player.position.x);
          if (this.checkCollision(this.gs.player, item)) {
            this.gs.items.splice(index, 1);
            if (item.name === 'heart') {
              this.gs.lives++;
            } else if (item.name === 'dual-blast') {
              this.gs.player.weapon = 'dual-blast';
              this.gs.player.weaponAcquired = new Date();
            } else if (item.name === 'missile') {
              this.gs.player.weapon = 'missile';
              this.gs.player.weaponAcquired = new Date();
            }
          }
        });

        // Check for expiration of weapon
        if (this.gs.player.weaponAcquired) {
          const weapon = weapons.find((weapon) => weapon.name === this.gs.player.weapon);
          if (new Date() - this.gs.player.weaponAcquired > weapon.duration * 1000) {
            this.gs.player.weapon = 'default';
            this.gs.player.weaponAcquired = null;
          }
        }

        // Check for collisions between player and enemies
        this.gs.enemies.forEach((enemy) => {
          if (this.checkCollision(this.gs.player, enemy)) {
            this.loseALife();
          }
        });

        // Check for collisions between enemy bullets and player
        this.gs.enemyBullets.forEach((bullet) => {
          if (this.checkCollision(this.gs.player, bullet)) {
            this.loseALife();
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
      background-image: url('@/assets/images/hellfire_background_city.png');
      background-size: cover;
      background-position-x: -50px;
    }

    .game-background-city {
      background-image: url('@/assets/images/hellfire_background_city.png');
    }

    .game-background-badlands {
      background-image: url('@/assets/images/hellfire_background_badlands.png');
    }

    .game-background-hell {
      background-image: url('@/assets/images/hellfire_background_hell.png');
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
      .score, .time-remaining, .weapon, .lives {
        margin: 0 10px;
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
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 20%;
    box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.5);
    filter: blur(1px);
  }
  .bullet-default {
    background-color: white;
  }
  .bullet-dual-blast {
    background-color: pink;
  }
  .bullet-missile {
    background-color: blue;
  } 

  .enemy-bullet {
    position: absolute;
    background-color: rgba(255, 255, 0, 0.9);
    border-radius: 20%;
    box-shadow: 0 0 10px 5px rgba(255, 255, 0, 0.5);
    filter: blur(1px);
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

  .item {
    position: absolute;
    background-size: contain;
    background-repeat: no-repeat;
    border-radius: 10px;
    height: 40px;
    width: 40px;
  }
  .item-heart {
    background-image: url('@/assets/images/item_heart.png');
  }
  .item-dual-blast {
    background-image: url('@/assets/images/item_dual_laser.png');
  }
  .item-missile {
    background-image: url('@/assets/images/item_missile.png');
  }

  .game-weapon-duration-bar {
    position: relative;
    width: 100px;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
  }

  .game-weapon-duration-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    transition: width 0.1s linear;
  }

  .game-weapon-name {
    font-size: 24px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
}
</style>