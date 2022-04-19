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

  var fileReader = document.getElementById('patternUpload');
  fileReader.addEventListener('change', processImageUpload);

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

function processImageUpload(ev) {
  var file = ev.target.files[0];

  var imageCanvas = document.getElementById('imageCanvas');
  var iCv = imageCanvas.getContext("2d");

  var img = new Image();
  img.onload = function() {
    iCv.drawImage(this, 0, 0);
    var imageArray = takeInputImage(iCv.getImageData(0, 0, img.width, img.height));
    var vertices = checkVertices(imageArray);
  }
  img.onerror = function() {
    console.log('the heck');
  }
  img.src = URL.createObjectURL(file);
}

// Takes an input image canvas and returns an array of black and white pixels
function takeInputImage(inputImage) {
  var w = inputImage.width;
  var h = inputImage.height;
  var img = inputImage.data;

  var finalArray = new Array(h);
  var j = -1;
  for (var i = 0; i < h; i++) {
    finalArray[i] = new Array(w);
    for (var j = 0; j < w; j++) {
      var idx = (i*w*4 + j*4);
      var r = img[idx];
      var g = img[idx+1];
      var b = img[idx+2];
      // use https://en.wikipedia.org/wiki/Grayscale to convert to grayscale
      var avg = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      var val = 1;
      if (avg < 0.5)  val = 0;
      finalArray[i][j] = val;
    }
  }
  return finalArray;
}

// Takes a 2d array in the form of a grayscale image and returns an array of tuples
// containing the coordinates of the image's vertices
function checkVertices(image) {
  // go through the image and any black pixel that
  // is at the edge of the image or places where
  // 4 lines intersect. Possibly only 1 pixel wide lines
  // allowed
  var h = image.length;
  if (h == 0) {
    console.error('Invalid image.');
    return;
  }
  var w = image[0].length;
  if (w == 0) {
    console.error('Invalid image.');
    return;
  }
  var vertices = [];
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var p = image[i][j];
      if (!p) {
        if (i == 0 || j == 0 || i == h || j == w) {
          if (checkVerticesArray(vertices, i, j)) vertices.push([i, j]);
        } else {
          // section array to 3x3 section
          var isVertice = checkCurrentForVertice();
          if (isVertice) {
            if (checkVerticesArray(vertices, i, j)) vertices.push([i, j]);
          }
        }
      }
    }
  }
  return vertices;
}

// Takes a 3x3 section of the image as input
// and returns a boolean depending on if there
// is a vertice in the section or not. 
function checkCurrentForVertice(imageSection) {
  return false;
}

function checkVerticesArray(vertices, i, j) {
  var verticeExists = false;
  for (var v in vertices) {
    if (checkDistance(i, j, v[0], v[1])) {
      verticeExists = true;
      break;
    }
  }
  return verticeExists;
}

function checkDistance(x1, y1, x2, y2) {
  var dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return dist <= Math.sqrt(2);
}