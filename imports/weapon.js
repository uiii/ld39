import Phaser from './phaser';
import Config from './config';
import {Direction} from './constants';

class Weapon {
	constructor(game, gameObjects, battery, player) {
		this.game = game;
		this.gameObjects = gameObjects;
		this.battery = battery;
		this.player = player;

		this.beam = game.add.graphics(0, 0);
		this.isFiring = false;
		this.fireFrom = new Phaser.Point(0, 0);
		this.fireDirection = null;
	}

	setFireCoordinates(x, y, direction) {
		this.fireFrom = new Phaser.Point(x, y);
		this.fireDirection = direction;
	}

	fire() {
		this.isFiring = true;
	}

	stopFire() {
		this.isFiring = false;
	}

	update() {
		this.beam.clear();

		if (! this.isFiring) {
			return;
		}

		let firingTime = this.game.time.physicsElapsed;
		this.battery.consume(firingTime * Config.weaponPowerConsumption);

		//this.beam.lineStyle(9.5, 0xA000C8);
		this.game.world.bringToTop(this.beam);

		console.log("fire dir", this.fireDirection);

		let beamLine;
		let collisionSide;
		let collisionSort;
		let collisionLineCoordiante;
		switch (this.fireDirection) {
			case Direction.LEFT:
				beamLine = new Phaser.Rectangle(0, this.fireFrom.y, this.fireFrom.x, 2);
				collisionSide = 'right';
				collisionSort = -1;
				collisionLineCoordiante = 'left';
				break;
			case Direction.RIGHT:
				beamLine = new Phaser.Rectangle(this.fireFrom.x, this.fireFrom.y, this.game.world.right - this.fireFrom.x, 2);
				collisionSide = 'left';
				collisionSort = 1;
				collisionLineCoordiante = 'right';
				break;
			case Direction.UP:
				beamLine = new Phaser.Rectangle(this.fireFrom.x, 0, 2, this.fireFrom.y);
				//this.beam.lineWidth = 9.5;
				collisionSide = 'bottom';
				collisionSort = -1;
				collisionLineCoordiante = 'top';
				this.player.sprite.bringToTop();
				break;
			case Direction.DOWN:
				beamLine = new Phaser.Rectangle(this.fireFrom.x, this.fireFrom.y, 2, this.game.world.bottom - this.fireFrom.y);
				//this.beam.lineWidth = 9.5;
				collisionSide = 'top';
				collisionSort = 1;
				collisionLineCoordiante = 'bottom';
				break;
			default:
				return;
				break;
		}

		//const collisionRect = new Phaser.Rectangle(beamLine.left, beamLine.top, Math.max(1, beamLine.right - beamLine.left), Math.max(1, beamLine.bottom - beamLine.top));
		const collisionRect = beamLine;

		const collidingObjects = this.gameObjects.get(true).filter((object) => {
			if (object === this.player.sprite || object.key === 'power-up') {
				return false;
			}

			return Phaser.Rectangle.intersects(object.getBounds(), collisionRect);
		});

		console.log(collisionRect);
		console.log(collidingObjects);
		console.log(beamLine);

		if (collidingObjects.length > 0) {
			collidingObjects.sort((a, b) => collisionSort * (a[collisionSide] - b[collisionSide]));
			console.log(collisionLineCoordiante, Phaser.Rectangle.intersection(collidingObjects[0].getBounds(), collisionRect)[collisionSide]);
			const nearestObject = collidingObjects[0];

			let intersection = Phaser.Rectangle.intersection(nearestObject.getBounds(), collisionRect)[collisionSide];

			if (nearestObject.key.startsWith('robot')) {
				intersection += collisionSort * 20;
				nearestObject.bringToTop();
			}

			beamLine[collisionLineCoordiante] = intersection;
			if (collisionLineCoordiante === 'top') {
				beamLine.y = intersection;
			}
		}

		console.log(beamLine);

		/*this.game.world.bringToTop(this.beam);
		this.beam.moveTo(beamLine.start.x, beamLine.start.y);
		this.beam.lineTo(beamLine.end.x, beamLine.end.y);
		this.beam.lineStyle(2, 0xFFFFFF);
		this.beam.moveTo(beamLine.start.x, beamLine.start.y);
		this.beam.lineTo(beamLine.end.x, beamLine.end.y);
		this.beam.lineStyle(0);*/
		//this.beam.beginFill(0xA000C8);
		this.beam.beginFill(0xFF0000);
		this.beam.drawRect(beamLine.x, beamLine.y, beamLine.width, beamLine.height);
		this.beam.endFill();
	}
}

export default Weapon;