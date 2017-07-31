import Phaser from './phaser';
import Player from './player';
import Battery from './battery';
import PowerUps from './powerUp';
import Boxes from './boxes';
import {Side} from './constants';

class Game {
	preload() {
		this.game.load.spritesheet('robot', 'robot.png', 60, 80);
		//this.game.load.image('robot-red', 'robot-red.png');
		this.game.load.image('battery', 'battery.png');
		this.game.load.image('power-up', 'power-up.png');
		this.game.load.image('beam', 'beam.png');
		this.game.load.spritesheet('box', 'box.png', 60, 65);
		this.game.load.image('background', 'background.png');
	}

	create() {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.add.sprite(0, 0, 'background');

		this.game.physics.arcade.setBounds(5, 105, this.game.width - 10, this.game.height - 110);

		this.gameObjects = [];

		this.battery = new Battery(this.game, {x: this.game.world.centerX, y: 170});
		this.gameObjects.push(this.battery.sprite);

		this.player1 = new Player(this.game, this.gameObjects, this.battery, this.game.input.keyboard.addKeys({
			up: Phaser.KeyCode.UP,
			down: Phaser.KeyCode.DOWN,
			left: Phaser.KeyCode.LEFT,
			right: Phaser.KeyCode.RIGHT,
			fire: Phaser.KeyCode.SPACEBAR,
			powerUp: Phaser.KeyCode.SHIFT
		}), Side.RIGHT);

		this.player2 = new Player(this.game, this.gameObjects, this.battery, this.game.input.keyboard.addKeys({
			up: Phaser.KeyCode.W,
			down: Phaser.KeyCode.S,
			left: Phaser.KeyCode.A,
			right: Phaser.KeyCode.D,
			fire: Phaser.KeyCode.CONTROL,
			powerUp: Phaser.KeyCode.SHIFT
		}), Side.LEFT);

		this.boxes = new Boxes(this.game, this.gameObjects);

		this.powerUps = new PowerUps(this.game, this.gameObjects, this.battery);
	}

	update() {
		this.boxes.collide(this.player1);
		this.boxes.collide(this.player2);

		this.game.physics.arcade.collide(this.player1.sprite, this.player2.sprite);

		this.powerUps.checkOverlap(this.player1);
		this.powerUps.checkOverlap(this.player2);

		this.player1.update();
		this.player2.update();

		this.battery.update();
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