class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    this.load.image('bgLevel1', 'assets/bg_level1.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const bg = this.add.image(W / 2, H / 2, 'bgLevel1');
    bg.setScrollFactor(0);

    const scaleX = W / bg.width;
    const scaleY = H / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    const title = this.add.text(W / 2, H * 0.12,
      'Village Numérique Résistant',
      { fontSize: '40px', fontFamily: 'sans-serif', color: '#ffffff' }
    ).setOrigin(0.5);
    title.setScrollFactor(0);

    const subtitle = this.add.text(W / 2, H * 0.20,
      'Clique sur le PC pour commencer',
      { fontSize: '22px', fontFamily: 'sans-serif', color: '#ffffaa' }
    ).setOrigin(0.5);
    subtitle.setScrollFactor(0);

    const makeHotspot = (x, y, width, height, onClick) => {
      const zone = this.add.rectangle(x, y, width, height, 0x000000, 0);
      zone.setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
      });

      zone.on('pointerout', () => {
        this.input.setDefaultCursor('default');
      });

      zone.on('pointerdown', onClick);
      return zone;
    };

    const pcX = W * 0.52;
    const pcY = H * 0.60;
    const pcWidth = W * 0.18;
    const pcHeight = H * 0.22;

    makeHotspot(pcX, pcY, pcWidth, pcHeight, () => {
      this.scene.start('Level1Scene');
    });

    const doorX = W * 0.90;
    const doorY = H * 0.55;
    const doorWidth = W * 0.10;
    const doorHeight = H * 0.55;

    makeHotspot(doorX, doorY, doorWidth, doorHeight, () => {
      // Pour l’instant simple message
      this.showToast("La porte mènera vers le village dans une prochaine version !");
    });

    this.toast = this.add.text(W / 2, H * 0.88, '', {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5);
    this.toast.setScrollFactor(0);
    this.toast.setVisible(false);
    this.toastTimer = null;
  }

  showToast(message) {
    this.toast.setText(message);
    this.toast.setVisible(true);

    if (this.toastTimer) {
      this.time.removeEvent(this.toastTimer);
    }

    this.toastTimer = this.time.addEvent({
      delay: 2500,
      callback: () => {
        this.toast.setVisible(false);
      }
    });
  }
}
