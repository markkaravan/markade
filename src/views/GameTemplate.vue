<template>
  <div class="game-page-template">
    <div class="header">
      <div class="back-link" @click="goBack">Back</div>
      <h1>{{ title }}</h1>
    </div>
    <div class="body">
      <div class="game-window" :style="{ width: gameWidth + 'px', height: gameHeight + 'px' }">
        <div class="game-window-border">
          <!-- <slot name="game"></slot> -->
          <component :is="gameComponent" :gameWidth="gameWidth" :gameHeight="gameHeight"></component>
        </div>
      </div>
      <div class="instructions-description-container">
        <div class="instructions-window">
          <h2 class="window-title">Controls</h2>
          <!-- <p class="window-text">{{ instructions }}</p> -->
          <ul>
            <li v-for="instruction in instructions" :key="instruction">{{ instruction }}</li>
          </ul>
        </div>
        <div class="description-window">
          <h2 class="window-title">Description</h2>
          <p class="window-text">{{ description }}</p>
          <!-- <h2>Description</h2>
          <p>{{ description }}</p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import games from '@/assets/games.json'
import GameLevelQuest from '@/components/GameLevelQuest.vue'
import GameGalaga from '@/components/GameGalaga.vue'
import GameHellfire from '@/components/GameHellfire.vue'
import GameGravity from '@/components/GameGravity.vue'
import GameFruitFlip from '@/components/GameFruitFlip.vue'
import GameSudoku from '@/components/GameSudoku.vue'
import GameTicTacToe from '@/components/GameTicTacToe.vue'
import GameSandBox from '@/components/GameSandbox.vue'

const gameWidthDefault = 800;
const gameHeightDefault = 333;

export default {
  name: 'GamePageTemplate',
  components: {
    GameLevelQuest,
    GameGalaga,
    GameHellfire,
    GameGravity,
    GameFruitFlip,
    GameSudoku,
    GameTicTacToe,
  },
  computed: {
    gameComponent() {
      const route = this.$route.path
      if (route === '/games/level-quest') {
        return 'GameLevelQuest'
      } else if (route === '/games/galaga') {
        return 'GameGalaga'
      } else if (route === '/games/hellfire') {
        return 'GameHellfire'
      } else if (route === '/games/gravity') {
        return 'GameGravity'
      } else if (route === '/games/fruitflip') {
        return 'GameFruitFlip'
      } else if (route === '/games/sudoku') {
        return 'GameSudoku'
      } else if (route === '/games/tictactoe') {
        return 'GameTicTacToe'
      } else if (route === '/games/sandbox') {
        return 'GameSandBox'
      } else {
        // Default to GameLevelQuest if the route is not recognized
        return 'GameLevelQuest'
      }
    }
  },
  data() {
    return {
      title: '',
      instructions: '',
      description: '',
      gameWidth: 0,
      gameHeight: 0,
    }
  },

  mounted() {
    const gamePath = this.$route.name
    const game = games.find(g => g.pathName === gamePath)
    if (game) {
      console.log("Gmae found: ", game);      
      this.title = game.title
      this.instructions = game.instructions
      this.description = game.description
      this.gameWidth = game.gameWidth? game.gameWidth : gameWidthDefault
      this.gameHeight = game.gameHeight? game.gameHeight : gameHeightDefault
    }
    window.addEventListener('keydown', this.onKeyDown);
  },

  methods: {
    onKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault();
      }
    },

    goBack() {
      this.$router.push('/')
    },
  },
}
</script>

<style>
.game-page-template {
  width: 100%;
  height: 150%;
    /* height: 100vh; */
  background-image: url('@/assets/images/cyberpunk_brick_wall_002.png');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  /* display: flex; */
  flex-direction: column;
}

.header {
  height: 10%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  color: white;
  text-align: center;
}
/* Make .back-link look like a button */
.header .back-link {
  font-family: 'Orbitron', arial;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #333333;
  background-image: linear-gradient(to bottom, #333333, #444444);
  border: 2px solid #00ffff;
  box-shadow: 0 0 20px #00ffff;
  transition: all 0.2s ease-in-out;
  position: absolute;
}
/* .back-link glows when you hover over it and changes color when you click it*/
.header .back-link:hover {
  background-color: #444444;
  background-image: linear-gradient(to bottom, #444444, #555555);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px #00ff00;
}
.header .back-link:active {
  background-color: #555555;
  background-image: linear-gradient(to bottom, #555555, #666666);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px #00ff00;
}

.header h1 {
    font-size: 48px;
    margin: auto;
    margin-top: 20px;
    font-family: 'Orbitron', arial;
    /* color: rgb(200, 177, 208); */
    color: white;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1); /* Add this line */


    border-radius: 0.5rem;
    background-color: #333333;
    background-image: linear-gradient(to bottom, #333333, #444444);
    border: 2px solid #ffffff;
    /* box-shadow: 0 0 20px #00ffff; */
    padding: 10px;
  }



.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.game-window {
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.game-window-border {
  width: 100%;
  height: 100%;
  border: 10px solid #ff00ff;
  border-radius: 20px;
  box-shadow: 0 0 20px #ff00ff;
}

.instructions-description-container {
  width: 70%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
}

.instructions-window, .description-window {
  font-family: 'Orbitron', arial;
  /* width: 53%; */
  width: 90%;
  min-height: 300px;
  background-color: #333333;
  background-image: linear-gradient(to bottom, #333333, #444444);
  background-color: white;
  margin: 0 10px;
  padding: 0rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 10px solid;
  border-radius: 20px;
  text-align: left;
  padding-left: 10px;
}

.instructions-window {
  box-shadow: 0 0 20px #00ffff;
}

.description-window {
  box-shadow: 0 0 20px #00ff00;
}

.instructions-window h2, .description-window h2 {
  margin: 0rem;
  margin-bottom: 1rem;
  padding: 0rem;
  font-size: 2rem;

}

.instructions-window .window-text, .description-window .window-text {
  font-size: 1.5rem;
  color: #00ff00;
}

.instructions-window h2, .instructions-window .window-text {
  color: #00ffff;
}

.description-window h2, .description-window .window-text {
  color: #00ff00;
}

.instructions-window {
  border-color: #00ffff;
  box-shadow-color: #00ffff;
  color: #00ffff;
  text-align: left;
}

.description-window {
  border-color: #00ff00;
  box-shadow-color: #00ff00;
}
</style>