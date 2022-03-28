class Spring {

    constructor(m1, m2) {
        this.m1 = m1;
        this.m2 = m2; 

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");

    }

    /**
     * Generates horizontal or vertical line with width, according to points s and e.
     * Width and colour may vary. 
     */ 
    draw(viewMatrix) {
        this.vertex = new Float32Array(6);
        this.vertex[0] = this.m1.x;
        this.vertex[1] = this.m1.y;
        this.vertex[2] = this.m1.z;
        this.vertex[3] = this.m2.x;
        this.vertex[4] = this.m2.y;
        this.vertex[5] = this.m2.z;
        this.vertexBuffer = initArrayBufferForLaterUse(this.vertex, 3, gl.FLOAT);

        this.color = new Float32Array(8);
        this.color[0] = this.m1.c[0];
        this.color[1] = this.m1.c[1];
        this.color[2] = this.m1.c[2];
        this.color[3] = this.m1.c[3];
        this.color[4] = this.m2.c[0];
        this.color[5] = this.m2.c[1];
        this.color[6] = this.m2.c[2];
        this.color[7] = this.m2.c[3];
        this.colorBuffer = initArrayBufferForLaterUse(this.color, 4, gl.FLOAT);

        this.size = new Float32Array(2);
        this.size[0] = this.m1.ps;
        this.size[1] = this.m2.ps;
        this.sizeBuffer = initArrayBufferForLaterUse(this.size, 1, gl.FLOAT);

        initAttributeVariable(this.a_Position, this.vertexBuffer);
        initAttributeVariable(this.a_Color, this.colorBuffer);

        this.mvpMatrix = new Matrix4();
        this.mvpMatrix.set(viewMatrix);

        gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
 
        gl.drawArrays(gl.LINES, 0, 2);
    }

};