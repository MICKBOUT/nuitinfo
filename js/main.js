const HEADER_HEIGHT = 70;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight - HEADER_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 3000 },
    }
  },
  scene: [StartScene, Level1Scene]
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight - HEADER_HEIGHT);
});
