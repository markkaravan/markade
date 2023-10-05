<template>
  <div class="home">
    <h1>Welcome to the MARKcade</h1>
      <GameTile v-for="(game, index) in gameShim" :image="game.image" :key="index" :title="game.title" :pathName="game.pathName"></GameTile>
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
  methods: {

  },
  created: function () {
    console.log("Created: ", GameJson.map(game => game.image ));
    console.log("Games: ", this.games);
    this.gameShim = GameJson.map(game => { 
      return {
        title: game.title,
        pathName: game.pathName,
        image: new URL('/src/assets/' + game.image, import.meta.url).href
      }
    });
    console.log("Shim: ", this.gameShim)
    console.log("Games: ", this.games)
  },
  mounted: function () {

  }
}
</script>

<style>
.home {
  text-align: center;
  background-color: black;
  background-image: url('@/assets/istockphoto-1174967858-1024x1024.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: black;
}

h1 {
  font-size: 48px;
  margin-top: 50px;
  font-family: 'Bebas Neue', cursive;
  color: white;
}

.thumbnails {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 50px;
}

@media (max-width: 900px) {
  .thumbnails {
    flex-direction: column;
  }
}
</style>
