class Cloth {

    constructor(size) {
        this.size = size;
        this.masses = [];
        this.springs = [];

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.masses.push(new Mass(i * 0.1,j * 0.1, 0, 5,[1.0,0.0,0.0,1.0]))
            }
            
        }
        
        for (let i = 0; i < this.masses.length - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + 1]));
            }
        }
        for (let i = 0; i < this.masses.length - size; i++) {

            this.springs.push(new Spring(this.masses[i], this.masses[i + size]));
        }
        for (let i = 0; i < this.masses.length - size - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size + 1]));
            }
        }
        for (let i = 0; i < this.masses.length - size; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size - 1]));
            }
        }
        
    }

    /**
     * Draws square object onto the canvas
     */
    draw(viewMatrix) {

        for (let i = 0; i < this.masses.length; i++) {
            this.masses[i].draw(viewMatrix);
        }

        for (let i = 0; i < this.springs.length; i++) {
            this.springs[i].draw(viewMatrix);
        }
          
    }
}