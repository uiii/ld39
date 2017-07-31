import Phaser from './phaser';
import Config from './config';

class FirstAid {
	constructor(game, gameObjects, group, x, y) {
		this.game = game;

		this.sprite = group.create(x, y, 'first-aid');

		this.healSound = game.add.audio('heal', 0.5);

		this.area = group.create(this.sprite.centerX, this.sprite.centerY, 'blank');
		this.area.anchor.setTo(0.5, 0.5);
		this.area.scale.setTo(100, 100);

		gameObjects.add(this.area);
	}

	checkOverlap(player) {
		if (this.game.physics.arcade.overlap(player.sprite, this.sprite)) {
			this.sprite.kill();
			player.health.heal(25);
			this.healSound.stop();
			this.healSound.play();
			this.game.time.events.add(10000, this.refresh.bind(this));
		}
	}

	refresh() {
		this.sprite.revive();
	}
}

class FirstAids {
	constructor(game, gameObjects) {
		this.game = game;

		const group = game.add.group();
		group.enableBody = true;

		this.aids = [];
		this.aids.push(new FirstAid(game, gameObjects, group, 55, 180));
		this.aids.push(new FirstAid(game, gameObjects, group, 1190, 510));
	}

	checkOverlap(player) {
		this.aids.forEach((aid) => aid.checkOverlap(player));
	}
}

export default FirstAids;