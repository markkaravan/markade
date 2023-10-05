<template>
  <router-link to="/">
    <h3>Back</h3>
  </router-link>

  <div class="game-window" ref="gameWindow">
    <div class="player-1" ref="player1"></div>
    <div class="player-2" ref="player2"></div>
    <div class="ball" ref="ball"></div>
    <div class="score-1">{{ score1 }}</div>
    <div class="score-2">{{ score2 }}</div>
    <div class="timer">{{ timer }}</div>
  </div>

  <div class="key-directions">
  <div>
    <p>Player 1:</p>
    <p>'q' is up</p>
    <p>'a' is down</p>
  </div>
  <div>
    <p>Player 2:</p>
    <p>'p' is up</p>
    <p>'l' is down</p>
  </div>
</div>

  <h2 v-if="winner" class="winner">{{ winner }} wins!</h2>
</template>

<script>
export default {
  name: 'GamePong',
  data() {
    return {
      score1: 0,
      score2: 0,
      timer: 10,
      winner: null
    }
  },
  mounted() {
    // Get references to the game window, player, ball, and timer elements
    const gameWindow = this.$refs.gameWindow
    const player1 = this.$refs.player1
    const player2 = this.$refs.player2
    const ball = this.$refs.ball
    // const timer = this.$refs.timer

    // Set the initial positions of the players and ball
    let player1Y = (gameWindow.offsetHeight - player1.offsetHeight) / 2
    player1.style.top = `${player1Y}px`

    let player2Y = (gameWindow.offsetHeight - player2.offsetHeight) / 2
    player2.style.top = `${player2Y}px`
    player2.style.left = `${gameWindow.offsetWidth - player2.offsetWidth}px`

    let ballX = (gameWindow.offsetWidth - ball.offsetWidth) / 2
    let ballY = (gameWindow.offsetHeight - ball.offsetHeight) / 2
    ball.style.top = `${ballY}px`
    ball.style.left = `${ballX}px`

    // Set the initial velocity of the ball
    let ballVX = 5
    let ballVY = 5

    // Start the timer
    const intervalId = setInterval(() => {
      this.timer--
      if (this.timer === 0) {
        clearInterval(intervalId)
        if (this.score1 > this.score2) {
          this.winner = 'Player 1'
        } else if (this.score2 > this.score1) {
          this.winner = 'Player 2'
        } else {
          this.winner = 'Tie game'
        }
      }
    }, 1000)

    // Add event listeners for the 'q', 'a', 'p', and 'l' keys
    document.addEventListener('keydown', (event) => {
      if (event.key === 'q') {
        // Move player 1 up
        player1Y -= 15
        if (player1Y < 0) {
          player1Y = 0
        }
        player1.style.top = `${player1Y}px`
      } else if (event.key === 'a') {
        // Move player 1 down
        player1Y += 15
        if (player1Y > gameWindow.offsetHeight - player1.offsetHeight) {
          player1Y = gameWindow.offsetHeight - player1.offsetHeight
        }
        player1.style.top = `${player1Y}px`
      } else if (event.key === 'p') {
        // Move player 2 up
        player2Y -= 15
        if (player2Y < 0) {
          player2Y = 0
        }
        player2.style.top = `${player2Y}px`
      } else if (event.key === 'l') {
        // Move player 2 down
        player2Y += 15
        if (player2Y > gameWindow.offsetHeight - player2.offsetHeight) {
          player2Y = gameWindow.offsetHeight - player2.offsetHeight
        }
        player2.style.top = `${player2Y}px`
      }
    })

    // Start the game loop
    setInterval(() => {
      // Move the ball
      ballX += ballVX
      ballY += ballVY
      ball.style.top = `${ballY}px`
      ball.style.left = `${ballX}px`

      // Check for collisions with the top and bottom of the game window
      if (ballY < 0 || ballY > gameWindow.offsetHeight - ball.offsetHeight) {
        ballVY = -ballVY
      }

      // Check for collisions with the players
      if (ballX < player1.offsetWidth && ballY >= player1Y && ballY <= player1Y + player1.offsetHeight) {
        ballVX = -ballVX
      } else if (ballX > gameWindow.offsetWidth - player2.offsetWidth - ball.offsetWidth && ballY >= player2Y && ballY <= player2Y + player2.offsetHeight) {
        ballVX = -ballVX
      }

      // Check for a goal
      if (ballX < 0) {
        ballX = (gameWindow.offsetWidth - ball.offsetWidth) / 2
        ballY = (gameWindow.offsetHeight - ball.offsetHeight) / 2
        ball.style.top = `${ballY}px`
        ball.style.left = `${ballX}px`
        ballVX = -ballVX
        this.score2++
      } else if (ballX > gameWindow.offsetWidth - ball.offsetWidth) {
        ballX = (gameWindow.offsetWidth - ball.offsetWidth) / 2
        ballY = (gameWindow.offsetHeight - ball.offsetHeight) / 2
        ball.style.top = `${ballY}px`
        ball.style.left = `${ballX}px`
        ballVX = -ballVX
        this.score1++
      }
    }, 20)
  }
}
</script>

<style>
.game-window {
  width: 600px;
  height: 400px;
  background-color: #333;
  position: relative;
  margin: 0 auto;
}

.player-1 {
  width: 10px;
  height: 50px;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
}

.player-2 {
  width: 10px;
  height: 50px;
  background-color: #fff;
  position: absolute;
  top: 0;
  right: 0;
}

.ball {
  width: 10px;
  height: 10px;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
}

.score-1 {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #fff;
  font-size: 24px;
}

.score-2 {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  font-size: 24px;
}

.timer {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 24px;
}

.winner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 48px;
}

.key-directions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  border: 2px solid #333;
  padding: 10px;
  background-color: #333;
  color: #fff;
}

.key-directions > div {
  margin-right: 20px;
}
</style>