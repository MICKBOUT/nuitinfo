class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  preload() {
    this.load.image('player_idle', 'assets/player1.png');
    this.load.image('player_run',  'assets/player2.png');
    this.load.image('player_jump', 'assets/player3.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('bossFriendly', 'assets/boss1.png');
    this.load.image('bossAngry',    'assets/boss2.png');
    this.load.image('bgLevel1', 'assets/bg_level1.png');
    this.load.image('floorTile', 'assets/floorTile.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const LEVEL_WIDTH   = W * 5;
    const GROUND_HEIGHT = 70;

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, H + 400);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, H);

    const bg = this.add.image(W / 2, H / 2, 'bgLevel1');
    bg.setScrollFactor(0);
    const scaleX = W / bg.width;
    const scaleY = H / bg.height;
    const scale  = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    this.platforms = this.physics.add.staticGroup();

    const makeGround = (startX, endX) => {
      const width   = endX - startX;
      const centerX = startX + width / 2;

      const floor = this.add.image(centerX, H, 'floorTile')
        .setOrigin(0.5, 1);
      floor.displayWidth  = width;
      floor.displayHeight = GROUND_HEIGHT;

      const collider = this.add.rectangle(
        centerX,
        H - GROUND_HEIGHT / 2,
        width,
        GROUND_HEIGHT
      );
      this.physics.add.existing(collider, true);
      this.platforms.add(collider);
    };

    const graphics = this.add.graphics();
    graphics.fillStyle(0xf4a623, 1);

    const makePlatform = (x, y, width, height) => {
      graphics.fillRect(x - width / 2, y - height / 2, width, height);
      const rect = this.add.rectangle(x, y, width, height);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    };

    makeGround(0,         W * 1.4);
    makeGround(W * 1.6,   W * 2.6);
    makeGround(W * 2.9,   W * 3.9);
    makeGround(W * 4.2,   LEVEL_WIDTH);

    makePlatform(W * 0.6, H - GROUND_HEIGHT - 60,  150, 25);
    makePlatform(W * 1.0, H - GROUND_HEIGHT - 110, 150, 25);

    makePlatform(W * 1.8, H - GROUND_HEIGHT - 80,  150, 25);
    makePlatform(W * 2.5, H - GROUND_HEIGHT - 120, 150, 25);
    makePlatform(W * 2.9, H - GROUND_HEIGHT - 80,  150, 25);

    makePlatform(W * 3.1, H - GROUND_HEIGHT - 70, 200, 25);
    makePlatform(W * 3.4, H - GROUND_HEIGHT - 130,200, 25);
    makePlatform(W * 3.6, H - GROUND_HEIGHT - 70, 200, 25);

    makePlatform(W * 4.5, H - GROUND_HEIGHT - 120,130, 25);

    this.player = this.physics.add.sprite(80, H - GROUND_HEIGHT - 120, 'player_idle');
    this.player.setScale(0.5);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(3000);
    this.player.setMaxVelocity(800, 2000);
    this.physics.add.collider(this.player, this.platforms);
    this.player.body.setFriction(2, 0);
    this.enemies = this.physics.add.group();
    this.spawnEnemy(W * 0.8, H - GROUND_HEIGHT - 80,  W * 0.6, W * 1.0);
    this.spawnEnemy(W * 1.9, H - GROUND_HEIGHT - 80,  W * 1.7, W * 2.3);
    this.spawnEnemy(W * 3.2, H - GROUND_HEIGHT - 80,  W * 3.0, W * 3.6);
    this.spawnEnemy(W * 4.0, H - GROUND_HEIGHT - 80,  W * 3.8, W * 4.2);
    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision,
      null,
      this
    );

    this.bossIntroShown = false;
    this.bossDefeated   = false;

    this.boss = this.physics.add.sprite(
      LEVEL_WIDTH - 200,
      H - GROUND_HEIGHT - 80,
      'bossFriendly'
    );
    this.boss.setScale(1.5);
    this.boss.setImmovable(true);
    this.boss.body.setAllowGravity(false);
    this.boss.setCollideWorldBounds(false);
    this.boss.setDepth(10);
    this.physics.add.collider(this.boss, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.boss,
      this.handleBossOverlap,
      null,
      this
    );

    this.dialogVisible = false;
    this.victoryActive = false;

    const panelWidth  = W * 0.6;
    const panelHeight = 140;
    const panelX      = W / 2;
    const panelY      = H * 0.25;

    this.dialogBg = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      0x000000,
      0.8
    )
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0)
      .setDepth(10)
      .setVisible(false);

    this.dialogText = this.add.text(
      panelX - panelWidth / 2 + 20,
      panelY - panelHeight / 2 + 20,
      '',
      {
        fontSize: '18px',
        fill: '#ffffff',
        wordWrap: { width: panelWidth - 40 }
      }
    )
      .setScrollFactor(0)
      .setDepth(11)
      .setVisible(false);

    this.dialogHint = this.add.text(
      panelX,
      panelY + panelHeight / 2 - 15,
      'Appuie sur ESPACE pour continuer',
      {
        fontSize: '14px',
        fill: '#cccccc'
      }
    )
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(11)
      .setVisible(false);

    this.victoryButtonBg = this.add.rectangle(
      panelX,
      panelY + panelHeight / 2 + 40,
      260,
      40,
      0xbfa73b,
      1
    )
      .setScrollFactor(0)
      .setDepth(12)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.victoryButtonText = this.add.text(
      panelX,
      panelY + panelHeight / 2 + 40,
      'Retour au village',
      {
        fontSize: '16px',
        fill: '#0b1115'
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(13)
      .setVisible(false);

    this.victoryButtonBg.on('pointerup', () => {
      this.scene.start('StartScene');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.dialogVisible && !this.victoryActive) {
        this.hideDialog();
      }
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();

    // UI
    this.helpText = this.add.text(16, 16,
      '← → pour bouger | ↑ pour sauter',
      { fontSize: '18px', fill: '#ffffff' }
    );
    this.helpText.setScrollFactor(0);
  
  this.restartBg = this.add.rectangle(
    W - 80,          
    40,               
    120,               
    40,             
    0x000000,
    0.6
  )
    .setStrokeStyle(2, 0xffffff)
    .setScrollFactor(0)
    .setDepth(20)
    .setInteractive({ useHandCursor: true });

    this.restartText = this.add.text(
      W - 80,
      40,
      "Restart",
      {
        fontSize: "18px",
        fill: "#ffffff"
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(21)
    .setInteractive({ useHandCursor: true });

    this.restartBg.on("pointerup", () => {
      this.scene.restart();
    });

    this.restartText.on("pointerup", () => {
      this.scene.restart();
    });
  }

  update() {
    if (!this.cursors) return;

    const accel    = 1200;
    const maxSpeed = 600;
    const H        = this.scale.height;

    const cameraRight = this.cameras.main.worldView.right;
    if (!this.bossIntroShown && cameraRight >= this.boss.x - 50) {
      this.bossIntroShown = true;

      this.boss.setTexture("bossFriendly");

      this.showDialog(
        "Tu es enfin arrivé jusqu'à moi...\n" +
        "Je suis venu envahir le Village Numérique Résistant.\n" +
        "Je suis Windowz ! Approche si tu veux me défier !"
      );

      this.pendingBossRage = true;
    }

    if (this.dialogVisible) {
      this.player.setVelocityX(0);
      this.player.setAccelerationX(0);
      return;
    }

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-accel);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(accel);
      this.player.flipX = false;
    } else {
      this.player.setAccelerationX(0);
    }

    const vx = this.player.body.velocity.x;
    if (Math.abs(vx) > maxSpeed) {
      this.player.setVelocityX(Phaser.Math.Clamp(vx, -maxSpeed, maxSpeed));
    }
    if (Math.abs(vx) < 5) {
      this.player.setVelocityX(0);
    }

    const onGround =
      this.player.body.blocked.down || this.player.body.touching.down;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
      this.player.setVelocityY(-1500);
    }

    const moving  = Math.abs(this.player.body.velocity.x) > 10;
    const jumping = !onGround;

    if (jumping) {
      if (this.player.texture.key !== 'player_jump') {
        this.player.setTexture('player_jump');
      }
    } else if (moving) {
      if (this.player.texture.key !== 'player_run') {
        this.player.setTexture('player_run');
      }
    } else {
      if (this.player.texture.key !== 'player_idle') {
        this.player.setTexture('player_idle');
      }
    }

    if (this.player.y > H + 200 && !this.victoryActive) {
      this.scene.restart();
    }

    this.enemies.children.iterate(enemy => {
      if (!enemy || !enemy.body) return;

      if (enemy.x <= enemy.patrolLeft) {
        enemy.direction = 1;
      } else if (enemy.x >= enemy.patrolRight) {
        enemy.direction = -1;
      }

      enemy.setVelocityX(enemy.speed * enemy.direction);
      enemy.flipX = enemy.direction < 0;
    });
  }

  spawnEnemy(x, y, patrolLeft, patrolRight) {
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setScale(0.5);
    enemy.setCollideWorldBounds(false);
    enemy.body.setImmovable(false);

    enemy.patrolLeft  = patrolLeft;
    enemy.patrolRight = patrolRight;
    enemy.direction   = 1;
    enemy.speed       = 70;

    enemy.setVelocityX(enemy.speed * enemy.direction);
  }

  handlePlayerEnemyCollision() {
    this.scene.restart();
  }

  // ----- BOSS -----
  handleBossOverlap(player, boss) {
    if (this.dialogVisible) return;
    if (!this.bossIntroShown) return;
    if (this.bossDefeated) return;
    this.bossDefeated = true;
    this.showVictoryDialog();
  }

  showDialog(text) {
    this.dialogVisible = true;
    this.victoryActive = false;
    this.dialogBg.setVisible(true);
    this.dialogText.setText(text);
    this.dialogText.setVisible(true);
    this.dialogHint.setVisible(true);
    this.victoryButtonBg.setVisible(false);
    this.victoryButtonText.setVisible(false);
  }

  showVictoryDialog() {
    const victoryText =
      "Bravo ! Tu as vaincu Windowz et sauvé le Village Numérique Résistant.\n\n" +
      "Grâce à toi, le numérique est plus durable, plus libre et plus responsable.";
    this.dialogVisible = true;
    this.victoryActive = true;
    this.dialogBg.setVisible(true);
    this.dialogText.setText(victoryText);
    this.dialogText.setVisible(true);
    this.dialogHint.setVisible(false);
    this.victoryButtonBg.setVisible(true);
    this.victoryButtonText.setVisible(true);
  }

  hideDialog() {
    this.dialogVisible = false;
    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);
    this.dialogHint.setVisible(false);
    this.victoryButtonBg.setVisible(false);
    this.victoryButtonText.setVisible(false);
    if (this.pendingBossRage) {
      this.boss.setTexture("bossAngry");
      this.pendingBossRage = false;
    }

  }
}
