import Phaser from './phaser';

class Battery {
	constructor(game, position = {x: 0, y: 0}, initialPower = 100) {
		this.game = game;

		this.sprite = game.add.sprite(position.x, position.y, 'battery');
		this.sprite.anchor.setTo(0.5, 1);

		this.bgGraphics = game.add.graphics(this.sprite.left, this.sprite.top);
		this.powerGraphics = game.add.graphics(this.sprite.left, this.sprite.top);

		this.sprite.bringToTop();

		this.power = initialPower;
		this.powerToBeCharged = 0;
		this.powerToBeConsumed = 0;
	}

	charge(power) {
		this.powerToBeCharged += power;
	}

	consume(power) {
		this.powerToBeConsumed += power;
	}

	outOfPower() {
		return this.power === 0;
	}

	update() {
		// charge 1% per second
		this.charge(this.game.time.physicsElapsed);

		// update power
		this.power = Math.min(100, Math.max(0, this.power + (this.powerToBeCharged - this.powerToBeConsumed)));
		this.powerToBeCharged = 0;
		this.powerToBeConsumed = 0;

		// draw power bar
		this.bgGraphics.clear();
		this.bgGraphics.beginFill(0x555555, 0.5);
		this.bgGraphics.drawRect(10, 20, 35, 55);
		this.bgGraphics.endFill();

		var powerHeight = (this.power / 100) * 50;
		var powerColor = 0x00FF00;

		if (this.power < 25) {
			powerColor = 0xFF0000;
		} else if (this.power < 50) {
			powerColor = 0xFF9900;
		}

		this.powerGraphics.clear();
		this.powerGraphics.beginFill(powerColor);
		this.powerGraphics.drawRect(15, 75 - powerHeight, 25, powerHeight);
		this.powerGraphics.drawRect(10, 70 - powerHeight, 5, powerHeight);
		this.powerGraphics.drawRect(40, 70 - powerHeight, 5, powerHeight);
		this.powerGraphics.endFill();
	}
}

export default Battery;