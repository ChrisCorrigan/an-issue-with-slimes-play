
SlimesGame.MainMenu = function (game) {
    this.enteringDungeon = false;
};

SlimesGame.MainMenu.prototype = {

	create: function () {

        this.music = this.add.audio('titleMusic');
//        this.music.play();

        this.enteringDungeon = false;

        this.dwarf2 = this.add.sprite(this.world.centerX - 120, this.world.centerY + 145, 'dwarf');
        this.dwarf2.anchor.setTo(0.5, 0.5);
        this.dwarf2.animations.add('walking-left', [1, 2, 3, 2], 6, true);
        this.dwarf2.animations.add('walking-right', [8, 9, 10, 9], 6, true);
        this.dwarf2.facing = 'right';
        this.dwarf2.frame = 7;

        this.door = this.add.sprite(this.world.width - 120, this.world.centerY + 140, 'spritesheet_itemsLarge');
        this.door.anchor.setTo(0.5, 0.5);
        this.door.frame = 0;

        this.title = this.add.sprite(this.world.centerX, this.world.centerY-100, 'title');
        this.title.anchor.setTo(0.5, 0.5);

        this.instructionsText = this.add.text(this.world.centerX, this.world.centerY + 50, 'Use ← → to walk into the doorway', { font: '18px Arial', fill: '#fff', align: 'center'});

        this.instructionsText.anchor.setTo(0.5, 0.5);
        document.getElementById('menuStatus').textContent = 'Walk right to enter the dungeon';

        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT
        ]);
        this.cursors = this.input.keyboard.createCursorKeys();

	},

    startGame: function () {
        if (this.enteringDungeon) {
            return;
        }
        this.enteringDungeon = true;
        document.getElementById('menuStatus').textContent = 'Entering dungeon…';
        this.state.start('Level1');
    },

    shutdown: function () {
        this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.LEFT);
        this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.RIGHT);
    },

    update: function () {
        if (this.enteringDungeon) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.dwarf2.x = Math.max(40, this.dwarf2.x - 3);
            this.dwarf2.facing = 'left';
            this.dwarf2.animations.play('walking-left');
        } else if (this.cursors.right.isDown) {
            this.dwarf2.x += 3;
            this.dwarf2.facing = 'right';
            this.dwarf2.animations.play('walking-right');
        } else {
            this.dwarf2.animations.stop();
            this.dwarf2.frame = this.dwarf2.facing === 'left' ? 0 : 7;
        }

        if (this.dwarf2.x >= this.door.x - 30) {
            this.startGame();
        }
    }

};
