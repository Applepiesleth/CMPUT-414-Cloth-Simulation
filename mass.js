class Mass {

    constructor(x, y, z, ps, c) {
        this.x = x;
        this.y = y; 
        this.z = z;
        this.ps = ps;
        this.c = c;
        this.viewMatrix = new Matrix4();

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");

    }

    /**
     * Draws single point on canvas
     */
    draw(viewMatrix) {

        this.vertex = new Float32Array(3);
        this.vertex[0] = this.x;
        this.vertex[1] = this.y;
        this.vertex[2] = this.z;
        this.vertexBuffer = initArrayBufferForLaterUse(this.vertex, 3, gl.FLOAT);

        this.size = new Float32Array(1);
        this.size[0] = this.ps
        this.sizeBuffer = initArrayBufferForLaterUse(this.size, 1, gl.FLOAT);

        this.color = new Float32Array(4);
        this.color[0] = this.c[0];
        this.color[1] = this.c[1];
        this.color[2] = this.c[2];
        this.color[3] = this.c[3];
        this.colorBuffer = initArrayBufferForLaterUse(this.color, 4, gl.FLOAT);

        console.log(this.color)

        initAttributeVariable(this.a_Position, this.vertexBuffer);
        initAttributeVariable(this.a_PointSize, this.sizeBuffer);
        initAttributeVariable(this.a_Color, this.colorBuffer);

        this.mvpMatrix = new Matrix4();
        this.mvpMatrix.set(viewMatrix);

        gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

        gl.drawArrays(gl.POINTS, 0, 1);

    }

    getDraw() {
        return [[this.x,this.y,this.z], [this.ps], this.c];
    }
};