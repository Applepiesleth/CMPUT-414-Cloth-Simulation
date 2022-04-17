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
                    this.masses.push(new Mass(i * (width / size) - width/2, j * (width / size) - width/2, 0, 8,[1.0,1.0,0.0,1.0], true))
                } else {
                    this.masses.push(new Mass(i * (width / size) - width/2, j * (width / size)  - width/2, 0, 6,[1.0,0.0,0.0,1.0], false))
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
    draw(viewMatrix) {
        this.drawMasses(viewMatrix);
        this.drawSprings(viewMatrix);
    }

    /** Draws the masses onto canvas as points */
    drawMasses(viewMatrix) {

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

        this.mvpMatrix = new Matrix4();
        this.mvpMatrix.set(viewMatrix);

        gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

        gl.drawArrays(gl.POINTS, 0, this.pointNum);
    }

    /** 
     *  Draws the springs onto canvas as lines connecting points 
     *  @param {Matrix4} viewMatrix Matrix to render cloth in a certain perspective
     */
    drawSprings(viewMatrix) {

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

        this.mvpMatrix = new Matrix4();
        this.mvpMatrix.set(viewMatrix);

        gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

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

        this.springs.forEach(spring => spring.applyForces());
        this.masses.forEach(mass => mass.simulate(delta))
    }
}