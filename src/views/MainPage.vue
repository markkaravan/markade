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
  methods: {

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
        image: new URL('/src/assets/' + game.image, import.meta.url).href
      }
    });
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
  height: 100%;
  width: 100%;
}

h1 {
  font-size: 48px;
  margin-top: 0px;
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
