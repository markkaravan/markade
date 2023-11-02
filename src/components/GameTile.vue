<template>
    <router-link to="about"></router-link>
    <router-link :to="{path: `/games/${pathName}`}">
      <div :class="'game-tile ' + pathName" @mouseover="isHovered = true" @mouseleave="isHovered = false">
        <div class="neon-border" :class="{ 'neon-border-hover': isHovered }"></div>
        <div class="overlay"></div>
        <h2 class="title">{{ title }}</h2>
      </div>
    </router-link>
 </template>
  
  <script>
  export default {
    name: 'HelloWorld',
    props: {
      title: {
        type: String,
        required: true
      },
      pathName: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        isHovered: false
      }
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
    <style>
  .game-tile {
    width: 250px;
    height: 250px;
    margin: 10px;
    background-size: cover;
    background-position: center;
    position: relative;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #fff;
    box-shadow: 0 0 10px #fff;
    transition: border-color 0.5s ease, box-shadow 0.5s ease;
  }

  .game-tile:hover {
    border-color: #0ff;
    box-shadow: 0 0 20px #0ff;
  }

  .neon-border {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 10px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .neon-border-hover {
    opacity: 1;
  }

  .game-tile:hover .neon-border {
    opacity: 1;
  }

  .neon-border:before,
  .neon-border:after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 10px;
    pointer-events: none;
    opacity: 0.5;
    box-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff, 0 0 70px #0ff, 0 0 80px #0ff, 0 0 100px #0ff, 0 0 150px #0ff;
    animation: neon-border 1.5s ease-out infinite alternate;
  }

  .neon-border:after {
    animation-delay: 0.5s;
  }

  @keyframes neon-border {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.5;
    }
  }

  .title {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px;
    font-size: 22px;
    color: white;
    height: 15%;
    text-align: center;
    margin: 0;
    padding-bottom: 10px;
  }

  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .game-tile.tictactoe {
    background-image: url('@/assets/images/thumbnail_tictactoe.png');
  }

  .game-tile.sudoku {
    background-image: url('@/assets/images/thumbnail_sudoku.png');
  }

  .game-tile.fruitflip {
    background-image: url('@/assets/images/thumbnail_fruitflip.png');
  }

  .game-tile.gravity {
    background-image: url('@/assets/images/thumbnail_gravity.png');
  }

  .game-tile.hellfire {
    background-image: url('@/assets/images/thumbnail_hellfire.png');
  }

  .game-tile.galaga {
    background-image: url('@/assets/images/thumbnail_galaga.jpg');
  }

  .game-tile.shooter {
    background-image: url('@/assets/images/thumbnail_shooter.jpg');
  }

  .game-tile.asteroids {
    background-image: url('@/assets/images/thumbnail_asteroids.jpg');
  }

  .game-tile.pong {
    background-image: url('@/assets/images/thumbnail_pong.jpg');
  }
</style>