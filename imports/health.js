import Phaser from './phaser';
import {Side} from './constants';

class Health {
	constructor(game, player) {
		this.sprite = game.add.sprite(0, 0, 'heart', 1);
		this.bar = this.sprite.addChild(game.make.sprite(0, 0, 'heart', 0));

		this.sprite.alignIn(
			game.world.bounds,
			player.side === Side.LEFT ? Phaser.TOP_LEFT : Phaser.TOP_RIGHT,
			-10,
			-10
		);

		this.sprite.animations.add('blink', [1, 2], 5, true);
		this.sprite.animations.add('blink-fast', [1, 2], 8, true);

		this.hp = 50;
		this.hpToBeHealed = 0;
		this.hpToBeDamaged = 0;
	}

	heal(hp) {
		this.hpToBeHealed += hp;
	}

	damage(hp) {
		this.hpToBeDamaged += hp;
	}

	update() {
		this.hp = Math.min(100, Math.max(0, this.hp + (this.hpToBeHealed - this.hpToBeDamaged)));
		this.hpToBeHealed = 0;
		this.hpToBeDamaged = 0;

		const barHeight = (this.hp / 100) * 30;
		this.bar.x = 5;
		//this.bar.y = 35 - barHeight;
		this.bar.y = 5 + (30 - barHeight);
		//this.bar.crop(new Phaser.Rectangle(5, 35 - barHeight, 35, barHeight));
		this.bar.crop(new Phaser.Rectangle(5, this.bar.y, 35, barHeight));

		if (this.hp < 10) {
			this.sprite.play('blink-fast');
		} else if (this.hp < 30) {
			this.sprite.play('blink');
		} else {
			this.sprite.animations.stop(null, true);
		}

	}
}

export default Health;