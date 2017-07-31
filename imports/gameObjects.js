class GameObjects {
	constructor() {
		this.objects = [];
		this.collidingObjects = [];
	}

	add(object, isColliding = false) {
		this.objects.push(object);

		if (isColliding) {
			this.collidingObjects.push(object);
		}
	}

	get(collidingOnly = false) {
		return collidingOnly ? this.collidingObjects : this.objects;
	}
}

export default GameObjects;