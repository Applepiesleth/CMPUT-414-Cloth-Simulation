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
        //Check for stationary
        var amt1 = 0.5;
        var amt2 = 0.5;
        if(this.m1.stationary){
            amt1 = 0.0;
            amt2 = 1.0;
        }
        else if(this.m1.stationary){
            amt1 = 1.0;
            amt2 = 0.0;
        }

        //Get mass distance
        var dx = this.m1.x - this.m2.x;
        var dy = this.m1.y - this.m2.y;
        var dz = this.m1.z - this.m2.z;

        //Calc forces
        var k = 700;
        var fkx = -k*dx;
        var fky = -k*dy;
        var fkz = -k*dz;

        var c = 0.0;
        var fd1x = c*this.m1.vel[0];
        var fd1y = c*this.m1.vel[1];
        var fd1z = c*this.m1.vel[2];
        var fd2x = c*this.m2.vel[0];
        var fd2y = c*this.m2.vel[1];
        var fd2z = c*this.m2.vel[2];


        //Sum Forces
        var ft1x = fkx+fd1x;
        var ft1y = fky+fd1y;
        var ft1z = fkz+fd1z;
        var ft2x = -fkx-fd2x;
        var ft2y = -fky-fd2y;
        var ft2z = -fkz-fd2z;

        //Apply acceleration
        //this.m1.force = [ft1x,ft1y,ft1z];
        //this.m2.force = [ft2x,ft2y,ft2z];
        this.m1.force[0] += ft1x*amt1;
        this.m1.force[1] += ft1y*amt1;
        this.m1.force[2] += ft1z*amt1;
        this.m2.force[0] += ft2x*amt2;
        this.m2.force[1] += ft2y*amt2;
        this.m2.force[2] += ft2z*amt2;

        
    }

};