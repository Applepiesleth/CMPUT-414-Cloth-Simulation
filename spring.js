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

        this.l0 = Math.sqrt((m1.x - m2.x) * (m1.x - m2.x) + (m1.y - m2.y) * (m1.y - m2.y) + (m1.z - m2.z) * (m1.z - m2.z));
        this.ks = 3000.0;
        this.kd = 7.5;

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

    }

    /** Returns values necessary to draw mass on canvas */
    getDraw() {
        return [this.m1.getDraw(), this.m2.getDraw()]
    }

    /** Apply spring forces on connected masses */
    applyForces(cloth) {
        //TODO
        //Check for stationary, determines distribution of force to each endpoint
        var amt1 = 0.5;
        var amt2 = 0.5;
        if (this.m1.stationary) {
            amt1 = 0.0;
            amt2 = 1.0;
        }
        else if (this.m1.stationary) {
            amt1 = 1.0;
            amt2 = 0.0;
        }

        //Get mass distance
        var dx = this.m1.x - this.m2.x;
        var dy = this.m1.y - this.m2.y;
        var dz = this.m1.z - this.m2.z;
        var len = Math.sqrt(dx * dx + dy * dy + dz + dz);
        if (len == 0) { len = 0.0001; }
        var sd = len - this.l0;//spring rest distance

        var ndx = dx / len; //normalized difference
        var ndy = dy / len;
        var ndz = dz / len;

        //Calc forces
        //Spring force
        var fk = this.ks * sd;

        //Damping force
        var dv = [0, 0, 0];
        // calc velocity difference
        for (let i = 0; i < 3; i++) {
            dv[i] = this.m1.vel[i] - this.m2.vel[i]
        }
        var dot = ndx * dv[0] + ndy * dv[1] + ndz * dv[2];

        var fd = this.kd * dot;//final damping force


        //Sum Forces
        var ft = Math.max(fd +fk, 0.0);

        //Apply acceleration to masses
        this.m1.force[0] += -ndx * ft * amt1;
        this.m1.force[1] += -ndy * ft * amt1;
        this.m1.force[2] += -ndz * ft * amt1;
        this.m2.force[0] += ndx * ft * amt2;
        this.m2.force[1] += ndy * ft * amt2;
        this.m2.force[2] += ndz * ft * amt2;

        /*if (ft > 200) {
            //Increase stiffness when we have higher tension
            this.ks = Math.min(this.ks+30,3000);
            //mark tearing
            //console.log("stretch tear");
            //cloth.removeSpring(this);
        }
        else{
            this.ks = Math.max(this.ks-20,3000);
        }*/
    }

    /*Helper cross product*/
    cross(x1, y1, x2, y2) {
        return (x1 * y2 - y1 * x2);
    }

    /*
    Checks whether the given line segment intersect the spring for purposes of tearing
    Adapted from https://github.com/pgkelley4/line-segments-intersect/blob/master/js/line-segments-intersect.js
    */
    checkTearLine(t1x, t1y, t2x, t2y) {
        //console.log("try tear: ",this.m1.x,",",this.m1.y," - ",this.m2.x,",",this.m2.y," vs ",t1x,",",t1y," - ", t2x,",",t2y);

        //t=q, self=p
        var rx = this.m2.x - this.m1.x;
        var ry = this.m2.y - this.m1.y;
        var sx = t2x - t1x;
        var sy = t2y - t1y;

        //do cross products
        //q-p
        var uNum = this.cross(t1x - this.m1.x, t1y - this.m1.y, rx, ry);
        var denom = this.cross(rx, ry, sx, sy);

        if (uNum == 0 && denom == 0) {
            //colinear
            //we actually don't want to detect collision here so lets do nothing
            //console.log("colinear dont tear");
            return;
        }

        //check parallel
        if (denom == 0) {
            //console.log("paralell don't tear");
            return;
        }

        var u = uNum / denom;
        var t = this.cross(t1x - this.m1.x, t1y - this.m1.y, sx, sy) / denom;

        if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
            this.m2 = this.m1;
        }
    }


};