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

        this.l0 = Math.sqrt((m1.x-m2.x)*(m1.x-m2.x) + (m1.y-m2.y)*(m1.y-m2.y) + (m1.z-m2.z)*(m1.z-m2.z));
        this.ks = 1000.0;
        this.kd = 0.7;

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
        //Check for stationary, determines distribution of force to each endpoint
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
        var len = Math.sqrt(dx*dx +dy*dy + dz+dz);
        if(len == 0){len = 0.0001;}
        var sd = len-this.l0;//spring rest distance

        var ndx = dx/len; //normalized difference
        var ndy = dy/len;
        var ndz = dz/len;

        //Calc forces
        //Spring force
        var fk = this.ks*sd;

        //Damping force
        var dv = [0,0,0];
        // calc velocity difference
        for(let i=0;i<3; i++){
            dv[i] = this.m1.vel[i]-this.m2.vel[i]
        }
        var dot = ndx*dv[0] + ndy*dv[1] + ndz*dv[2];
        
        var fd = this.kd*dot;//final damping force


        //Sum Forces
        var ft = fd+fk

        //Apply acceleration to masses
        this.m1.force[0] += -ndx*ft*amt1;
        this.m1.force[1] += -ndy*ft*amt1;
        this.m1.force[2] += -ndz*ft*amt1;
        this.m2.force[0] += ndx*ft*amt2;
        this.m2.force[1] += ndy*ft*amt2;
        this.m2.force[2] += ndz*ft*amt2;

        if (ft>1000){
            //mark tearing
        }
    }

};