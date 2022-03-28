class Square {

    constructor(x, y, c, dir, parent) {
        this.x = x;
        this.y = y;
        this.c = c;
        this.dir = dir;
        // view matrix is copied to prevent changing it
        this.viewMatrix = new Matrix4();
        this.parent = parent;

        // coordinates of square on origin
        // a mirrored version is used for squares rotating in relation
        // to other side
        if (this.dir == 1 || this.dir == 3 || this.dir == 0) {
            this.coords = [
                0.0, 0.0, 0.0,
                0.2, 0.0, 0.0,
                0.0, 0.0, 0.2,
                0.2, 0.0, 0.2,
            ];
        } else {
            this.coords = [
                0.0, 0.0, 0.0,
                -0.2, 0.0, 0.0,
                0.0, 0.0, -0.2,
                -0.2, 0.0, -0.2,
            ];
        }

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");
    }

    /**
     * Draws square object onto the canvas
     */
    draw(viewMatrix) {
        this.generateModelMatrix();

        this.vertex = new Float32Array(16);
        for (let i = 0; i < 12; i++) {
            this.vertex[i] = this.coords[i];
        }
        this.vertexBuffer = initArrayBufferForLaterUse(this.vertex, 3, gl.FLOAT);

        this.color = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            this.color[i] = this.c[i%4];
        }
        this.colorBuffer = initArrayBufferForLaterUse(this.color, 4, gl.FLOAT);

        initAttributeVariable(this.a_Position, this.vertexBuffer);
        initAttributeVariable(this.a_Color, this.colorBuffer);

        // view matrix is copied to prevent changing it
        this.mvpMatrix = new Matrix4();
        this.mvpMatrix.set(viewMatrix);
        this.mvpMatrix.concat(this.modelMatrix); 


        gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);
 
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Helper function for generating the model matrix with relation
     * to parent's model matrix (if parent exists)
     */
    generateModelMatrix() {
        this.modelMatrix = new Matrix4();
        
        
        if (this.parent != null) {
            this.modelMatrix.set(this.parent.modelMatrix);
        } else {
                this.modelMatrix.setTranslate(0, 0, 0);
        }

        // centers squares that used mirrored coordinates
        if (this.dir == 2 || this.dir == 4) {
            if (this.parent == null || this.parent.parent == null)
            {
                this.modelMatrix.setTranslate(0.2, 0, 0.2);
            }
        }

        if (this.dir == 1) {
            this.modelMatrix.translate(this.x, 0, this.y);
            this.modelMatrix.rotate(angle, 0, 0, 1);
        } else if (this.dir == 2) {
            this.modelMatrix.translate(this.x, 0, this.y);
            this.modelMatrix.rotate(-angle, 0, 0, 1);
            //this.modelMatrix.rotate(180, 0, 0, 1); 
        } else if (this.dir == 3) {
            this.modelMatrix.translate(this.x, 0, this.y);
            this.modelMatrix.rotate(-angle, 1, 0, 0);
        } else if (this.dir == 4) {
            this.modelMatrix.translate(this.x, 0, this.y);
            this.modelMatrix.rotate(angle, 1, 0, 0);
            //this.modelMatrix.rotate(180, 1, 0, 0);
        }
    }

};