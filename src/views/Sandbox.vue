<template>
  <div class="level-screen">
    <div class="game-window">
      <div class="player" :style="{ top: gs.player.position.y + 'px', left: gs.player.position.x + 'px', backgroundImage: 'url(' + require('@/assets/player.png') + ')', width: gs.player.width + 'px', height: gs.player.height + 'px', backgroundColor: '#fff' }"></div>
      <div class="goal" :style="{ left: gs.goalPosition.x + 'px', top: gs.goalPosition.y + 'px' }"></div>
      <div v-for="(enemy, index) in gs.enemies" :key="index" class="enemy" :style="{ left: enemy.position.x + 'px', top: enemy.position.y + 'px' }"></div>
      <div v-for="(bullet, index) in gs.bullets" :key="index" class="bullet" :style="{ left: bullet.position.x + 'px', top: bullet.position.y + 'px' }"></div>
    </div>
  </div>
</template>

<script>
const gameWidth = 800;
const gameHeight = 600;
const initialPlayerPosition = { x: gameWidth / 2, y: gameHeight - 50 };

const screens = [
  { name: 'Opening', n: null },
  {
    name: 'Level',
    n: 1,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: gameHeight - 50 },
      backgroundColor: 'rgb(0, 0, 139)', // dark blue
      enemies: 3,
    },
  },
  {
    name: 'Level',
    n: 2,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: gameHeight - 50 },
      enemyPosition: { x: 550, y: 50 },
      backgroundColor: 'rgb(255, 165, 0)', // orange
      enemies: 4,
    },
  },
  {
    name: 'Level',
    n: 3,
    levelData: {
      goalPosition: { x: gameWidth - 50, y: gameHeight - 50 },
      enemyPosition: { x: 550, y: 50 },
      backgroundColor: 'rgb(255, 0, 0)', // red
      enemies: 5,
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
  backgroundColor: null,
  enemies: [],
  bullets: [],
};

export default {
  name: 'GameGalaga',

  data() {
    return {
      gs: {...defaultGameState }, // gs stands for game state
      lastTimestamp: null,
    };
  },

  methods: {
    startGame() {
      this.gs.currentScreen = screens.find((screen) => screen.name === 'Level' && screen.n === 1);
      this.gs.backgroundColor = this.gs.currentScreen.levelData.backgroundColor;
      this.gs.goalPosition = this.gs.currentScreen.levelData.goalPosition;
      this.gs.enemies = this.generateEnemies(this.gs.currentScreen.levelData.enemies, this.gs.currentScreen.levelData.enemyPosition);
      this.lastTimestamp = null;
      this.$refs.player.focus();
    },

    generateEnemies(numEnemies, enemyPosition) {
      const enemies = [];
      for (let i = 0; i < numEnemies; i++) {
        enemies.push({
          position: { x: enemyPosition.x + i * 100, y: enemyPosition.y },
          direction: 'right',
        });
      }
      return enemies;
    },

    updateGameState(timestamp) {
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
      }
      const timeDelta = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // Update player position
      const playerSpeed = 0.2;
      if (this.gs.player.moveLeft) {
        this.gs.player.position.x -= playerSpeed * timeDelta;
      }
      if (this.gs.player.moveRight) {
        this.gs.player.position.x += playerSpeed * timeDelta;
      }
      if (this.gs.player.moveUp) {
        this.gs.player.position.y -= playerSpeed * timeDelta;
      }
      if (this.gs.player.moveDown) {
        this.gs.player.position.y += playerSpeed * timeDelta;
      }

      // Update enemy position
      const enemySpeed = 0.1;
      this.gs.enemies.forEach((enemy) => {
        if (enemy.direction === 'right') {
          enemy.position.x += enemySpeed * timeDelta;
          if (enemy.position.x > gameWidth - 50) {
            enemy.direction = 'left';
            enemy.position.y += 50;
          }
        } else {
          enemy.position.x -= enemySpeed * timeDelta;
          if (enemy.position.x < 0) {
            enemy.direction = 'right';
            enemy.position.y += 50;
          }
        }
      });

      // Update bullet position
      const bulletSpeed = 0.5;
      this.gs.bullets.forEach((bullet) => {
        if (bullet.direction === 'up') {
          bullet.position.y -= bulletSpeed * timeDelta;
        } else {
          bullet.position.y += bulletSpeed * timeDelta;
        }
      });

      // Remove bullets that are offscreen
      this.gs.bullets = this.gs.bullets.filter((bullet) => {
        if (bullet.direction === 'up') {
          return bullet.position.y > 0;
        } else {
          return bullet.position.y < gameHeight;
        }
      });

      // Check for collisions between bullets and enemies
      this.gs.bullets.forEach((bullet) => {
        this.gs.enemies.forEach((enemy, index) => {
          if (this.checkCollision(bullet, enemy)) {
            this.gs.bullets.splice(this.gs.bullets.indexOf(bullet), 1);
            this.gs.enemies.splice(index, 1);
          }
        });
      });

      // Check for collisions between player and enemies
      this.gs.enemies.forEach((enemy) => {
        if (this.checkCollision(this.gs.player, enemy)) {
          this.gs.currentScreen = screens.find((screen) => screen.name === 'Lose');
        }
      });

      // Check for win condition
      if (this.gs.enemies.length === 0) {
        const currentLevelIndex = screens.findIndex((screen) => screen.name === 'Level' && screen.n === this.gs.currentScreen.n);
        if (currentLevelIndex === screens.length - 3) {
          this.gs.currentScreen = screens.find((screen) => screen.name === 'Win');
        } else {
          this.gs.currentScreen = screens[currentLevelIndex + 1];
          this.gs.backgroundColor = this.gs.currentScreen.levelData.backgroundColor;
          this.gs.goalPosition = this.gs.currentScreen.levelData.goalPosition;
          this.gs.enemies = this.generateEnemies(this.gs.currentScreen.levelData.enemies, this.gs.currentScreen.levelData.enemyPosition);
        }
      }
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

    handleKeyDown(event) {
      if (event.code === 'ArrowLeft') {
        this.gs.player.moveLeft = true;
      }
      if (event.code === 'ArrowRight') {
        this.gs.player.moveRight = true;
      }
      if (event.code === 'ArrowUp') {
        this.gs.player.moveUp = true;
      }
      if (event.code === 'ArrowDown') {
        this.gs.player.moveDown = true;
      }
      if (event.code === 'Space') {
        this.gs.bullets.push({
          position: { x: this.gs.player.position.x + this.gs.player.width / 2, y: this.gs.player.position.y },
          direction: 'up',
        });
      }
    },

    handleKeyUp(event) {
      if (event.code === 'ArrowLeft') {
        this.gs.player.moveLeft = false;
      }
      if (event.code === 'ArrowRight') {
        this.gs.player.moveRight = false;
      }
      if (event.code === 'ArrowUp') {
        this.gs.player.moveUp = false;
      }
      if (event.code === 'ArrowDown') {
        this.gs.player.moveDown = false;
      }
    },
  },

  mounted() {
    this.$refs.player.focus();
    window.requestAnimationFrame(this.updateGameState);
  },
};
</script>

<style scoped>
/* Styles for the game window */
.game-window {
  position: relative;
  width: 100%;
  height: 100%;
}

.player {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
}

.goal {
  position: absolute;
  background-color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.enemy {
  position: absolute;
  background-color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.bullet {
  position: absolute;
  background-color: #fff;
  width: 5px;
  height: 10px;
}
</style>