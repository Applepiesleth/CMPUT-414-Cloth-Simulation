class Cloth {

    /**
     * A mass=spring cloth model
     * @param {Number} size Number of nodes in the cloth
     * @param {Number} expanse How large the cloth is on the canvas
     */
    constructor(size, expanse) {
        this.size = size;
        this.expanse = expanse;
        this.pointNum = size * size;
        this.masses = [];
        this.springs = [];

        var width = expanse / 2.0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // Create stationary masses on top corners
                if (j == size - 1 && (i == 0 || i == size - 1)) {
                    this.masses.push(new Mass(i * (width / (size-1)) - width/2, j * (width / (size-1)) - width/2, 0, 8,[1.0,1.0,0.0,1.0], true))
                } else {
                    this.masses.push(new Mass(i * (width / (size-1)) - width/2, j * (width / (size-1))  - width/2, 0, 6,[1.0,0.0,0.0,1.0], false))
                }
            }
        }
        
        // horizontal and vertical springs
        for (let i = 0; i < this.pointNum - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + 1]));
            }
        }
        for (let i = 0; i < this.pointNum - size; i++) {
            this.springs.push(new Spring(this.masses[i], this.masses[i + size]));
        }

        // diagonal springs
        for (let i = 0; i < this.pointNum - size - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size + 1]));
            }
        }
        for (let i = 0; i < this.pointNum - size; i++) {
            if (i%size != 0) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size - 1]));
            }
        }

        this.springNum = this.springs.length;

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");
    }

    /** Draw the masses and springs of this cloth onto canvas */
    draw() {
        this.drawMasses();
        this.drawSprings();
    }

    /** Draws the masses onto canvas as points */
    drawMasses() {

        this.vertices = new Float32Array(this.pointNum * 3);
        this.sizes = new Float32Array(this.pointNum);
        this.colors = new Float32Array(this.pointNum * 4);

        for (let i = 0; i < this.pointNum; i++) {
            var data = this.masses[i].getDraw();

            for (let j = 0; j < 3; j++) {
                this.vertices[(i * 3) + j] = data[0][j];
            }
            this.sizes[i] = data[1][0];
            for (let j = 0; j < 4; j++) {
                this.colors[(i * 4) + j] = data[2][j];
            }
        }

        this.vertexBuffer = initArrayBufferForLaterUse(this.vertices, 3, gl.FLOAT);
        this.sizeBuffer = initArrayBufferForLaterUse(this.sizes, 1, gl.FLOAT);
        this.colorBuffer = initArrayBufferForLaterUse(this.colors, 4, gl.FLOAT);

        initAttributeVariable(this.a_Position, this.vertexBuffer);
        initAttributeVariable(this.a_PointSize, this.sizeBuffer);
        initAttributeVariable(this.a_Color, this.colorBuffer);

        gl.drawArrays(gl.POINTS, 0, this.pointNum);
    }

    /** 
     *  Draws the springs onto canvas as lines connecting points 
     *  @param {Matrix4} viewMatrix Matrix to render cloth in a certain perspective
     */
    drawSprings() {

        this.vertices = new Float32Array(this.springNum * 2 * 3);
        this.sizes = new Float32Array(this.springNum * 2);
        this.colors = new Float32Array(this.springNum * 2 * 4);

        for (let i = 0; i < this.springNum; i++) {
            var data = this.springs[i].getDraw();

            for (let j = 0; j < 3; j++) {
                this.vertices[(i * 6) + j] = data[0][0][j];
            }
            this.sizes[(i * 2)] = data[0][1][0];
            for (let j = 0; j < 4; j++) {
                this.colors[(i * 8) + j] = data[0][2][j];
            }

            for (let j = 0; j < 3; j++) {
                this.vertices[(i * 6) + 3 + j] = data[1][0][j];
            }
            this.sizes[(i * 2) + 1] = data[1][1][0];
            for (let j = 0; j < 4; j++) {
                this.colors[(i * 8) + 4 + j] = data[1][2][j];
            }
        }

        this.vertexBuffer = initArrayBufferForLaterUse(this.vertices, 3, gl.FLOAT);
        this.sizeBuffer = initArrayBufferForLaterUse(this.sizes, 1, gl.FLOAT);
        this.colorBuffer = initArrayBufferForLaterUse(this.colors, 4, gl.FLOAT);

        initAttributeVariable(this.a_Position, this.vertexBuffer);
        initAttributeVariable(this.a_PointSize, this.sizeBuffer);
        initAttributeVariable(this.a_Color, this.colorBuffer);

        gl.drawArrays(gl.LINES, 0, this.springNum * 2);
    }

    /** 
     *  Perform physics simulations of masses and springs 
     *  @param {Number} delta Change in time
     */
    simulate(delta) {

        for (let i = 0; i < this.pointNum; i++) {
            this.masses[i].resetForces();
        }

        this.springs.forEach(spring => spring.applyForces(this));
        this.masses.forEach(mass => mass.simulate(delta))
    }

    /*
    Stretches the cloth from the given center point (cx,cy,cz)
    */
    stretch(cx,cy,cz,amount) {
        this.masses.forEach(mass => this.stretchOne(mass,cx,cy,cz,amount));
    }

    stretchOne(mass,cx,cy,cz,amount){
        var dx = mass.x - cx;
        var dy = mass.y - cy;
        var dz = mass.z - cz;
        var len = Math.sqrt(dx*dx + dy*dy + dz*dz);

        mass.x = mass.x + dx*amount;
        mass.y = mass.y + dy*amount;
        mass.z = mass.z + dz*amount;
    }

    removeSpring(spring) {
        this.springs.splice(this.springs.indexOf(spring),1);
        this.springNum -= 1;
    }

    /*Tears along the given line t1 to t2*/
    tearLine(t1x,t1y,t2x,t2y){
        //console.log("try tear");
        this.springs.forEach(spring => spring.checkTearLine(t1x,t1y,t2x,t2y));
    }


    /**
     * Remakes cloth from the vertices obtained from an image
     * @param {Array} vertices Array of coordinates to be placed
     * @param {Number} width Width of image cloth 
     */
    loadPoints(vertices, width) {
        this.pointNum = vertices.length;
        
        this.masses = [];
        this.springs = [];
        
        // a mass is added for each vertex found from the image
        var ratio = 1.0 * this.expanse / width / 2;
        vertices.forEach(vertex => this.masses.push(new Mass(vertex[1] * ratio - (this.expanse / 4), vertex[0] * ratio - (this.expanse / 4), 0, 6,[1.0,0.0,0.0,1.0], false)))
        
        // Determine Stationary points
        var topLeft = 0
        var topRight = 0
        for (let i = 0; i < this.pointNum; i++) { 
            // The top-left most and top-right most nodes are determined based of x^3 + y^3 distance from center
            if (Math.pow(this.masses[i].x * -1, 3) + Math.pow(this.masses[i].y, 3) > Math.pow(this.masses[topLeft].x * -1, 3) + Math.pow(this.masses[topLeft].y, 3)) {
                topLeft = i;
            }
            if (Math.pow(this.masses[i].x, 3) + Math.pow(this.masses[i].y, 3) > Math.pow(this.masses[topRight].x, 3) + Math.pow(this.masses[topRight].y, 3)) {
                topRight = i;
            }
        }
        this.masses[topLeft].stationary = true;
        this.masses[topLeft].c = [1.0,1.0,0.0,1.0];
        this.masses[topRight].stationary = true;
        this.masses[topRight].c = [1.0,1.0,0.0,1.0];

        // Connect masses to nearby masses
        for (let i = 0; i < this.pointNum; i++) {
            // Masses are connected to other masses until it has at least 4 connections
            while(this.masses[i].connections.length < 4) {
                // the closest node that hasn't already been connected to is found
                var closest = 0;
                var lowestDist = Number.MAX_VALUE;
                for (let j = 0; j < this.pointNum; j++) {
                    if (j != i && !this.masses[j].connections.includes(i)) {
                        var dist = Math.pow(this.masses[i].x - this.masses[j].x, 2) + Math.pow(this.masses[i].y - this.masses[j].y, 2); 
                        if (dist < lowestDist) {
                            lowestDist = dist;
                            closest = j; 
                        }
                    } 
                }
                this.springs.push(new Spring(this.masses[i], this.masses[closest]));
                this.masses[i].connections.push(closest);
                this.masses[closest].connections.push(i);
            }
        }

        this.springNum = this.springs.length;
    }
}