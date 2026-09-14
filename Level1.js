SlimesGame.Level1 = function(game) {
    "use strict";
};

SlimesGame.Level1.prototype = {

    create: function () { // -------------------------------------------------------------- CREATE FUNCTION

        //  ##########     SETTINGS, VARIABLES     ###########

        SlimesGame.Player.hp = 100;
        this.exiting = false;
        document.getElementById('menuStatus').textContent = 'Explore the dungeon';

        // level constants
//        thisLevel = this; // to use for this level context when it is hard to access
        this.GRAVITY = 1000;
        this.WALL_FRICTION = 0.96;
        this.JUMP_SPEED = -310;
        this.JUMP_RUN_SPEED = -320;
        this.WALK_SPEED = 125;
        this.RUN_SPEED = 200;
        this.SPIN_SPEED = 1000;

        // settings, variables
        this.slimeCounter = 0;
        this.spawnOne = false;
        this.knockBackTimer = this.game.time.create(false);

        this.game.physics.arcade.TILE_BIAS = 30;


        //  ##########     SOUND     ###########

        this.music1 = this.add.audio('gameMusic1');
        this.music1.play('', 0, 1, true);
        this.soundZap = this.add.audio('zap');
        this.soundSwoosh = this.add.audio('swoosh');
        this.soundSplat = this.add.audio('splat');
        this.soundPunch = this.add.audio('punch');


        //  ##########     MAP, LEVEL     ###########

        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('backgrounds60x60', 'tiles-bg');
        this.map.addTilesetImage('world30x30', 'tiles-world');
        this.map.addTilesetImage('lava', 'lava');
        this.map.setTileSize(30, 30);
        this.layer_bg = this.map.createLayer('background');
        this.layer_world = this.map.createLayer('world');

        this.map.setCollisionBetween(1, 120, true, this.layer_world);
//        this.layer_world.debug = true;

        this.layer_bg.resizeWorld();
        this.layer_world.resizeWorld();

        // set starting camera position to lower left of map
        this.camera.x = 0;
        this.camera.y += 600;


        //  ##########     ITEMS     ###########

        this.lavas = this.add.group();
        this.lavas.enableBody = true;

        // createFromObjects(name, gid, key, frame, exists, autoCull, group, CustomClass)
        // creates a sprite from the tileset object
        this.map.createFromObjects('lava', 129, 'lava', 0, true, false, this.lavas);

        // animate all lava in lavas group
        this.lavas.callAll('animations.add', 'animations', 'lavaboil', [0, 1, 2, 3, 4], 4, true);
        this.lavas.callAll('animations.play', 'animations', 'lavaboil');
        this.lavas.forEach(function(item){
            item.body.setSize(150, 25, 0, 5);
        }, this);

        // add the axes to the world
        this.axes = this.add.group();
        this.axes.enableBody = true;
        this.map.createFromObjects('itemsMedium', 134, 'spritesheet_itemsMedium', 0, true, false, this.axes);
        this.axes.callAll('animations.add', 'animations', 'axe', [0], 1, true);
        this.axes.callAll('animations.play', 'animations', 'axe');
        this.axes.forEach(function(item){
            item.body.setSize(50, 50, 0, 0);
//            item.frame = 1;
            // console.log(item.key);
        }, this);

        // add doors to the world
        this.doors = this.add.group();
        this.doors.enableBody = true;
        this.map.createFromObjects('itemsLarge', 176, 'spritesheet_itemsLarge', 0, true, false, this.doors);
        this.doors.callAll('animations.add', 'animations', 'door', [0], 1, true);
        this.doors.callAll('animations.play', 'animations', 'door');
        this.doors.forEach(function(item){
            item.body.setSize(100, 100, 0, 0);
//            item.frame = 1;
            // console.log(item.key);
        }, this);


        //  ##########     ENEMIES     ###########

        // slimes group
        this.slimes = this.add.group();
        this.slimes.enableBody = true;
        this.slimes.physicsBodyType = Phaser.Physics.ARCADE;
        this.MAX_LIVING_SLIMES = 20;
        this.RESPAWN_THRESHOLD = Math.floor(this.MAX_LIVING_SLIMES / 2);
        this.replenishingSlimes = true;
        // create a timer event to auto spawn slimes
        this.spawnEnemyTimer = this.game.time.create(false);
        this.spawnEnemyTimer.loop(3000, this.spawnEnemy, this);
        this.spawnEnemyTimer.start();


        //  ##########     PLAYER     ###########

        // create group for player and associated sprites
//        this.players= this.add.group();

        // player animations
        this.player = this.add.sprite(78, 498, 'dwarf');
//        this.player = this.add.sprite(670, 50, 'dwarf');
//        this.player = this.add.sprite(260, 534, 'dwarf');
//        this.players.add(this.player);
        this.player.anchor.setTo(0.5, 0.5);
        // sprite animations:
        // walking
        this.player.animations.add('walking-left', [1, 2, 3, 2], 6, true);
        this.player.animations.add('walking-right', [8, 9, 10, 9], 6, true);
        this.player.animations.add('walking-left-axe', [15, 16, 17, 16], 6, true);
        this.player.animations.add('walking-right-axe', [22, 23, 24, 23], 6, true);
        // running
        this.player.animations.add('running-left', [1, 2, 3, 2], 14, true);
        this.player.animations.add('running-right', [8, 9, 10, 9], 14, true);
        this.player.animations.add('running-left-axe', [15, 16, 17, 16], 14, true);
        this.player.animations.add('running-right-axe', [22, 23, 24, 23], 14, true);
        // jumping
        this.player.animations.add('jump-left', [4, 5, 5], 2, false);
        this.player.animations.add('jump-right', [11, 12, 12], 2, false);
        this.player.animations.add('jump-left-axe', [18, 19, 19], 2, false);
        this.player.animations.add('jump-right-axe', [25, 26, 26], 2, false);
        // attacking
        this.player.animations.add('attack-left-axe', [28, 29, 30, 31, 31, 31, 31, 31], 28, true);
        this.player.animations.add('attack-right-axe', [35, 36, 37, 38, 38, 38, 38, 38], 28, true);


        // receiving damage versions:
        // walking
        this.player.animations.add('dmg-walking-left', [43, 44, 45, 44], 6, true);
        this.player.animations.add('dmg-walking-right', [50, 51, 52, 51], 6, true);
        this.player.animations.add('dmg-walking-left-axe', [57, 58, 59, 58], 6, true);
        this.player.animations.add('dmg-walking-right-axe', [37, 38, 39, 38], 6, true);
        // running
        this.player.animations.add('dmg-running-left', [43, 44, 45, 44], 14, true);
        this.player.animations.add('dmg-running-right', [50, 51, 52, 51], 14, true);
        this.player.animations.add('dmg-running-left-axe', [57, 58, 59, 58], 14, true);
        this.player.animations.add('dmg-running-right-axe', [37, 38, 39, 38], 14, true);
        // jumping
        this.player.animations.add('dmg-jump-left', [46, 47, 47], 2, false);
        this.player.animations.add('dmg-jump-right', [53, 54, 54], 2, false);
        this.player.animations.add('dmg-jump-left-axe', [60, 61, 61], 2, false);
        this.player.animations.add('dmg-jump-right-axe', [40, 41, 41], 2, false);
        // attacking
        // this.dwarf.animations.add('dmg-attack-left-axe', [77, 78, 79, 80], false);
        // this.dwarf.animations.add('dmg-attack-right-axe', [84, 85, 86, 87], false);

        //  Enable physics on the player
        this.physics.arcade.enable(this.player);
        this.player.body.gravity.y = this.GRAVITY;
        this.player.body.collideWorldBounds = true;
        this.player.body.immovable = false;

        // player related variables
        this.player.name = "dwarf";
        this.player.facing = "right";
        this.player.jumpCount = 0;
        this.player.inJump = false;

        // attack and weapons
        this.player.takingDamage = false;
        this.player.cancelTakingDamageFlagTimer = this.game.time.create(false);
        this.player.equipAxe = false;
        this.player.attackTime = 0;
        this.player.inAttack = false;
        this.player.axeTime = 300; // time it takes for the axe swing
        this.player.meleeBreakPoint = 0.6; // multiplier to calculate when to switch from 1st to 2nd melee object for collisions

        // debug
        this.player.debugTop = false;
        this.player.debugSide = false;


//        this.meleeHitbox = this.add.sprite(this.players.x - 10, this.players.y - 20);
//        this.players.add(this.meleeHitbox);
//        this.meleeHitbox.width = 52;
//        this.meleeHitbox.height = 20;
//        this.meleeHitbox.enableBody = true;
//        this.physics.arcade.enable(this.meleeHitbox);
//        console.log('x: '+this.meleeHitbox.x+', y: '+this.meleeHitbox.y);


        // player attack sprites
        this.player.meleeTop = this.add.sprite(this.player.body.x - 6, this.player.body.y - 29);
        this.player.meleeTop.width = 52;
        this.player.meleeTop.height = 20;
        // this.player.meleeTop.body.immovable = true;
        this.player.meleeTop.enableBody = false;
        this.physics.arcade.enable(this.player.meleeTop);

        this.player.meleeSideR = this.add.sprite(this.player.body.x + 16, this.player.body.y - 12);
        this.player.meleeSideR.width = 16;
        this.player.meleeSideR.height = 46;
        // this.player.meleeSideR.body.immovable = true;
        this.player.meleeSideR.enableBody = false;
        this.physics.arcade.enable(this.player.meleeSideR);

        this.player.meleeSideL = this.add.sprite(this.player.body.x - 8, this.player.body.y - 12);
        this.player.meleeSideL.width = 16;
        this.player.meleeSideL.height = 46;
        // this.player.meleeSideL.body.immovable = true;
        this.player.meleeSideL.enableBody = false;
        this.physics.arcade.enable(this.player.meleeSideL);

        // set sprite collision bounds
        this.player.body.setSize(30, 48, 0, 11);


        //  ##########     KEYS, CAMERA     ###########

        // Capture certain keys to prevent their default actions in the browser.
        // This is only necessary because this is an HTML5 game. Games on other
        // platforms may not need code like this.
        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT
//            Phaser.Keyboard.SHIFT
        ]);
        this.jumpkey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.jumpkey.onDown.add(this.jumpCheck, this); //tells phaser to fire jumpCheck() ONCE per onDown event.
        this.attackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
        this.attackKey.onDown.add(this.attack, this); // fire attack function when pressing C key once

        this.camera.follow(this.player);
        this.player.frame = 7;


        //  ##########     INTERFACE, UI, HUD     ###########

        this.instructionsText = this.game.add.text (
            5, 2, 'Arrows: move, C: attack', {font: '12px Arial', fill: '#ababab'}
        );
        this.instructionsText2 = this.game.add.text (
            5, 16, 'Space: jump (2x: double jump)', {font: '12px Arial', fill: '#ababab'}
        );
        this.healthBar = this.game.add.text (
            935, 2, '', {font: '14px Arial', fill: '#fff'}
        );
        this.velX = this.game.add.text (
            835, 18, '', {font: '14px Arial', fill: '#fff'}
        );
        this.velY = this.game.add.text (
            890, 18, '', {font: '14px Arial', fill: '#fff'}
        );
        this.status = this.game.add.text (
            500, 18, '', {font: '14px Arial', fill: '#fff'}
        );

    },



    update: function () { // --------------------------------------------------------------  UPDATE FUNCTION

        // check if any forces are being applied automatically to the player
        // if not, reset movement to 0 (as the player should only move with keys pressed)
        this.player.body.velocity.x = 0

        if (this.exiting) { return; }
        if (SlimesGame.Player.hp <= 0) {
            this.quitGame();
            return;
        }

//        console.log('takingDamage: '+this.player.takingDamage);
//        console.log('x: '+this.meleeHitbox.x+', y: '+this.meleeHitbox.y);


        // ------- COLLISIONS -------

        // collide player with the map collision layer
        this.physics.arcade.collide(this.player, this.layer_world);

        // attack collisions
        if (this.player.inAttack) {
//            this.meleeHitbox.pivot.x = 30;
//            this.meleeHitbox.pivot.y = 20;
//            console.log("player in attack mode");
            this.physics.arcade.overlap(this.player.meleeTop, this.slimes, this.slimeDamage, null, this);
            if (this.player.facing == "right") {
                this.physics.arcade.overlap(this.player.meleeSideR, this.slimes, this.slimeDamage, null, this);
            } else {
                this.physics.arcade.overlap(this.player.meleeSideL, this.slimes, this.slimeDamage, null, this);
            }
        }

        // lava collision
        this.physics.arcade.overlap(this.player, this.lavas, this.lavaDamage, null, this);

        // item collisions
        this.physics.arcade.overlap(this.player, this.axes, this.equipAxe, null, this);


        // ------- PLAYER MOVEMENT -------

        // movement keys action on player
        if (this.leftInputIsActive()) {
            // set if out of jump
            if (this.player.body.onFloor()) {
                this.player.inJump = false;
            }
            //  Move to the left
            this.player.facing = "left";
            if (this.shiftInputIsActive()) {
                this.player.body.velocity.x = -this.RUN_SPEED;
            } else {
                this.player.body.velocity.x = -this.WALK_SPEED;
            }
        }
        if (this.rightInputIsActive()) {
            // set if out of jump
            if (this.player.body.onFloor()) {
                this.player.inJump = false;
            }
            //  Move to the right
            this.player.facing = "right";
            if (this.shiftInputIsActive()) {
                this.player.body.velocity.x = this.RUN_SPEED;
            } else {
                this.player.body.velocity.x = this.WALK_SPEED;
            }
        }

        // update player attack sprites to stay with player
        this.player.meleeTop.x = this.player.body.x - 10;
        this.player.meleeTop.y = this.player.body.y - 20;
        this.player.meleeSideR.x = this.player.body.x + 31;
        this.player.meleeSideR.y = this.player.body.y;
        this.player.meleeSideL.x = this.player.body.x - 17;
        this.player.meleeSideL.y = this.player.body.y;


        // ------- ANIMATIONS -------

        // player walking / running animations
        if (this.player.body.onFloor() && this.player.body.velocity.x !== 0) {
            if (this.player.equipAxe) {
                if (!this.player.takingDamage) {
                    if (this.player.body.velocity.x < 0) {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('running-left-axe');
                        } else {
                            this.player.animations.play('walking-left-axe');
                        }
                    } else {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('running-right-axe');
                        } else {
                            this.player.animations.play('walking-right-axe');
                        }
                    }
                } else {
                    if (this.player.body.velocity.x < 0) {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('dmg-running-left-axe');
                        } else {
                            this.player.animations.play('dmg-walking-left-axe');
                        }
                    } else {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('dmg-running-right-axe');
                        } else {
                            this.player.animations.play('dmg-walking-right-axe');
                        }
                    }
                }
            } else {
                if (!this.player.takingDamage) {
                    if (this.player.body.velocity.x < 0) {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('running-left');
                        } else {
                            this.player.animations.play('walking-left');
                        }
                    } else {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('running-right');
                        } else {
                            this.player.animations.play('walking-right');
                        }
                    }
                } else {
                    if (this.player.body.velocity.x < 0) {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('dmg-running-left');
                        } else {
                            this.player.animations.play('dmg-walking-left');
                        }
                    } else {
                        if (this.shiftInputIsActive()) {
                            this.player.animations.play('dmg-running-right');
                        } else {
                            this.player.animations.play('dmg-walking-right');
                        }
                    }
                }
            }
        }

        // player standing still animation
        if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0 && this.player.body.onFloor()) {
            //  Standing still
            this.player.inJump = false;
            if (!ifPlayerAttacking(this.player)) {
                this.player.animations.stop();
                if (this.player.equipAxe) {
                    if (!this.player.takingDamage) {
                        if (this.player.facing == "left" || this.player.frame == 18) {
                            this.player.frame = 14;
                        }
                        if (this.player.facing == "right" || this.player.frame == 15) {
                            this.player.frame = 21;
                        }
                    } else {
                        if (this.player.facing == "left" || this.player.frame == 18 || this.player.frame == 60) {
                            this.player.frame = 56;
                        }
                        if (this.player.facing == "right" || this.player.frame == 15 || this.player.frame == 67) {
                            this.player.frame = 63;
                        }
                    }
                } else {
                    if (!this.player.takingDamage) {
                        if (this.player.facing == "left" || this.player.frame == 4) {
                            this.player.frame = 0;
                        }
                        if (this.player.facing == "right" || this.player.frame == 11) {
                            this.player.frame = 7;
                        }
                    } else {
                        if (this.player.facing == "left" || this.player.frame == 4 || this.player.frame == 46) {
                            this.player.frame = 42;
                        }
                        if (this.player.facing == "right" || this.player.frame == 11 || this.player.frame == 53) {
                            this.player.frame = 49;
                        }
                    }
                }
            }

        }

        // player jumping and falling animations
        if (this.player.body.velocity.y !== 0) {
            if (this.player.body.velocity.y < 0) {
                // if moving up and right or left, and hitting wall, slow vertical
                // movement to implement friction
                if (this.player.body.blocked.right || this.player.body.blocked.left) {
                    this.player.body.velocity.y = this.player.body.velocity.y * this.WALL_FRICTION;
                }
                if (this.player.inJump) {
                    if (!this.player.takingDamage) {
                        // player jumping up
                        if (!this.player.inAttack) {
                            this.player.animations.stop();
                        }
                        if (this.player.facing == "right" || this.player.frame === 7) {
                            if (this.player.body.angularVelocity > 0) {
                                this.player.frame = 13;
                            } else {
                                this.player.frame = 12;
                            }
                            this.player.facing = "right";
                        }
                        if (this.player.facing == "left" || this.player.frame === 0) {
                            if (this.player.body.angularVelocity < 0) {
                                this.player.frame = 6;
                            } else {
                                this.player.frame = 5;
                            }
                            this.player.facing = "left";
                        }
                    } else {
                        // player jumping up
                        if (!this.player.inAttack) {
                            this.player.animations.stop();
                        }
                        if (this.player.facing == "right" || this.player.frame == 49) {
                            if (this.player.body.angularVelocity > 0) {
                                this.player.frame = 55;
                            } else {
                                this.player.frame = 54;
                            }
                            this.player.facing = "right";
                        }
                        if (this.player.facing == "left" || this.player.frame == 42) {
                            if (this.player.body.angularVelocity < 0) {
                                this.player.frame = 48;
                            } else {
                                this.player.frame = 47;
                            }
                            this.player.facing = "left";
                        }
                    }

                }
            } else {
                // player falling down
                if (!this.player.inAttack) {
                    this.player.animations.stop();
                }
                if (!this.player.takingDamage) {
                    if (this.player.facing == "right" || this.player.frame == 21) {
                        if (this.player.body.angularVelocity > 0) {
                            this.player.frame = 13;
                        } else {
                            this.player.frame = 11;
                        }
                        this.player.facing = "right";
                    }
                    if (this.player.facing == "left" || this.player.frame == 14) {
                        if (this.player.body.angularVelocity < 0) {
                            this.player.frame = 6;
                        } else {
                            this.player.frame = 4;
                        }
                        this.player.facing = "left";
                    }
                } else {
                    if (this.player.facing == "right" || this.player.frame == 21 || this.player.frame == 63) {
                        if (this.player.body.angularVelocity > 0) {
                            this.player.frame = 55;
                        } else {
                            this.player.frame = 53;
                        }
                        this.player.facing = "right";
                    }
                    if (this.player.facing == "left" || this.player.frame == 14) {
                        if (this.player.body.angularVelocity < 0) {
                            this.player.frame = 48;
                        } else {
                            this.player.frame = 46;
                        }
                        this.player.facing = "left";
                    }
                }

            }
        }

        // double jump tumble animation
        if (this.player.body.angularVelocity !== 0) {
            if (this.player.facing == "left") {
                this.player.anchor.setTo(0.45, 0.6);
            }
            if (this.player.facing == "right"){
                this.player.anchor.setTo(0.5, 0.6);
            }
        } else {
            this.player.anchor.setTo(0.5, 0.5);
        }
        if (this.player.body.blocked.down) {
            this.player.body.angularVelocity = 0; // stop spinning
            this.player.angle = 0; // stand up straight
        }


        // ------- ENEMIES -------

        // slime actions
        this.slimes.forEach(function (thisSlime) {
            if (thisSlime.dyingInLava) {
                return;
            }
//            console.log('Slime #'+thisSlime.slimeID+' nextAction: '+thisSlime.nextAction+', nextActionCue: '+thisSlime.nextActionCue);
            // run collisions on each slime
            if (thisSlime.health <= 0) {
                thisSlime.animations.play('slime-death');
                this.physics.arcade.collide(thisSlime, this.layer_world);
            } else {
                this.physics.arcade.collide(thisSlime, this.layer_world);
                this.physics.arcade.collide(thisSlime, this.player, slimeAttack, null, this);
//                this.physics.arcade.collide(this.player, thisSlime, slimeAttack, null, this);
                this.physics.arcade.overlap(thisSlime, this.lavas, this.lavaDamage, null, this);

//            this.status.text = 'nowState: '+thisSlime.nowState+', todo: '+thisSlime.nextAction;
//            this.velX.text = 'vX: '+Math.round(thisSlime.body.velocity.x);
//            this.velY.text = 'vX: '+Math.round(thisSlime.body.velocity.y);

                // first check for queued up todos (the .nextAction) for the slime. Even if the slime is currently doing something else (such as in an
                // action pause state) these todos take precidece (for eg if the slime gets hit by the player it stops, pauses, and choosed a new action)
                // current possible actions: 'moveright', 'moveleft', 'jumpright', 'jumpleft', 'stop'
                // possible nowStates: 'moving', 'attacking', 'defending', 'standing', 'jumping'
//            console.log('checking slime#'+thisSlime.slimeID+', current nextAction: '+thisSlime.nextAction);
                if (thisSlime.nextAction !== 'unset') {
//                console.log('todo is set for slime, about to: '+thisSlime.nextAction);
                    // first cancel any actions in progress
                    thisSlime.actionTimestamp = 0;
                    if (thisSlime.jumpXTimer.running) {
                        thisSlime.jumpXTimer.stop(); console.log('stopping jumpXTimer');
                    }
//                console.log('checking '+this.nextAction);
                    switch (thisSlime.nextAction) {
                        case "stop":
                            thisSlime.nowState = 'standing';
                            thisSlime.body.velocity.x = 0;
                            thisSlime.body.velocity.y = 0;
                            // lets not have the slime standing around too long, so setup another action in this case
                            var nextAction = this.entityChooseAction(thisSlime);
//                        console.log('no standing! next action: '+nextAction+', current todo is: '+thisSlime.nextAction);
                            if(thisSlime.stateChangeTimer.running) {
                                thisSlime.stateChangeTimer.stop();
                            }
                            thisSlime.nextActionCue = nextAction;
                            thisSlime.stateChangeTimer.add(2000, this.entityChangeState, thisSlime);
//                        thisSlime.stateChangeTimer.add(
//                            2000,
//                            function() {
//                                thisSlime.nextAction = thisSlime.nextActionCue;
//                                thisSlime.stateChangeTimer.stop();
//                                console.log('changeState anonymous #2 function run on slime# '+thisSlime.slimeID+'. nextAction is now: '+thisSlime.nextAction+' taken from cue: '+this.nextActionCue);
//                            },
//                            this
//                        );
                            thisSlime.stateChangeTimer.start();
                            thisSlime.nextAction = 'unset'; // reset the todo now that its done
//                        console.log('new stateChangeTimer set. State before timer fires: '+this.nextAction);
//                        console.log('nextAction is reset: '+thisSlime.nextAction+' and velx is: '+thisSlime.body.velocity.x);
                            break;
                        case "moveright":
                            thisSlime.nowState = 'moving';
                            thisSlime.facing = "right";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '+'); console.log('new velx: '+thisSlime.body.velocity.x);
                            thisSlime.nextAction = 'unset'; // reset the todo now that its done
//                        console.log('case: moveright -new velx: '+thisSlime.body.velocity.x);
//                        console.log('nextAction is reset: '+thisSlime.nextAction+' and velx is: '+thisSlime.body.velocity.x);
//                        console.log('nextActionCue is set to: '+thisSlime.nextActionCue);
//                        break;
                        case "moveleft":
                            thisSlime.nowState = 'moving';
                            thisSlime.facing = "left";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '-'); console.log('new velx: '+thisSlime.body.velocity.x);
                            thisSlime.nextAction = 'unset'; // reset the todo now that its done
//                        console.log('nextAction is reset: '+thisSlime.nextAction+' and velx is: '+thisSlime.body.velocity.x);
                            break;
                        case "jumpright":
                            thisSlime.nowState = 'jumping';
                            // make slime jump right
                            thisSlime.body.velocity.x = 0;
                            thisSlime.animations.stop();
                            thisSlime.frame = thisSlime.readyJumpFrame;
                            thisSlime.jumpDir = 'right';
                            var jumpPower = Math.floor(Math.random() * 1000) + 1200;
                            thisSlime.jumpHeight = jumpPower / 5;
//                            console.log('jumpPower: '+jumpPower+', jumpHeight: '+thisSlime.jumpHeight);
                            thisSlime.jumpXTimer.add(jumpPower, thisSlime.jump, this);
                            thisSlime.jumpXTimer.start();
                            thisSlime.nextAction = 'unset'; // reset the todo now that its done
//                        console.log('nextAction is reset: '+thisSlime.nextAction+' and velx is: '+thisSlime.body.velocity.x);
                            break;
                        case "jumpleft":
                            thisSlime.nowState = 'jumping';
                            // make slime jump left
                            thisSlime.body.velocity.x = 0;
                            thisSlime.animations.stop();
                            thisSlime.frame = thisSlime.readyJumpFrame;
                            thisSlime.jumpDir = 'left';
                            var jumpPower = Math.floor(Math.random() * 1000) + 1200;
                            thisSlime.jumpHeight = jumpPower / 5;
//                            console.log('jumpPower: '+jumpPower+', jumpHeight: '+thisSlime.jumpHeight);
                            thisSlime.jumpXTimer.add(jumpPower, thisSlime.jump, this);
                            thisSlime.jumpXTimer.start();
                            thisSlime.nextAction = 'unset'; // reset the todo now that its done
//                        console.log('nextAction is reset: '+thisSlime.nextAction+' and velx is: '+thisSlime.body.velocity.x);
                            break;
                    }
                }
            }


            // if slime is not in an action pause state, continue (action pause happens when slime is making a decision like at a ledge
            // so that it sticks with the first decision and doesn't keep firing the action decision process)
            if (this.game.time.now > thisSlime.actionTimestamp) {
//                console.log('slime NOT in action pause state. now gametime: '+this.game.time.now+', slime actionTimeStamp: '+thisSlime.actionTimestamp);
                // slime is not in action pause state
                var choice;
                // timer to periodically check for stopped/stationary slimes and give them actions
                if (this.game.time.now > thisSlime.stoppedCheckTimer) {
//                    console.log('Slime '+thisSlime.slimeID+' x: '+thisSlime.body.velocity.x+', y: '+thisSlime.body.velocity.y);
                    if (isStopped(thisSlime)) {
                        // console.log('Slime '+thisSlime.slimeID+' IS stopped...');
                        choice = Math.floor(Math.random() * 2) +1;
                        if (choice == 1) {
                            thisSlime.facing = "right";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '+');
                        } else {
                            thisSlime.facing = "left";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '-');
                        }
                        // console.log('Slime choice '+choice+' which is to go '+thisSlime.facing);
                    } // else {
                    //     console.log('Slime '+thisSlime.slimeID+' is NOT stopped...');
                    //     console.log('Slime '+thisSlime.slimeID+' x: '+thisSlime.body.velocity.x+', y: '+thisSlime.body.velocity.y+', timer: '+thisSlime.jumpXTimer.expired);
                    // }
                    thisSlime.stoppedCheckTimer = this.game.time.now + thisSlime.stoppedCheckInterval;
                }

                // Slime meets obstacle or ledge.. either turn back, fall off ledge, or jump
                if (thisSlime.body.blocked.down) { // slime is on the ground
                    if (thisSlime.body.blocked.left) {
                        // go right
                        thisSlime.facing = "right";
                        thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '+');
                        // don't check this slime again for a short period of time
                        thisSlime.actionTimestamp = this.game.time.now + 2300;
                        // console.log('Slime '+thisSlime.slimeID+' blocked on left. New dir: '+thisSlime.facing+ ' and speed: '+thisSlime.body.velocity.x);
                    } else if (thisSlime.body.blocked.right) {
                        // go left
                        thisSlime.facing = "left";
                        thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '-');
                        // don't check this slime again for a short period of time
                        thisSlime.actionTimestamp = this.game.time.now + 2300;
                        // console.log('Slime '+thisSlime.slimeID+' blocked on left. New dir: '+thisSlime.facing+ ' and speed: '+thisSlime.body.velocity.x);
                    } else if ((this.tileGet(thisSlime, this.layer_world, 'right') === 0) && (thisSlime.body.velocity.y === 0)) {
                        // slime on ledge, there is a drop off to the right
                        // don't check this slime again for a short period of time
                        thisSlime.actionTimestamp = this.game.time.now + 2300;
                        choice = Math.floor((Math.random() * 3) + 1);
                        // console.log('Slime '+thisSlime.slimeID+' choice: '+choice+', timestamp: '+thisSlime.actionTimestamp+' compared to now: '+this.game.time.now);
                        if (choice === 1) {
                        //console.log('slime '+thisSlime.slimeID+' jumping!');
                            // make slime jump right
                            thisSlime.body.velocity.x = 0;
                            thisSlime.animations.stop();
                            thisSlime.frame = thisSlime.readyJumpFrame;
                            thisSlime.jumpDir = 'right';
                            var jumpPower = Math.floor(Math.random() * 1000) + 1200;
                            thisSlime.jumpHeight = jumpPower / 5;
//                            console.log('jumpPower: '+jumpPower+', jumpHeight: '+thisSlime.jumpHeight);
                            thisSlime.jumpXTimer.add(jumpPower, thisSlime.jump, this);
                            thisSlime.jumpXTimer.start();
//                            thisSlime.jump('right');

                        } else if (choice === 2) {
                            // slime turns around
                            thisSlime.facing = "left";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '-');
                            // console.log('Slime '+thisSlime.slimeID+', turned around, now facing: '+thisSlime.facing+', velocity: '+thisSlime.body.velocity.x);
                        }
                    } else if ((this.tileGet(thisSlime, this.layer_world, 'left') === 0) && (thisSlime.body.velocity.y === 0)) {
                        // slime on ledge, there is a drop off to the left
                        // don't check this slime again for a short period of time
                        thisSlime.actionTimestamp = this.game.time.now + 2300;
                        choice = Math.floor((Math.random() * 3) + 1);
                        // console.log('Slime '+thisSlime.slimeID+' choice: '+choice+', timestamp: '+thisSlime.actionTimestamp+' compared to now: '+this.game.time.now);
                        if (choice === 1) {
                        //console.log('slime '+thisSlime.slimeID+' jumping!');
                            // make slime jump left
                            thisSlime.body.velocity.x = 0;
                            thisSlime.animations.stop();
                            thisSlime.frame = thisSlime.readyJumpFrame;
                            thisSlime.jumpDir = 'left';
                            var jumpPower = Math.floor(Math.random() * 1000) + 1200;
                            thisSlime.jumpHeight = jumpPower / 5;
//                            console.log('jumpPower: '+jumpPower+', jumpHeight: '+thisSlime.jumpHeight);
                            thisSlime.jumpXTimer.add(jumpPower, thisSlime.jump, this);
                            thisSlime.jumpXTimer.start();
//                            thisSlime.jump('left');

                        } else if (choice === 2) {
                            // slime turns around
                            thisSlime.facing = "right";
                            thisSlime.body.velocity.x = this.forceSign(thisSlime.speed, '+');
                            // console.log('Slime '+thisSlime.slimeID+', turned around, now facing: '+thisSlime.facing+', velocity: '+thisSlime.body.velocity.x);
                        }
                    } else {
                        // no conditions met, slimes continues (may fall off ledge), also prevent the pause before next checks
                        thisSlime.actionTimestamp = 0;
//                        console.log('choice 3, vel: '+thisSlime.body.velocity.x);
                    }
                } else {
//                    console.log('slime IS in action pause state. now gametime: '+this.game.time.now+', slime actionTimeStamp: '+thisSlime.actionTimestamp);
                }
            }
        }, this);


        // ------- UI / HUD -------

        this.healthBar.text = 'Health ' + SlimesGame.Player.hp;
//        this.velX.text = 'vX: '+Math.round(this.player.body.velocity.x);
//        this.velY.text = 'vX: '+Math.round(this.player.body.velocity.y);


        // ------- FUNCTIONS -------

        ifPlayerAttacking = function(obj) {     //console.log('['+obj.axeTime+'] ['+obj.meleeBreakPoint+']');
//            console.log(obj.attackTime+', '+obj.game.time.now);
            if (obj.attackTime > obj.game.time.now) {
                obj.inAttack = true;           //console.log('obj.inAttack: '+obj.inAttack);
                // determine melee time breakpoint so we know which melee object in the swing to activate at which time
//                    console.log('meleeTimeLeft: '+obj.attackTime+' - '+obj.game.time.now+'('+(obj.attackTime - obj.game.time.now)+')');
                var meleeTimeLeft = obj.attackTime - obj.game.time.now;
//                    console.log('if '+meleeTimeLeft+' < '+obj.axeTime+' * '+obj.meleeBreakPoint+' ('+(obj.axeTime * obj.meleeBreakPoint)+')');
                if (meleeTimeLeft > obj.axeTime * obj.meleeBreakPoint) {
                    // first part of melee attack
//                    obj.debugTop = true;
//                    console.log('first melee part');
                    obj.meleeTop.enableBody = true;
                } else {
                    // 2nd part of the melee attack
//                    console.log('2nd melee part');
                    if (obj.facing == 'right') {
//                        obj.debugSide = true; obj.debugTop = false;
                        obj.meleeSideR.enableBody = true;
                    } else {
//                        obj.debugSide = true;  obj.debugTop = false;
                        obj.meleeSideL.enableBody = true;
                    }
                }
                if (obj.facing == 'right') {
                    obj.animations.play('attack-right-axe');
                } else {
                    obj.animations.play('attack-left-axe');
                }
                return true;
            } else {
                obj.debugSide = false;
                obj.inAttack = false;
                obj.meleeTop.enableBody = false;
                obj.meleeSideR.enableBody = false;
                obj.meleeSideL.enableBody = false;
                return false;
            }
        };

        isStopped = function(entity) {
            // make sure not moving and not in a jump process
            return (entity.body.velocity.x === 0 && entity.body.velocity.y === 0 && !entity.jumpXTimer.running);
        };

        slimeAttack = function (spriteSlime, spritePlayer) {      //console.log('SLIME ATTACK!!');
            if (this.game.time.now > spriteSlime.attackTimestamp) {
                SlimesGame.Player.hp -= 10;
                spritePlayer.takingDamage = true;
                spriteSlime.body.velocity.x = 0;
                spriteSlime.body.velocity.y = 0;
                spritePlayer.body.velocity.x = 0;
                spritePlayer.body.velocity.y = 0;
                // set timer to turn off player.takingDamage flag
                this.player.cancelTakingDamageFlagTimer.add(160, this.cancelTakingDamageFlag, this);
                this.player.cancelTakingDamageFlagTimer.start();
                // don't allow damage for a short period of time
                spriteSlime.attackTimestamp = this.game.time.now + 1000;
                this.soundZap.play('');
                // what kind of behaviour should happen after slime attacks player..
                // it should pause and then choose an action based on slime type
                if (spriteSlime.stoppedCheckTimer.running) {
                    spriteSlime.stoppedCheckTimer.stop();
                }
                spriteSlime.stoppedCheckTimer = this.game.time.now + spriteSlime.attackPause;
                this.game.physics.arcade.collide(spritePlayer, this.game.layer_world);
            }
        };

    },

    attack: function() {
        if (this.player.equipAxe){
            this.player.inAttack = true;
            this.soundSwoosh.play('');
            this.player.attackTime = this.game.time.now + this.player.axeTime;
        }
    },

    equipAxe: function(player, axe) {
        player.equipAxe = true;
        axe.kill();
    },

    slimeDamage: function(damager, victim) {
//        console.log("slime #"+victim.slimeID+" hit! Health before: "+victim.health+' .. player.inAttack mode: '+this.player.inAttack);
        if (this.game.time.now > victim.takingDamage && victim.health > 0) {
            // not currently taking damage
            victim.nowState = 'defending';
            // pick next action
            var nextAction = this.entityChooseAction(victim);
            console.log('NEXT ACTION RETURNED: '+nextAction);
            // over-ride for aggressive slimes, who always continue towards player after being hit
            if (victim.agressive === 'true') {
                nextAction = 'move'+victim.facing;
            }
            victim.nextActionCue = nextAction;
//            console.log('just set nextActionCue to: '+this.nextActionCue+' using '+this.nextActionCue);
//            console.log('1- slime took damage, new action chosen: '+nextAction);
            // don't override if currently within a state change
            if (!victim.stateChangeTimer.running) {
//                console.log('slime stateChangeTimer NOT running.. set new timer');
                victim.stateChangeTimer.add(1000, this.entityChangeState, victim);
//                victim.stateChangeTimer.add(
//                    1000,
//                    function(){
//                        this.nextAction = this.nextActionCue;
//                        this.stateChangeTimer.stop();
//                        console.log('changeState anonymous #1 function run on slime# '+this.slimeID+'. nextAction is now: '+this.nextAction+' taken from cue: '+this.nextActionCue);
//                    },
//                    victim
//                );
                victim.stateChangeTimer.start();
            } else {
                console.log('stateChangeTimer still running');
            }
//            console.log('2- slime took damage, new action chosen: '+nextAction);
            // set short time to prevent piling up damage
            victim.takingDamage = this.game.time.now + this.player.axeTime;
            victim.health -= 20;
//            console.log("slime #"+victim.slimeID+" hit! Health after: "+victim.health);
            if (victim.health <= 0) {
//                victim.animations.play('slime-death');
//                victim.health = 0;
                this.soundSplat.play();
//                victim.takingDamage = 0;
                victim.deathTimer.add(
                    160,
                    function() {
                        victim.deathTimer.stop();
                        victim.kill()
                        victim.destroy();
//                        console.log('changeState anonymous #2 function run on slime# '+thisSlime.slimeID+'. nextAction is now: '+thisSlime.nextAction+' taken from cue: '+this.nextActionCue);
                    },
                    this
                );
                victim.deathTimer.start();
//                victim.kill();
            } else {
                this.soundPunch.play();
                // knockback
                this.knockBack(damager, victim, 130);
            }
        } else {
            // already ran through hit sequence once, can turn off player in attack flag so collision stops firing
            this.player.inAttack = false;
//            console.log('in takingdamage pause. player.inAttack mode: '+this.player.inAttack);
        }
    },

    knockBack: function(damager, victim, duration) {
        if (this.knockBackTimer.running) {
            this.knockBackTimer.stop();
        }
        // determine direction for knockback.. depending on dir facing of victim and which side damager is on when hitting
        var damagerSide = 'right';
        if (damager.world.x < victim.world.x) {
            damagerSide = 'left';
        }
        var knockBackDir;
        if (damagerSide == 'left'){
            knockBackDir = 'right';
        } else {
            knockBackDir = 'left';
        }
        if (knockBackDir == 'right'){
            victim.body.velocity.x = 150;
        } else {
            victim.body.velocity.x = -150;
        }
        this.knockBackTimer.add(duration, this.resetSpeed, this, victim);
        this.knockBackTimer.start();
    },

    resetSpeed: function(target) {
        if (target.facing == "right") {
            target.body.velocity.x = Math.abs(target.speed);
        } else {
            target.body.velocity.x = Math.abs(target.speed) * -1;
        }
        if (this.knockBackTimer.running) {
            this.knockBackTimer.stop();
        }
    },

    entityChangeState: function() {
//        console.log('entity: '+entity.name+' changing state to: '+newState+' and new todo is: '+todo);
//        entity.nowState = newState;
        this.nextAction = this.nextActionCue; console.log('todo changed to: '+this.nextAction);
        this.stateChangeTimer.stop();
    },

    entityChooseAction: function(entity) {
        // pick next action
        var choice =  Math.floor(Math.random() * 10) +1; console.log('choice: '+choice);
        var nextAction;
        if (choice < 4) {
            // carry on in same direction
            nextAction = 'move' + entity.facing;
        } else if (choice > 3 && choice < 7) {
            // move in opposite direction
            nextAction = 'move' + this.switchDir(entity.facing);
        } else if (choice == 7 || choice == 8) {
            // jump in opposite direction
            nextAction = 'jump' + entity.facing;
        } else {
            // stop
            nextAction = 'stop';
        }
        return nextAction;
    },

    cancelTakingDamageFlag: function() {
        this.player.cancelTakingDamageFlagTimer.stop();
        this.player.takingDamage = false;
    },

    switchDir: function(dir) {
        var newDir;
        if (dir == 'left') {
            newDir = 'right';
        } else if (dir == 'right') {
            newDir = 'left';
        } else if (newDir == 'up') {
            newDir = 'down';
        } else if (dir == 'down') {
            newDir == 'up';
        }
        return newDir;
    },

    forceSign: function(num, sign) {
        // convert number to either neg or pos, use: x = forceSign(mynum, '+');
        if (num !== 0) {
            if (sign == '+') {
                return Math.abs(num);
            }
            if (sign == '-') {
                return Math.abs(num) * -1;
            }
        }
    },

    shouldSpawnEnemy: function(livingCount) {
        if (this.replenishingSlimes && livingCount >= this.MAX_LIVING_SLIMES) {
            this.replenishingSlimes = false;
        } else if (!this.replenishingSlimes && livingCount <= this.RESPAWN_THRESHOLD) {
            this.replenishingSlimes = true;
        }

        return this.replenishingSlimes && livingCount < this.MAX_LIVING_SLIMES;
    },

    spawnEnemy: function() {
        if (!this.shouldSpawnEnemy(this.slimes.countLiving())) {
            return;
        }

        if (!this.spawnOne){
            // create a new enemy
            var enemy;
            var choice =  Math.floor(Math.random() * 8) +1; console.log('slime choice: '+choice);
            if (choice == 1 || choice == 2){
                enemy = this.slimes.create(760 + Math.random() * 100, 70 + Math.random() * 60, 'medSlime');
                enemy.name = 'yellow slime';
                enemy.health = 100;
                enemy.animations.add('slime-walk', [8, 9, 10, 11, 12, 11, 10, 9, 8], 6, true);
                enemy.animations.add('slime-death', [13, 14, 14, 15, 15], 30, true);
                enemy.readyJumpFrame = 9;
            } else if (choice == 3 || choice == 4 || choice == 5 || choice == 6 || choice == 7) {
                enemy = this.slimes.create(760 + Math.random() * 100, 70 + Math.random() * 60, 'medSlime');
                enemy.name = 'green slime';
                enemy.health = 40;
                enemy.animations.add('slime-walk', [0, 1, 2, 3, 4, 3, 2, 1, 0], 6, true);
                enemy.animations.add('slime-death', [5, 6, 6, 7, 7], 30, true);
                enemy.readyJumpFrame = 1;
            }
            else {
                enemy = this.slimes.create(760 + Math.random() * 100, 70 + Math.random() * 60, 'largeSlime');
                enemy.name = 'king slime';
                enemy.health = 300;
                enemy.animations.add('slime-walk', [0, 1, 2, 1, 0], 4, true);
                enemy.readyJumpFrame = 0;
            }
            enemy.slimeID = this.slimeCounter += 1;

            enemy.anchor.setTo(0.5, 0.5);

            this.physics.arcade.enable(enemy);
            this.physics.arcade.collide(enemy, this.layer_world);
            enemy.body.immovable = true;
            enemy.body.gravity.y = this.GRAVITY;
            enemy.body.collideWorldBounds = true;
            enemy.play('slime-walk');
            enemy.facing = "left";
            enemy.jumpDir = "left";
            enemy.speed = this.forceSign((Math.random() * 30 + 15), '-');
            enemy.nowState = 'moving'; // flag to track current state. Possible states:
                                            // 'moving', 'attacking', 'defending', 'standing', 'jumping'
            enemy.nextAction = 'unset'; // other options: 'moveright', 'moveleft', 'jumpright', 'jumpleft', 'stop'
            enemy.nextActionCue = 'unsetStartQue';
            enemy.stateChangeTimer = this.game.time.create(false);
            enemy.deathTimer = this.game.time.create(false);
            enemy.attackPause = 1000; // pauses this long after attack before next action
            enemy.takingDamage = 0; // timer to track duration slime takes damage to prevent multiple damage in a single hit
            enemy.agressive = false; // true: slime will continue towards player after attack
            // time stamp provides a delay after wall/ledge actions
            enemy.actionTimestamp = 0;
            // timestamp provides slight delay between attacks
            enemy.attackTimestamp = 0;
            enemy.dyingInLava = false;
            enemy.body.velocity.x = enemy.speed;
            // create a jump timer object for a short burst of x velocity (to add to the y)
            enemy.jumpXTimer = this.game.time.create(false);
            // jump settings
            enemy.jumpSpeed = 100;
            enemy.jumpHeight = 300;
            // timer to periodically check for stopped/stationary slimes
            // and make them do something
            enemy.stoppedCheckTimer = 0;
            enemy.stoppedCheckInterval = 5000; // check every 10 seconds

            // slime functions

            enemy.jump = function() {
                enemy.jumpXTimer.stop();
                if (enemy.jumpDir == 'right') {
                    enemy.jumpSpeed = enemy.jumpHeight / 3;
                }
                if (enemy.jumpDir == 'left') {
                    enemy.jumpSpeed = Math.abs(enemy.jumpHeight / 3) * -1;
                }
                enemy.play('slime-walk');
                enemy.body.velocity.y = Math.abs(enemy.jumpHeight) * -1;
                enemy.body.velocity.x = enemy.jumpSpeed;
//                var jumpTime = 700;
                var jumpTime = enemy.jumpHeight * 1.8;
//                console.log('again, jumpHeight: '+enemy.jumpHeight+', xVel: '+enemy.jumpSpeed+', jumpTime: '+jumpTime);
                enemy.jumpXTimer.add(jumpTime, enemy.resetSpeed, this);
                enemy.jumpXTimer.start();
            };

            enemy.resetSpeed = function() {
                if (enemy.facing == "right") {
                    enemy.body.velocity.x = Math.abs(enemy.speed);
                } else {
                    enemy.body.velocity.x = Math.abs(enemy.speed) * -1;
                }
//                console.log('Slime '+enemy.slimeID+' speed reset to '+enemy.body.velocity.x+', set to: '+enemy.speed);
                enemy.jumpXTimer.stop();
            };

            enemy.entityChangeState2 = function(entity, newState, todo) {
                console.log('entityChangeState2!!');
                console.log('entity: '+entity.name+' changing state to: '+newState+' and new todo is: '+todo);
                entity.nowState = newState;
                entity.nextAction = todo; console.log('todo changed to: '+entity.nextAction);
            };

//            console.log('new slime ID: '+enemy.slimeID+', slime time: '+enemy.actionTimestamp);
            this.spawnOne = false; // set true to spawn only 1 slime
        }

    },

    jump: function() {
        this.player.body.velocity.y = this.JUMP_SPEED;
        if (this.player.jumpCount == 1) {
            if (this.player.facing == "right") {
                this.player.body.angularVelocity = this.SPIN_SPEED;
            } else {
                this.player.body.angularVelocity = -this.SPIN_SPEED;
            }
        }
    },

    jumpCheck: function() {
        if (this.player.inJump) {
            if (this.player.jumpCount < 1) {
                this.player.jumpCount ++;
                this.jump();
            }
        } else {
            if (this.player.body.onFloor()) {
                this.player.inJump = true;
                this.player.jumpCount = 0;
                this.jump();
            } else if (this.player.body.velocity.y > 0 && this.player.inJump == false) {
                this.player.inJump = true;
                this.player.jumpCount = 1;
                this.jump();
            }
        }
    },

    quitGame: function (pointer) { // -------------------------------------------------  QUITE GAME FUNCTION

        //	Here you should destroy anything you no longer need.
        //	Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //	Then let's go back to the main menu.
        if (this.exiting) { return; }
        this.exiting = true;
        this.game.sound.stopAll();
        this.game.paused = true;
        window.location.replace('index.html?from=death');

    },

    tileGet: function(entity, mapLayer, direction) {
        // returns the tile id. entity = the sprite, mapLayer is the layer, direction to check
        // for direction we want top, bottom, left, right
        var coordX = mapLayer.getTileX(entity.world.x);
        var coordY = mapLayer.getTileY(entity.world.y);

        // coordX & coordY are the x & y tile coordinates of the sprite based on its top/left pixel location

        // we have to account for the fact that sprites can be higher or wider than the tiles
        if (entity == this.player) {
            if (direction == 'top') {coordY -= 1;}
            if (direction == 'bottom') {coordY += 2;}
            if (direction == 'left') {coordX -= 1; coordY += 1;}
            if (direction == 'right') {coordX += 1; coordY +=1;}
        } else {
            if (direction == 'top') {coordY -= 1;}
            if (direction == 'bottom') {coordY += 1;}
            if (direction == 'left') {coordX -= 1; coordY +=1;} // +1 to Y because we want the tile beside lower
            if (direction == 'right') {coordX += 1; coordY +=1;} // +1 to Y because we want the tile beside lower
        }

        var tileObj = this.map.getTile(coordX, coordY, mapLayer);
        var tileID = 0;
        if (tileObj != undefined) {
            tileID = tileObj.index;
        }
//        console.log('slime x/y: '+coordX+' / '+coordY+' '+direction+' '+tileID);
        return tileID;
    },

    lavaDamage: function(victim, damager) {
        if (victim === this.player) {
            SlimesGame.Player.hp = 0;
            return;
        }
        if (victim.dyingInLava) {
            return;
        }
        victim.dyingInLava = true;
        victim.alive = false;
//        var gray = this.game.add.filter('Gray');
//        victim.filters = [gray];
        victim.body.velocity.x = 0;
        victim.body.velocity.y = 15;
        victim.body.enable = false;
        victim.animations.stop();
        if (victim.stateChangeTimer && victim.stateChangeTimer.running) {
            victim.stateChangeTimer.stop();
        }
        if (victim.deathTimer && victim.deathTimer.running) {
            victim.deathTimer.stop();
        }
        if (victim.jumpXTimer && victim.jumpXTimer.running) {
            victim.jumpXTimer.stop();
        }
        var fade = this.game.add.tween(victim);
        fade.to( { alpha: 0 }, 250, Phaser.Easing.Linear.None, true);
//        console.log('slime ID: '+victim.slimeID+' killed by lava');
        fade.onComplete.addOnce(function(){victim.destroy();});

    },

    dealDamage: function(victim, damager) {
        if (victim == this.player) {
            SlimesGame.Player.hp -= 10;
        }
    },


    // This function should return true when the player activates the "go left" control
    leftInputIsActive: function() {
        var isActive = false;
        isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        return isActive;
    },

    // This function should return true when the player activates the "go right" control
    rightInputIsActive: function() {
        var isActive = false;
        isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
        return isActive;
    },

    // This function should return true when the player activates the "jump" control
    spaceInputIsActive: function() {
        var isActive = false;
        isActive = this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR);
        return isActive;
    },

    // This function should return true when the player activates the "shift" control
    shiftInputIsActive: function() {
        var isActive = false;
        isActive = this.input.keyboard.isDown(Phaser.Keyboard.SHIFT);
        return isActive;
    },








    render: function() { // -------------------------------------------------------------- RENDER FUNCTION

//        this.game.debug.cameraInfo(this.camera, 32, 32);
//        this.game.debug.spriteCoords(this.player, 32, 110);
//        this.game.debug.spriteCoords(fixed, 600, 200);
//       this.game.debug.body(this.player, "red", false);

//        this.lavas.forEach(function(item){
//            this.game.debug.body(item, 'red', false);
//        }, this);
//
//        this.game.debug.body(this.slime, 'red', false);
//
//        if (!this.player.inAttack) {
//        if (this.player.debugTop) {this.game.debug.spriteBounds(this.player.meleeTop, 'blue', false);}
//        if (this.player.debugSide) {
//            this.game.debug.spriteBounds(this.player.meleeSideR, 'blue', false);
////            this.game.debug.spriteBounds(this.player.meleeSideL, 'blue', false);
//        }


//        }

//        this.game.debug.spriteBounds(this.meleeHitbox, 'green', false);

        // this.player.meleeTop.



    }


};
