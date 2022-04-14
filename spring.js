class Spring {

    constructor(m1, m2) {
        this.m1 = m1;
        this.m2 = m2; 

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");

    }

    getDraw() {
        return [this.m1.getDraw(), this.m2.getDraw()]
    }

};