
SlimesGame.Preloader = function (game) {
    this.asset = null;
    this.ready = false;
};

SlimesGame.Preloader.prototype = {

    preload: function () {

        this.asset = this.game.add.sprite(this.world.centerX, this.world.centerY, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);

        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.asset);

        // spritesheets
        this.load.spritesheet('dwarf', 'assets/images/player.png', 50, 70);
        this.load.spritesheet('lava', 'assets/images/lava.png', 150, 30);
        this.load.spritesheet('medSlime', 'assets/images/enemies-small.png', 30, 30);
        this.load.spritesheet('largeSlime', 'assets/images/enemies-large.png', 80, 80);
        this.load.spritesheet('spritesheet_itemsMedium', 'assets/images/items-medium.png', 50, 50);
        this.load.spritesheet('spritesheet_itemsLarge', 'assets/images/items-large.png', 100, 100);

        // tilemaps
        this.load.tilemap('map', 'levels/dungeon.json', null, Phaser.Tilemap.TILED_JSON);

        // images
        this.load.image('title', 'assets/images/title.png?v=0.2.2');
        this.load.image('tiles-bg', 'assets/images/backgrounds60x60.png');
        this.load.image('tiles-world', 'assets/images/world30x30.png');

        // sounds
        this.load.audio('titleMusic', ['assets/music/levelMusic1.mp3']);
        this.load.audio('gameMusic1', ['assets/music/levelMusic2.mp3']);
        this.load.audio('zap', ['assets/sound/zap.mp3']);
        this.load.audio('swoosh', ['assets/sound/swoosh1.mp3', 'assets/sound/swoosh1.ogg']);
        this.load.audio('splat', ['assets/sound/splat.mp3', 'assets/sound/splat.ogg']);
        this.load.audio('punch', ['assets/sound/punch.mp3']);
        this.load.audio('squash', ['assets/sound/splat.mp3', 'assets/sound/splat.ogg']);

    },

    create: function () {

        this.asset.cropEnabled = false;

    },

    update: function () {

        if(!!this.ready) {
//            this.game.state.start('MainMenu');
            this.state.start('MainMenu');
        }

    },

    onLoadComplete: function() {
        this.ready = true;
    }

};
