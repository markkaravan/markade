<template>
  <div class="home">
    <h1>Welcome to the MARKcade</h1>
    <div class="thumbnails">
      <GameTile v-for="(game, index) in gameShim" :image="game.image" :key="index" :title="game.title" :pathName="game.pathName"></GameTile>
    </div>
  </div>
</template>

<script>
import GameJson from '@/assets/games.json'
import GameTile from '@/components/GameTile.vue'

export default {
  name: 'MainPage',
  components: {
    GameTile
  },

  data() {
    return {
      gameShim: [],
      games: [

      ]

    }
  },

  created: function () {
    this.gameShim = GameJson
    // sort by date created, descending order
    .sort((a, b) => {
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    })
    .map(game => { 
      return {
        title: game.title,
        pathName: game.pathName,
        // image: new URL('/src/assets/' + game.image, import.meta.url).href
        // image: '/src/assets/' + game.image,
        // image: `url(${require('@/assets/images/thumbnail_tictactoe.png')})`,
      }
    });
  },

  mounted: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  methods: {
    onKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault();
      }
    },
  },

}
</script>

<style>
.home {
  text-align: center;
  background-color: black;
  background-image: url('@/assets/images/cyberpunk_brick_wall_002.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: black;
  height: 120%;
  width: 100%;
}

h1 {
  font-size: 48px;
  margin-top: 0px;
  font-family: 'Orbitron', arial;
  color: white;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1); /* Add this line */

  /* font-weight: bold; */
}

.thumbnails {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: auto;
  margin-top: 50px;
  width: 90%;
}

@media (max-width: 900px) {
  .thumbnails {
    flex-direction: column;
  }
}
</style>
