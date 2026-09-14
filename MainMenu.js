
SlimesGame.MainMenu = function (game) {

};

SlimesGame.MainMenu.prototype = {

	create: function () {

        this.music = this.add.audio('titleMusic');
//        this.music.play();

        var style = {font: '65px Arial', fill: '#ffffff', align: 'center'};

        this.dwarf2 = this.add.sprite(this.world.centerX, this.world.centerY+130, 'dwarf');
        this.dwarf2.anchor.setTo(0.5, 0.5);
        this.dwarf2.animations.add('walking-left-axe', [15, 16, 17, 16], 5, true);
        this.dwarf2.animations.add('walking-right-axe', [22, 23, 24, 23], 5, true);
        this.dwarf2.animations.play('walking-right-axe', 5, true);

        this.title = this.add.sprite(this.world.centerX, this.world.centerY-100, 'title');
        this.title.anchor.setTo(0.5, 0.5);

        this.instructionsText = this.add.text(this.world.centerX, this.world.centerY+40, 'Click anywhere to start', { font: '18px Arial', fill: '#fff', align: 'center'});

        this.instructionsText.anchor.setTo(0.5, 0.5);
        var start = document.getElementById('startGame');
        start.disabled = false;
        start.textContent = 'Start prototype';
        this.input.onDown.addOnce(this.startGame, this);

	},

    startGame: function () {
        this.input.onDown.remove(this.startGame, this);
        document.getElementById('startGame').hidden = true;
        this.state.start('Level1');
    },

    shutdown: function () {
        this.input.onDown.remove(this.startGame, this);
    },

    update: function () {}

};
