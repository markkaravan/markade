<template>
    <div class="game-level-quest">
      <component :is="gs.currentScreen.name" :gs="gs"></component>
    </div>
  </template>
  
  <script>
  const screens = [
    {
      name: 'Opening',
      title: 'Level Quest',
      subtitle: 'Push Spacebar to start.'
    },
    {
      name: 'Level',
      title: 'Level ',
      levelData: {
        backgroundColor: '#f5f5dc',
        goalPosition: { x: 750, y: 250 },
        enemies: 3
      }
    },
    {
      name: 'Transition',
      title: 'Level Complete!',
      subtitle: 'Get ready for the next level...',
      n: null
    },
    {
      name: 'Win',
      title: 'Congratulations!',
      subtitle: 'You have completed all levels.'
    },
    {
      name: 'Lose',
      title: 'Game Over',
      subtitle: 'You have been defeated.'
    }
  ];
  
  const gameWidth = 800;
  const gameHeight = 600;
  
  const defaultGameState = {
    currentScreen: screens.find(screen => screen.name === 'Opening'),
    openingSubtitle: 'Push Spacebar to start.',
    playerPosition: { x: 50, y: 250 },
    goalPosition: { x: (gameWidth - 50), y: 250 },
    enemyIntervalId: null,
    backgroundColor: null,
    enemies: [],
    bullets: []
  };
  
  export default {
    name: 'GameLevelQuest',
    data() {
      return {
        gs: this.copyObject(defaultGameState)
      };
    },
    mounted() {
      requestAnimationFrame(this.updateGameState);
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
            // Add game state properties from levelData to game state
            for (const [key, value] of Object.entries(this.gs.currentScreen.levelData)) {
              this.gs[key] = value;
            }
            // Add enemies to game state
            this.gs.enemies = [];
            for (let i = 1; i <= this.gs.currentScreen.levelData.enemies; i++) {
              const enemyX = Math.floor(Math.random() * (gameWidth/2 - 50) + gameWidth/2);
              const enemyY = Math.floor(Math.random() * (gameHeight - 50));
              this.gs.enemies.push({
                id: i,
                position: { x: enemyX, y: enemyY },
                direction: { x: 1, y: 0 }
              });
            }
            // Start the enemy movement interval
            this.gs.enemyIntervalId = setInterval(this.updateEnemyMovement, 1000);
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
      updateGameState() {
        if (this.gs.currentScreen.name === 'Level') {
          // Move the bullets
          for (let i = 0; i < this.gs.bullets.length; i++) {
            const bullet = this.gs.bullets[i];
            bullet.position.x += 20;
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
          // Move the enemies
          for (let i = 0; i < this.gs.enemies.length; i++) {
            const enemyHeight = 50
            const maxX = gameWidth - enemyHeight
            const maxY = gameHeight - enemyHeight
            const minX = 0
            const minY = 0
            let enemy = this.gs.enemies[i];
            const newX = enemy.position.x + (enemy.direction.x * enemyHeight)
            const newY = enemy.position.y + (enemy.direction.y * enemyHeight)
            if (newX > maxX || newX < minX) {
              enemy.direction.x *= -1
            }
            if (newY > maxY || newY < minY) {
              enemy.direction.y *= -1
            }
            enemy.position.x = newX;
            enemy.position.y = newY;
            // Check for collision with player
            if (this.checkCollision(this.gs.playerPosition, enemy.position)) {
              this.loadScreen('Lose'); 
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
      handleKeyDown(event) {
        if (this.gs.currentScreen.name === 'Level') {
          if (event.key === 'ArrowUp') {
            this.gs.playerPosition.y -= 10;
          }
          else if (event.key === 'ArrowLeft') {
            this.gs.playerPosition.x -= 10;
          }
          else if (event.key === 'ArrowDown') {
            this.gs.playerPosition.y += 10;
          }
          else if (event.key === 'ArrowRight') {
            this.gs.playerPosition.x += 10;
          }
          else if (event.key === ' ') {
            this.gs.bullets.push({
              id: this.gs.bullets.length + 1,
              position: { x: this.gs.playerPosition.x + 50, y: this.gs.playerPosition.y + 25 }
            });
          }
          // Check for collision with goal
          if (this.checkCollision(this.gs.playerPosition, this.gs.goalPosition)) {
            const nextLevel = this.gs.currentScreen.n + 1;
            if (nextLevel > this.getMaxLevel()) {
              this.loadScreen('Win');
            } else {
              this.loadScreen('Level', nextLevel);
            }
          }
        }
      },
      updateEnemyMovement() {
        for (let i = 0; i < this.gs.enemies.length; i++) {
          const enemyHeight = 50
          const maxX = gameWidth - enemyHeight
          const maxY = gameHeight - enemyHeight
          const minX = 0
          const minY = 0
          let enemy = this.gs.enemies[i];
          const newX = enemy.position.x + (enemy.direction.x * enemyHeight)
          const newY = enemy.position.y + (enemy.direction.y * enemyHeight)
          if (newX > maxX || newX < minX) {
            enemy.direction.x *= -1
          }
          if (newY > maxY || newY < minY) {
            enemy.direction.y *= -1
          }
          enemy.position.x = newX;
          enemy.position.y = newY;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .game-level-quest {
    display: flex;
  }
  </style>