// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; // attribute variable
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  attribute float a_PointSize;
  varying vec4 color;
  void main () {
    gl_Position = u_MvpMatrix*a_Position;
    gl_PointSize = a_PointSize;
    color = a_Color;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float; // This is required
varying vec4 color;
void main () {
  gl_FragColor = color;
}
`;

const mode = 1;

const red = [1.0, 0.0, 0.0, 1.0];
const green = [0.0, 1.0, 0.0, 1.0];
const purple = [1.0, 0.0, 1.0, 1.0];
const blue = [0.0, 0.0, 1.0, 1.0];
const cyan = [0.0, 1.0, 1.0, 1.0];
const yellow = [1.0, 1.0, 0.0, 1.0]

var eye_x = -0.1; // current eye x
var eye_z = -0.1;
var prev_x = 0; // For detecting change of mouse x.

var cloth;

var gl;
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  var text = document.getElementById('text');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix
  let u_MvpMatrix = gl.getUniformLocation(gl.program,"u_MvpMatrix");
  let viewMatrix = new Matrix4(); // The view matrix

  // Calculate the view and projection matrix
  viewMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  viewMatrix.setLookAt(-0.1, -0.1, -0.1, 0, 0, 0, 0, 1, 0);
  
  gl.uniformMatrix4fv(u_MvpMatrix, false, viewMatrix.elements);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  cloth = new Cloth(15, 1);

  cloth.draw(viewMatrix);

  document.onkeydown = function(ev){changeView(ev, viewMatrix, canvas); };

  // Every 40ms, physics is performed and image is rendered
  setInterval(function(){ 
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // eye_x += 0.02;
    viewMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    viewMatrix.setLookAt(Math.sin(eye_x) * 0.1, 0.05, Math.cos(eye_x) * 0.1, 0, 0, 0, 0, 1, 0);

    cloth.simulate(0.02);
    cloth.draw(viewMatrix);
    console.log("refresh");

  }, 40);
  
}

// Allows for changing of view using arrow keys
function changeView(ev, viewMatrix, canvas) {
  switch(ev.keyCode){
    case 39: eye_x += 0.01; break;  // The right arrow key was pressed
    case 37: eye_x -= 0.01; break;  // The left arrow key was pressed
  }

  viewMatrix = new Matrix4(); // The view matrix

  // Calculate the view and projection matrix
  viewMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  viewMatrix.setLookAt(eye_x, -0.1, -0.1, 0, 0, 0, 0, 1, 0);
  
}