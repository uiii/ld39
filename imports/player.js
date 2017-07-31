import Phaser from './phaser';
import Health from './health';
import Weapon from './weapon';
import Config from './config';
import {Direction, Side} from './constants';

class Player {
	constructor(game, gameObjects, battery, keys, side) {
		this.game = game;
		this.gameObjects = gameObjects;
		this.battery = battery;
		this.keys = keys;
		this.side = side;

		this.direction = side === Side.LEFT ? Direction.RIGHT : Direction.LEFT;
		this.pressedMoveKeys = [];

		this.inputEnabled = false;
		this.isSleeping = false;
		this.isDead = false;

		this.isControllable = true;

		this.sprite = this.createSprite(game, side, this.direction);
		this.health = new Health(game, this);
		this.weapon = new Weapon(game, gameObjects, battery, this);
		this.powerUps = [];
		this.powerUpPickupSound = this.game.add.audio('power-up-pickup');
		this.sleepSound = this.game.add.audio('sleep');
		this.wakeUpSound = this.game.add.audio('wake-up');
		this.dyingSound = this.game.add.audio('die');

		this.setKeyEvents(this.keys);
	}

	setOpponent(opponent) {
		this.opponent = opponent;
		this.weapon.setOpponent(opponent);
	}

	createSprite(game, side, direction) {
		const sprite = game.add.sprite(0, 0, side === Side.LEFT ? 'robot-silver' : 'robot-black', direction);
		this.gameObjects.add(sprite, true);

		sprite.smoothed = false;
		sprite.animations.add('left', [1, 2, 0], 10, false);
		sprite.animations.add('right', [4, 5, 3], 10, false);
		sprite.animations.add('up', [10, 11, 9], 10, false);
		sprite.animations.add('down', [7, 8, 6], 10, false);
		sprite.animations.add(`sleep-${Direction.LEFT}`, [0, 12, 13], 2, false);
		sprite.animations.add(`sleep-${Direction.RIGHT}`, [3, 14, 15], 2, false);
		sprite.animations.add(`sleep-${Direction.UP}`, [9, 18, 19], 2, false);
		sprite.animations.add(`sleep-${Direction.DOWN}`, [6, 16, 17], 2, false);
		sprite.animations.add(`wake-up-${Direction.LEFT}`, [13, 12, 0], 2, false).onComplete.add(this.onWakeUp.bind(this));
		sprite.animations.add(`wake-up-${Direction.RIGHT}`, [15, 14, 3], 2, false).onComplete.add(this.onWakeUp.bind(this));
		sprite.animations.add(`wake-up-${Direction.UP}`, [19, 18, 9], 2, false).onComplete.add(this.onWakeUp.bind(this));
		sprite.animations.add(`wake-up-${Direction.DOWN}`, [17, 16, 6], 2, false).onComplete.add(this.onWakeUp.bind(this));
		sprite.animations.add(`die-${Direction.RIGHT}`, [20, 21, 22, 23, 24, 25, 26, 27, 28], 3, false).onComplete.add(this.onDead.bind(this));
		sprite.animations.add(`die-${Direction.LEFT}`, [29, 30, 31, 32, 33, 34, 35, 36, 37], 3, false).onComplete.add(this.onDead.bind(this));
		sprite.animations.add(`die-${Direction.UP}`, [20, 21, 22, 23, 24, 25, 26, 27, 28], 3, false).onComplete.add(this.onDead.bind(this));
		sprite.animations.add(`die-${Direction.DOWN}`, [29, 30, 31, 32, 33, 34, 35, 36, 37], 3, false).onComplete.add(this.onDead.bind(this));

		sprite.alignIn(
			game.physics.arcade.bounds,
			side === Side.LEFT ? Phaser.LEFT_CENTER : Phaser.RIGHT_CENTER,
			-30
		);

		game.physics.arcade.enable(sprite);
		sprite.body.collideWorldBounds = true;

		return sprite;
	}

	setKeyEvents(keys) {
		for (key of ['left', 'right', 'up', 'down']) {
			keys[key].onDown.add(this.onMoveKeyDown.bind(this));
			keys[key].onUp.add(this.onMoveKeyUp.bind(this));
		}

		keys.powerUp && keys.powerUp.onDown.add(this.onPowerUpKeyDown.bind(this));
	}

	isPressed(key) {
		if (! key.isDown) {
			return false;
		}

		const isModifierKey = [Phaser.KeyCode.ALT, Phaser.KeyCode.CONTROL, Phaser.KeyCode.SHIFT].some((keyCode) => keyCode === key.keyCode);

		if (isModifierKey && key.event.location !== (this.side === Side.LEFT ? 1 : 2)) {
			return false;
		}

		return true;
	}

	onMoveKeyDown(key) {
		this.pressedMoveKeys.push(key);
	}

	onMoveKeyUp(key) {
		const index = this.pressedMoveKeys.indexOf(key);
		this.pressedMoveKeys.splice(index, 1);
	}

	onPowerUpKeyDown(key) {
		if (! this.isPressed(key)) {
			return;
		}

		if (! this.isControllable) {
			return;
		}

		const lastPowerUp = this.powerUps.pop();
		lastPowerUp && lastPowerUp.use();
	}

	move() {
		const {body} = this.sprite;

		body.velocity.x = 0;
		body.velocity.y = 0;

		const walkingTime = this.isWalking ? this.game.time.physicsElapsed : 0;
		this.battery.consume(walkingTime * Config.walkingPowerConsumption);

		if (! this.isControllable) {
			this.isWalking = false;
			return;
		}

		this.isWalking = true;

		const lastPressedMoveKey = this.pressedMoveKeys[this.pressedMoveKeys.length - 1];
		switch (lastPressedMoveKey) {
			case this.keys.left:
				body.velocity.x = -Config.walkingSpeed;
				this.direction = Direction.LEFT;
				this.sprite.play('left');
				break;
			case this.keys.right:
				body.velocity.x = Config.walkingSpeed;
				this.direction = Direction.RIGHT;
				this.sprite.play('right');
				break;
			case this.keys.up:
				body.velocity.y = -Config.walkingSpeed;
				this.direction = Direction.UP;
				this.sprite.play('up');
				break;
			case this.keys.down:
				body.velocity.y = Config.walkingSpeed;
				this.direction = Direction.DOWN;
				this.sprite.play('down');
				break;
			default:
				this.isWalking = false;
				break;
		}

		switch (this.direction) {
			case Direction.LEFT:
				this.weapon.setFireCoordinates(this.sprite.left, this.sprite.top + 49, this.direction)
				break;
			case Direction.RIGHT:
				this.weapon.setFireCoordinates(this.sprite.right, this.sprite.top + 49, this.direction)
				break;
			case Direction.UP:
				this.weapon.setFireCoordinates(this.sprite.right - 16, this.sprite.top + 51, this.direction)
				break;
			case Direction.DOWN:
				this.weapon.setFireCoordinates(this.sprite.left + 16, this.sprite.top + 51, this.direction)
				break;
			default:
				break;
		}

	}

	fire() {
		if (this.isPressed(this.keys.fire) && this.isControllable) {
			this.weapon.fire();
		} else {
			this.weapon.stopFire();
		}
	}

	takePowerUp(powerUp) {
		powerUp.sprite.reset(0, 0);
		powerUp.sprite.alignIn(
			this.game.world.bounds,
			this.side === Side.LEFT ? Phaser.TOP_LEFT : Phaser.TOP_RIGHT,
			- (75 + this.powerUps.length * 15),
			-10
		);
		powerUp.sprite.bringToTop();
		this.powerUpPickupSound.play();

		this.powerUps.push(powerUp);
	}

	sleep() {
		if (! this.isControllable) {
			return;
		}

		this.isSleeping = true;
		this.sprite.play(`sleep-${this.direction}`);
		this.sleepSound.play();
	}

	wakeUp() {
		if (! this.isSleeping) {
			return;
		}

		this.sprite.play(`wake-up-${this.direction}`);
		this.wakeUpSound.play();
	}

	onWakeUp() {
		this.isSleeping = false;
	}

	die() {
		if (this.isDead) {
			return;
		}

		this.isDead = true;
		this.sprite.play(`die-${this.direction}`);
		this.dyingSound.play();
		console.log("dead");
	}

	onDead() {
		this.game.end();
	}

	update() {
		if (this.health.hp === 0) {
			this.die();
		}

		if (this.battery.outOfPower()) {
			this.sleep();
		} else if (this.battery.power > 25) {
			this.wakeUp();
		}

		this.health.update();
		this.weapon.update();

		this.isControllable = this.inputEnabled && ! this.isDead && ! this.isSleeping;

		this.move();
		this.fire();
	}

	render() {
	}
}

export default Player;