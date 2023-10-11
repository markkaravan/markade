<template>
  <div class="game-page-template">
    <div class="header">
      <div class="back-link" @click="goBack">Back</div>
      <h1>{{ title }}</h1>
    </div>
    <div class="body">
      <div class="game-window">
        <div class="game-window-border">
          <!-- <slot name="game"></slot> -->
          <component :is="gameComponent"></component>
        </div>
      </div>
      <div class="instructions-description-container">
        <div class="instructions-window">
          <h2 class="window-title">Instructions</h2>
          <p class="window-text">{{ instructions }}</p>
          <!-- <h2>Instructions</h2>
          <p>{{ instructions }}</p> -->
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

export default {
  name: 'GamePageTemplate',
  components: {
    GameLevelQuest,
    GameGalaga
  },
  computed: {
    gameComponent() {
      const route = this.$route.path
      if (route === '/games/level-quest') {
        return 'GameLevelQuest'
      } else if (route === '/games/galaga') {
        return 'GameGalaga'
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
      description: ''
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    }
  },
  mounted() {
    console.log("this.$route.name", this.$route.name);
    console.log("Games", games);
    const gamePath = this.$route.name
    const game = games.find(g => g.pathName === gamePath)
    console.log("The Game: ", game);
    if (game) {
      this.title = game.title
      this.instructions = game.instructions
      this.description = game.description
    }
    console.log(gamePath)
  }
}
</script>

<style>
.game-page-template {
  height: 100vh;
  width: 100vw;
  background-image: url('@/assets/istockphoto-1174967858-1024x1024.jpg');
  background-size: cover;
  display: flex;
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

.back-link {
  cursor: pointer;
}

.body {
  height: 75%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.game-window {
  width: 800px;
  height: 1000px;
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
  width: 800px;
  height: 700px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
}

.instructions-window, .description-window {
  width: 53%;
  height: 100%;
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
  /* box-shadow: 0 0 20px; */
  /* box-shadow: 0 0 20px #ff00ff; */
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
  font-family: 'Digital-7';
  font-size: 2rem;

}

.instructions-window .window-text, .description-window .window-text {
  font-family: 'Digital-7';
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
}

.description-window {
  border-color: #00ff00;
  box-shadow-color: #00ff00;
}
</style>