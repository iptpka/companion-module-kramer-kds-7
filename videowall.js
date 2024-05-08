//Single matrix element
class Element {
    constructor(x, y, index) {
        this.x = x
        this.y = y
        //index in entire set
        this.index = index
        //index in subset
        this.outputId = 1
        this.owner = null
    }
    
    changeOwner(newOwner) {
        if (this.owner) {this.owner.removeElement(this)}
        this.owner = newOwner
    }
}

//Disjoint set. Owns unique matrix elements that can only exist in one subset at a time.
//Keeps track of the 2d orthogonal bounding box that it's elements fit inside of.
class Subset {
    constructor(id, maxX, maxY, elements) {
        this.id = id
        //empty set if elements not provided
        this.elements = elements || []
        this.maxX = maxX
        this.maxY = maxY
        //calculate bounds only if provided with elements
        if (elements) {
            this.calculateBounds()
            this.elements = elements
        } else {
            this.boundingBox = undefined
            this.elements = []
        }
    }
    get width() {
      return this.boundingBox.x2 - this.boundingBox.x1 + 1;
    } 
  
    get height() {
      return this.boundingBox.y2 - this.boundingBox.y1 + 1;
    }
  
    isElementInBounds(element) {
        return element.x >= this.boundingBox.x1 && 
            element.x <= this.boundingBox.x2 &&
            element.y >= this.boundingBox.y1 &&
            element.y <= this.boundingBox.y2
    }
    
    calculateBounds() {
        if (this.elements.length === 1) {
            const element = this.elements[0]
            this.boundingBox = {x1: element.x, y1: element.y, x2: element.x, y2: element.y}
        } else {
            let bounds = {x1: this.maxX, y1: this.maxY, x2: 0, y2: 0}
            this.elements.forEach((element) => {
                bounds.x1 = Math.min(element.x, bounds.x1)
                bounds.x2 = Math.max(element.x, bounds.x2)
                bounds.y1 = Math.min(element.y, bounds.y1)
                bounds.y2 = Math.max(element.y, bounds.y2)
            })
            this.boundingBox = bounds
        }
    }
    
    adjustBounds(newElement) {
        if (this.elements.length === 1) {
            this.boundingBox = {x1: newElement.x, y1: newElement.y, x2: newElement.x, y2: newElement.y}
        } else {
            this.boundingBox.x1 = Math.min(newElement.x, this.boundingBox.x1)
            this.boundingBox.x2 = Math.max(newElement.x, this.boundingBox.x2)
            this.boundingBox.y1 = Math.min(newElement.y, this.boundingBox.y1)
            this.boundingBox.y2 = Math.max(newElement.y, this.boundingBox.y2)
        }
    }
    
    assignOutputIds() {
        this.elements.forEach((element) => {
            element.outputId = (element.x - this.boundingBox.x1) + this.width * (element.y - this.boundingBox.y1)
        })
    }
    
    addElement(element) {
        if (this.elements.includes(element)) return
        element.changeOwner(this)
        this.elements.push(element)
        if (this.elements.length === 1) {
            this.calculateBounds()
        }else if (!this.isElementInBounds(element)) {
            this.adjustBounds(element)
        }
    }

    removeElement(element) {
        this.elements.pop(element)
    }
}

//Contains all subsets of a certain set partition
class Partition {
    
}


//Contains partitions
export class VideoWall {
    constructor(rows, columns, inputs) {
        this.rows = rows
        this.columns = columns
        this.views = Array(inputs.length)
        let i = 0
        this.wall = [...Array(rows).keys()].map(
            (y) => (y = [...Array(columns).keys()].map((x) => (x = new Element(x, y, i++))))
        );
    }
}