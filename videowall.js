//Single matrix element
class Element {
	constructor (x, y, index) {
		this.x = x
		this.y = y
		//index in entire set
		this.index = index
		//index in subset
		this.outputId = 1
		this.owner = null
	}

	changeOwner (newOwner) {
		if (this.owner) {
			this.owner.removeElement(this)
		}
		this.owner = newOwner
	}
}

//Disjoint set. Owns unique matrix elements that can only exist in one subset at a time.
//Keeps track of the 2d orthogonal bounding box that it's elements fit inside of.
class Subset {
	#hasNewChanges
	constructor (id, maxX, maxY, elements) {
		this.id = id
		this.maxX = maxX
		this.maxY = maxY
		if (elements) {
			this.elements = elements
			this.elements.forEach((element) => element.changeOwner(this))
			this.calculateBounds()
			this.assignOutputIds()
		} else {
			this.boundingBox = undefined
			this.elements = []
		}
		this.#hasNewChanges = true
	}
	get width () {
		if (this.boundingBox === undefined) return 0
		return this.boundingBox.x2 - this.boundingBox.x1 + 1
	}

	get height () {
		if (this.boundingBox === undefined) return 0
		return this.boundingBox.y2 - this.boundingBox.y1 + 1
	}

	get hasNewChanges () {
		if (this.#hasNewChanges) {
			this.#hasNewChanges = false
			return true
		}
		return false
	}

	peekChanges () {
		return this.#hasNewChanges
	}

	isElementInBounds (element) {
		if (this.boundingBox === undefined) return false
		return (
			element.x >= this.boundingBox.x1 &&
			element.x <= this.boundingBox.x2 &&
			element.y >= this.boundingBox.y1 &&
			element.y <= this.boundingBox.y2
		)
	}

	calculateBounds () {
		const oldBounds = this.boundingBox
		if (this.elements.length === 0) {
			this.boundingBox = undefined
			// Can't apply changes for an empty subset so no need to check for them
			return
		}
		if (this.elements.length === 1) {
			const element = this.elements[0]
			this.boundingBox = {
				x1: element.x,
				y1: element.y,
				x2: element.x,
				y2: element.y
			}
		} else {
			let bounds = { x1: this.maxX, y1: this.maxY, x2: 0, y2: 0 }
			this.elements.forEach((element) => {
				bounds.x1 = Math.min(element.x, bounds.x1)
				bounds.x2 = Math.max(element.x, bounds.x2)
				bounds.y1 = Math.min(element.y, bounds.y1)
				bounds.y2 = Math.max(element.y, bounds.y2)
			})
			this.boundingBox = bounds
		}
		// True when first calculating bounds with not empty array of elements provided to constructor
		if (oldBounds === undefined) {
			this.#hasNewChanges = true
			return
		}
		Object.keys(this.boundingBox).forEach((corner) => {
			if (this.boundingBox[corner] !== oldBounds[corner]) {
				this.#hasNewChanges = true
				return
			}
		})
	}

	adjustBounds () {
		// This only ever gets called if the new element wasn't in old bounds -> the bounds have changed
		this.#hasNewChanges = true
		const newElement = this.elements.at(-1)
		if (this.elements.length === 1) {
			this.boundingBox = {
				x1: newElement.x,
				y1: newElement.y,
				x2: newElement.x,
				y2: newElement.y
			}
		} else {
			this.boundingBox.x1 = Math.min(newElement.x, this.boundingBox.x1)
			this.boundingBox.x2 = Math.max(newElement.x, this.boundingBox.x2)
			this.boundingBox.y1 = Math.min(newElement.y, this.boundingBox.y1)
			this.boundingBox.y2 = Math.max(newElement.y, this.boundingBox.y2)
		}
	}

	assignOutputIds () {
		this.elements.forEach((element) => {
			element.outputId = element.x - this.boundingBox.x1 + this.width * (element.y - this.boundingBox.y1) + 1
		})
	}

	addElement (element) {
		if (this.elements.includes(element)) return
		element.changeOwner(this)
		this.elements.push(element)
		if (this.elements.length === 1 || !this.isElementInBounds(element)) {
			this.adjustBounds()
		}
		this.assignOutputIds()
	}

	removeElement (element) {
		if (this.elements.length !== 0) {
			this.elements.splice(this.elements.indexOf(element), 1)
			this.calculateBounds()
			this.assignOutputIds()
		}
	}

	clear () {
		this.elements.forEach((element) => {
			element.owner = null
		})
		this.elements.length = 0
	}
}

//Contains the wall partition (how the wall is divided into subsets) and dimensions of  the wall
export class VideoWall {
	constructor (rows, columns) {
		this.rows = rows
		this.columns = columns
		this.maxSubsets = rows * columns
		this.wall = this.newWall(rows, columns)
		const subset = new Subset(1, columns, rows, this.elements)
		this.subsets = [subset]
	}

	get elements () {
		return this.wall.flat()
	}

	newWall (rows, columns) {
		let i = 0
		const wall = [...Array(rows).keys()].map(
			(y) => (y = [...Array(columns).keys()].map((x) => (x = new Element(x, y, i++))))
		)
		return wall
	}

	addSubset () {
		const subset = new Subset(this.subsets.length + 1, this.columns, this.rows)
		this.subsets.push(subset)
		return subset
	}

	clear () {
		this.subsets.forEach((subset) => {
			subset.clear()
		})
		this.wall = this.newWall(this.rows, this.columns)
		this.subsets.length = 0
		this.subsets = [new Subset(1, this.columns, this.rows, this.elements)]
	}

	removeEmptySubsets () {
		const hasEmpties = this.subsets.some((subset) => subset.elements.length === 0)
		if (!hasEmpties) return false
		this.subsets = this.subsets.filter((subset) => subset.elements.length > 0)
		this.subsets.forEach((subset, index) => {
			subset.id = index + 1
		})
		return true
	}
}
