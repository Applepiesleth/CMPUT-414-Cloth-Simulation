class Mass {

    constructor(x, y, z, ps, c) {
        this.x = x;
        this.y = y; 
        this.z = z;
        this.ps = ps;
        this.c = c;
        this.viewMatrix = new Matrix4();

        this.vel = [0, 0, 0];
        this.force = [0, 0, 0];
        this.mass = 1;

        this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
        this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
        this.a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
        this.u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");

    }

    getDraw() {
        return [[this.x,this.y,this.z], [this.ps], this.c];
    }

    resetForces() {
        this.force = [0, -9.81, 0];
    }

    simulate(delta) {
        this.vel = [this.vel[0] + this.force[0] * delta / this.mass,
                    this.vel[1] + this.force[1] * delta / this.mass,
                    this.vel[2] + this.force[2] * delta / this.mass]

        this.x = this.x + this.vel[0] * delta;
        this.y = this.y + this.vel[1] * delta;
        this.z = this.z + this.vel[2] * delta;
    }
};