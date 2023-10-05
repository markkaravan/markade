<template>
    <div class="game-level-quest">
      <router-link to="/">
        <h3>Back</h3>
      </router-link>
  
      <div class="game-window" ref="gameWindow">
        <!-- Your game code goes here -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameLevelQuest',
    mounted() {
      // Set the background image of the body to the specified image
      document.body.style.backgroundImage = 'url(' + require('@/assets/istockphoto-1174967858-1024x1024.jpg') + ')'
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundRepeat = 'no-repeat'
    }
  }
  </script>
  
  <style>
  .game-level-quest {
    text-align: center;
  }
  
  h3 {
    margin-top: 50px;
  }
  
  .game-window {
    margin: 50px auto;
    width: 800px;
    height: 600px;
    position: relative;
    overflow: hidden;
    border: 2px solid #fff;
    box-shadow: 0 0 10px #fff;
  }
  </style>