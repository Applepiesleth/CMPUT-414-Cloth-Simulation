class Cloth {

    constructor(size) {
        this.size = size;
        this.pointNum = size * size;
        this.masses = [];
        this.springs = [];

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.masses.push(new Mass(i * 0.1,j * 0.1, 0, 5,[1.0,0.0,0.0,1.0]))
            }
            
        }
        
        for (let i = 0; i < this.pointNum - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + 1]));
            }
        }
        for (let i = 0; i < this.pointNum - size; i++) {
            this.springs.push(new Spring(this.masses[i], this.masses[i + size]));
        }
        for (let i = 0; i < this.pointNum - size - 1; i++) {
            if (i%size != size - 1) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size + 1]));
            }
        }
        for (let i = 0; i < this.pointNum - size; i++) {
            if (i%size != size) {
                this.springs.push(new Spring(this.masses[i], this.masses[i + size - 1]));
            }
        }

        this.springNum = this.springs.length;
        console.log(this.springNum);

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");
    }

    draw(viewMatrix) {
        this.drawMasses(viewMatrix);
        this.drawSprings(viewMatrix);
    }

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

    simulate(delta) {
        for (let i = 0; i < this.pointNum; i++) {
            this.masses[i].resetForces();
            this.masses[i].simulate(delta);
        }
    }
}