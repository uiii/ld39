class Boxes {
	constructor(game, gameObjects) {
		this.game = game;
		this.gameObjects = gameObjects;

		this.group = game.add.group();
		this.group.enableBody = true;

		//this.game.physics.arcade.enable(this.group);

		this._createBox(180, 130, 3);
		this._createBox(180, 195, 1);

		this._createBox(300, 380, 3);
		this._createBox(300, 445, 1);

		this._createBox(500, 200, 3);
		this._createBox(500, 265, 2);
		this._createBox(500, 330, 1);

		this._createBox(500, 510, 3);
		this._createBox(500, 530, 1);

		this._createBox(780, 120, 3);
		this._createBox(780, 140, 1);

		this._createBox(780, 315, 3);
		this._createBox(780, 380, 2);
		this._createBox(780, 445, 1);

		this._createBox(980, 200, 3);
		this._createBox(980, 265, 1);

		this._createBox(1100, 455, 3);
		this._createBox(1100, 520, 1);

		//this._createBox(800, 300, 0);
	}

	collide(player) {
		this.game.physics.arcade.collide(player.sprite, this.group);
	}

	_createBox(x, y, frame) {
		const box = this.group.create(x, y, 'box', frame);
		box.body.immovable = true;
		box.anchor.setTo(0.5, 0);

		this.gameObjects.add(box, true);
	}
}

export default Boxes;