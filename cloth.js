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

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");
    }

    /**
     * Draws square object onto the canvas
     */
    draw(viewMatrix) {

        this.vertices = new Float32Array(this.pointNum * 3);
        this.sizes = new Float32Array(this.pointNum);
        this.colors = new Float32Array(this.pointNum * 4);

        for (let i = 0; i < this.masses.length; i++) {
            //this.masses[i].draw(viewMatrix);
            var data = this.masses[i].getDraw();

            for (let j = 0; j < 3; j++) {
                this.vertices[(i * 3) + j] = data[0][j];
            }
            this.sizes[i] = data[1][0];
            for (let j = 0; j < 4; j++) {
                this.colors[(i * 4) + j] = data[2][j];
            }

            // this.vertices.push(...data[0]);
            // this.sizes.push(...data[1]);
            // this.colors.push(...data[2]);
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

        // for (let i = 0; i < this.masses.length; i++) {
        //     this.masses[i].draw(viewMatrix);
        // }
          
        
    }
}