class Spring {

    /**
     * Constructor for a Spring in a Mass-Spring model
     * @param {Mass} m1 First mass to connect to
     * @param {Mass} m2 Second mass to connect to
     */
    constructor(m1, m2) {
        /** @type {Mass} */
        this.m1 = m1;
        /** @type {Mass} */
        this.m2 = m2; 

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");

    }

    /** Returns values necessary to draw mass on canvas */
    getDraw() {
        return [this.m1.getDraw(), this.m2.getDraw()]
    }

    /** Apply spring forces on connected masses */
    applyForces() {
        //TODO
    }

};