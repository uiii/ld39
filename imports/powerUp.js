import Phaser from './phaser';
import Config from './config';

class PowerUp {
	constructor(game, sprite, battery) {
		this.sprite = sprite;
		this.battery = battery;
		this.powerUpSound = game.add.audio('power-up');
	}

	use() {
		this.battery.charge(Config.powerUpCharge);
		this.sprite.kill();
		this.powerUpSound.stop();
		this.powerUpSound.play();
	}
}

class PowerUps {
	constructor(game, gameObjects, battery) {
		this.game = game;
		this.gameObjects = gameObjects;
		this.battery = battery;

		this.group = game.add.group();
		this.group.enableBody = true;
	}

	startAdding() {
		this.lastAddTime = this.game.time.time;
		this.game.time.events.loop(1000, this.maybeAdd, this);
	}

	_add() {
		const bounds = this.game.physics.arcade.bounds.clone();
		bounds.inflate(-50, -50);

		const powerUp = this.group.create(bounds.randomX, bounds.randomY, 'power-up');
		const powerUpBounds = powerUp.getBounds();
		powerUpBounds.x = powerUp.x;
		powerUpBounds.y = powerUp.y;
		powerUpBounds.inflate(30, 30);

		const overlap = this.gameObjects.get().some((object) => {
			return Phaser.Rectangle.intersects(object.getBounds(), powerUpBounds);
		});

		if (overlap) {
			powerUp.kill();
			return;
		}

		this.gameObjects.add(powerUp);
		this.lastAddTime = this.game.time.time;
	}

	maybeAdd() {
		const elapsed = this.game.time.elapsedSecondsSince(this.lastAddTime);
		//console.log(elapsed);

		const random = this.game.rnd.frac();
		//console.log("maybe add", elapsed, random, Math.pow(elapsed / 100, 2));

		if (random < Math.pow(elapsed / 10, 2)) {
			//console.log("add");
			this._add();
		}
	}

	checkOverlap(player) {
		this.game.physics.arcade.overlap(this.group, player.sprite, this.handleOverlap.bind(this, player), null);
	}

	handleOverlap(player, playerSprite, powerUp) {
		player.takePowerUp(new PowerUp(this.game, powerUp, this.battery));
	}
}

export default PowerUps;