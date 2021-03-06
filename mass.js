/**
 * Mass element of a Mass-Spring model
 */
class Mass {

    /**
     * Constructor for a mass in a mass-spring model
     * @param {Number} x Initial x-position
     * @param {Number} y Initial y-position
     * @param {Number} z Initial z-position
     * @param {Number} ps Size of point
     * @param {Array} c RGBA Colour of point
     * @param {boolean} stationary If point is stationary
     */
    constructor(x, y, z, ps, c, stationary) {
        this.x = x;
        this.y = y; 
        this.z = z;
        this.ps = ps;
        this.c = c;
        this.stationary = stationary;

        this.vel = [0, 0, 0];
        this.force = [0, 0, 0];
        this.mass = 0.5;

        // Mass indices connected to this mass; used for generating a weave pattern
        this.connections = [];

    }

    /** Returns values necessary to draw mass on canvas */
    getDraw() {
        return [[this.x,this.y,this.z], [this.ps], this.c];
    }

    /** Reset forces on mass to only gravity */
    resetForces() {
        this.force = [0, -1*this.mass, 0];
    }

    /** 
     * Simulate physics of mass
     *  @param {Number} delta Change in time
     */
    simulate(delta) {
        if (!this.stationary) {
            this.vel = [this.vel[0] + this.force[0] * delta / this.mass,
                    this.vel[1] + this.force[1] * delta / this.mass,
                    this.vel[2] + this.force[2] * delta / this.mass]

        this.x = Math.min(1.5,Math.max(-1.5,this.x + this.vel[0] * delta));
        this.y = Math.min(1.0,Math.max(-1.0,this.y + this.vel[1] * delta));
        this.z = Math.min(1.0,Math.max(-1.0,this.z + this.vel[2] * delta));
        }
    }
};