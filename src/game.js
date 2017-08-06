import Phaser from './phaser';
import GameObjects from './gameObjects';
import Player from './player';
import Battery from './battery';
import FirstAids from './firstAid';
import PowerUps from './powerUp';
import Boxes from './boxes';
import {Side} from './constants';

class Game {
	preload() {
		this.game.load.spritesheet('robot-silver', 'assets/robot-silver.png', 60, 80);
		this.game.load.spritesheet('robot-black', 'assets/robot-black.png', 60, 80);
		this.game.load.spritesheet('battery', 'assets/battery.png', 55, 90);
		this.game.load.image('power-up', 'assets/power-up.png');
		this.game.load.image('beam', 'assets/beam.png');
		this.game.load.spritesheet('box', 'assets/box.png', 60, 65);
		this.game.load.spritesheet('heart', 'assets/heart.png', 45, 40);
		this.game.load.image('first-aid', 'assets/first-aid.png');
		this.game.load.image('blank', 'assets/blank.png');
		this.game.load.image('black', 'assets/black.png');
		this.game.load.image('splash', 'assets/splash.png');
		this.game.load.image('silver-won', 'assets/silver-won.png');
		this.game.load.image('black-won', 'assets/black-won.png');
		this.game.load.image('background', 'assets/background.png');

		this.game.load.audio('power-up-pickup', 'assets/power-up-pickup2.wav');
		this.game.load.audio('fire', 'assets/fire2.wav');
		this.game.load.audio('die', 'assets/die4.wav');
		this.game.load.audio('alarm', 'assets/alarm1.wav');
		this.game.load.audio('heart', 'assets/heart.wav');
		this.game.load.audio('heart-fast', 'assets/heart-fast.wav');
		this.game.load.audio('sleep', 'assets/sleep.wav');
		this.game.load.audio('wake-up', 'assets/wake-up.wav');
		this.game.load.audio('power-up', 'assets/power-up.wav');
		this.game.load.audio('heal', 'assets/heal.wav');
	}

	create() {
		this.game.end = this.end.bind(this);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.add.sprite(0, 0, 'background');

		this.game.physics.arcade.setBounds(5, 105, this.game.width - 10, this.game.height - 110);

		this.gameObjects = new GameObjects();

		this.battery = new Battery(this.game, {x: this.game.world.centerX, y: 170});
		this.gameObjects.add(this.battery.sprite);

		this.game.input.keyboard.addKeyCapture(Phaser.KeyCode.CONTROL);

		this.player1 = new Player(this.game, this.gameObjects, this.battery, this.game.input.keyboard.addKeys({
			up: Phaser.KeyCode.UP,
			down: Phaser.KeyCode.DOWN,
			left: Phaser.KeyCode.LEFT,
			right: Phaser.KeyCode.RIGHT,
			fire: Phaser.KeyCode.M,
			powerUp: Phaser.KeyCode.N
		}), Side.RIGHT);

		this.player2 = new Player(this.game, this.gameObjects, this.battery, this.game.input.keyboard.addKeys({
			up: Phaser.KeyCode.E,
			down: Phaser.KeyCode.D,
			left: Phaser.KeyCode.S,
			right: Phaser.KeyCode.F,
			fire: Phaser.KeyCode.A,
			powerUp: Phaser.KeyCode.Q
		}), Side.LEFT);

		this.player1.setOpponent(this.player2);
		this.player2.setOpponent(this.player1);

		this.boxes = new Boxes(this.game, this.gameObjects);

		this.firstAids = new FirstAids(this.game, this.gameObjects);
		this.powerUps = new PowerUps(this.game, this.gameObjects, this.battery);

		this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onDown.addOnce(this.start, this, 100);
		this.overlay = this.game.add.sprite(0, 0, 'black');
		this.overlay.scale.setTo(this.game.width, this.game.height);
		this.overlay.alpha = 0.5;

		this.splash = this.game.add.sprite(this.overlay.centerX, this.overlay.centerY, 'splash');
		this.splash.anchor.setTo(0.5, 0.5);

		window.player = this.player1;
	}

	start(spacebar) {
		this.overlay.kill();
		this.splash.kill();
		spacebar.reset();

		this.player1.inputEnabled = true;
		this.player2.inputEnabled = true;

		this.powerUps.startAdding();
	}

	update() {
		this.boxes.collide(this.player1);
		this.boxes.collide(this.player2);

		this.game.physics.arcade.collide(this.player1.sprite, this.player2.sprite);

		this.firstAids.checkOverlap(this.player1);
		this.firstAids.checkOverlap(this.player2);

		this.powerUps.checkOverlap(this.player1);
		this.powerUps.checkOverlap(this.player2);

		this.player1.update();
		this.player2.update();

		this.battery.update();
	}

	end() {
		this.overlay.revive();
		this.overlay.bringToTop();

		this.splash.revive();

		if (this.player1.isDead) {
			this.splash.loadTexture('silver-won');
		} else if (this.player2.isDead) {
			this.splash.loadTexture('black-won');
		} else {
			this.splash.kill();
		}

		this.splash.bringToTop();
	}

	run() {
		this.game = new Phaser.Game(1280, 600, Phaser.CANVAS, '', {
			preload: this.preload.bind(this),
			create: this.create.bind(this),
			update: this.update.bind(this)
		});
	}

	_processBoxCollision(player, box) {
		//return player.body.bottom <= box.body.bottom;
	}
}

export default Game;