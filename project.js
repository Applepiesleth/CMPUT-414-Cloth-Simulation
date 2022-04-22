// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; // attribute variable
  attribute vec4 a_Color;
  attribute float a_PointSize;
  varying vec4 color;
  void main () {
    gl_Position = a_Position;
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
var prev_y = 0;
var prev_glx = 0; // For detecting change of mouse x in gl space.
var prev_gly = 0;

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
  
  gl.uniformMatrix4fv(u_MvpMatrix, false, viewMatrix.elements);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 0.6);

  gl.enable(gl.DEPTH_TEST);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  cloth = new Cloth(15, 1);

  var fileReader = document.getElementById('patternUpload');
  fileReader.addEventListener('change', processImageUpload);

  cloth.draw(viewMatrix);

  document.onkeydown = function(ev){changeView(ev, viewMatrix, canvas); };

  var dragStart = false;
  function onMouseEvent(ev){
    var rect = canvas.getBoundingClientRect();
    var x = ev.clientX-canvas.offsetLeft;
    var y = ev.clientY-canvas.offsetTop;

    var glx = x/rect.width *2 - 1;
    var gly = x/rect.width *-2 - 1;

    //console.log(ev.type);
    if(ev.type == 'mousemove' && dragStart){
      //drag
      //console.log("drag");
      //console.log("mouse=",glx,",",gly);
      cloth.tearLine(glx,gly,prev_glx,prev_gly);
    }
    else if (ev.type == 'mouseup' && dragStart){
      //release
      //console.log("release");
      dragStart = false;
    }
    else if (ev.type == 'mousedown'){
      //click
      //console.log("click");
      dragStart = true;

    }

    //keep track of prev vals at end
    prev_x = x;
    prev_y = y;
    prev_glx = glx;
    prev_gly = gly;
  }

  canvas.addEventListener('mousedown', onMouseEvent, false);
  canvas.addEventListener('mousemove', onMouseEvent, false);
  canvas.addEventListener('mouseup', onMouseEvent, false);

  // Every 40ms, physics is performed and image is rendered
  setInterval(function(){ 
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // eye_x += 0.02;
    viewMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    viewMatrix.setLookAt(Math.sin(eye_x) * 0.1, 0.05, Math.cos(eye_x) * 0.1, 0, 0, 0, 0, 1, 0);

    cloth.simulate(0.01);
    cloth.draw();
    //console.log("refresh");

  }, 10);
  
}

// Allows for changing of view using arrow keys
function changeView(ev, viewMatrix, canvas) {
  switch(ev.keyCode){
    case 39: eye_x += 0.04; break;  // The right arrow key was pressed
    case 37: eye_x -= 0.04; break;  // The left arrow key was pressed
    case 87: cloth.stretch(0,0.20,0,0.01); break; // W key pressed
    case 83: cloth.stretch(0,0.20,0,-0.01); break; // S key pressed
  }
  
}

// Once an image has been uploaded, move the masses of the current cloth
// to correspond to the weave's vertice locations. 
function updateClothCoordinates(vertices, width) {
  console.log(vertices);
  // update cloth in here
  cloth.loadPoints(vertices, width);
}

// onChange function that triggers when an image is uploaded. This function displays
// the image on a small canvas, converts the image array to a 2d array of binary
// points in black or white, retrieves the vertices, and passes them to update
// the cloth
function processImageUpload(ev) {
  // Retrieve the file from the file uploader.
  var file = ev.target.files[0];

  // Retrieve the image canvas to display the image.
  var imageCanvas = document.getElementById('imageCanvas');
  var iCv = imageCanvas.getContext("2d");

  // Create a new image
  var img = new Image();
  // Create the function that occurs upon the image loading. 
  img.onload = function() {
    // Update the canvas to fit the image and draw the image on the canvas
    imageCanvas.height = img.height;
    imageCanvas.width = img.width;
    iCv.drawImage(this, 0, 0);
    // Retrieve the image data and pass it to be converted to a 2d array,
    // instead of the 4 x width x height 1d array that is retrieved with 
    // getImageData.
    var imageArray = takeInputImage(iCv.getImageData(0, 0, img.width, img.height));
    // Retrieve the vertices from the image array. 
    // Note: only works with 1px wide weave patterns.
    var vertices = checkVertices(imageArray);
    // Updates the cloth with the retrieved vertices. 
    updateClothCoordinates(vertices, img.width);
  }
  img.onerror = function() {
    console.log('Error loading image.');
  }
  // Load the file into the image canvas
  img.src = URL.createObjectURL(file);
}

// Takes an input image in the form of a 4 x width x height rgba 1d array
// and returns a 2d array of binary pixels
function takeInputImage(inputImage) {
  // Retrieve the image information from the data. 
  var w = inputImage.width;
  var h = inputImage.height;
  var img = inputImage.data;

  // Initialize the final array.
  var finalArray = new Array(h);
  // Loop through the rows and columns of the final array, 
  // converting the r g b pixels to grayscale and then 
  // thresholding them so that they are 1 or 0. 
  for (var i = 0; i < h; i++) {
    // Initialize the next row of the array. 
    finalArray[i] = new Array(w);
    for (var j = 0; j < w; j++) {
      // The current index in the original 1d array. This array is in the format
      // of each pixel's r, g, b, and a values in a row, so first the index of
      // the red pixel is retrieved. In this case, the alpha (a) value is ignored. 
      var idx = (i*w*4 + j*4);
      var r = img[idx];
      var g = img[idx+1];
      var b = img[idx+2];
      // Uses a weighted average to convert the pixel to grayscale based on human 
      // luminance vision. Formula from https://en.wikipedia.org/wiki/Grayscale
      // Divides by 255 to get a value between 0 and 1. 
      var avg = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      // Threshold the grayscale pixel to 0 or 1.
      var val = 1;
      if (avg < 0.5)  val = 0;
      // Add the pixel to the final array. 
      finalArray[i][j] = val;
    }
  }
  return finalArray;
}

// Takes a 2d array in the form of a binary image and returns an array of tuples
// containing the coordinates of the image's vertices
function checkVertices(image) {
  // Retrieve the height and width of the image array.
  // If either is 0, the image is invalid. 
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
  // Some entered images will not have a 1 pixel size line size, 
  // so this goes through the first section of black pixels it finds
  // and chooses the 'pixel size' or 'line size' of the image based on that. 
  var line_size = 1;
  var size_found = false;
  // Loops through the image until the first black pixel is found
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      if (image[i][j] == 0) {
        // Check down and right of the pixel for more black pixels. 
        var height_count = 0;
        for (var k = i; k < h; k++) {
          if (image[k][j] != 0) break;
          height_count++;
        }
        var width_count = 0;
        for (var k = j; k < w; k++) {
          if (image[i][k] != 0) break;
          width_count++;
        }
        // Once the number of black pixels around this one has been found,
        // it picks the line size based on that value - it picks the smaller
        // of the width or height as some black pixels could be in a line. 
        // This means that each 'pixel' of the image is considered 
        // line_size x line_size
        line_size = Math.min(height_count, width_count);
        size_found= true;
        break;
      }
      if (size_found) break;
    }
    if (size_found) break;
  }
  console.log(line_size);
  // Initialize the vertice array and then loop through the entire image's coordinates.
  var vertices = [];
  // It jumps each step by line_size due to the fact that the line_size is considered
  // the size of each 'pixel'
  for (var i = 0; i < h; i += line_size) {
    for (var j = 0; j < w; j += line_size) {
      var p = image[i][j];
      // If a point is black, we should check if there are any black neighbours. 
      if (p == 0) {
        // If a point is at the edge of the image, we want to include it as
        // a vertice without needing to check for neighbours. 
        // The edge of the image is considered within one 'line_size' of the
        // actual edge (0 and height-1 or width-1)
        if (i <= (line_size - 1) || j <= (line_size - 1) ||
            i >= (h-line_size) || j >= (w-line_size)) {
          // Check if a vertice already exists that is a neighbour of this one. 
          // If not, push it to the vertices array as a new vertice. 
          if (!checkVerticesArray(vertices, i, j, line_size)) vertices.push([i, j]);
        } else {
          // Check if a point is a vertice by checking for the neighbours. 
          var isVertice = checkCurrentForVertice(image, i, j, line_size);
          if (isVertice) {
            // Check if a vertice already exists that is a neighbour of this one. 
            // If not, push it to the vertices array as a new vertice. 
            if (!checkVerticesArray(vertices, i, j, line_size)) vertices.push([i, j]);
          }
        }
      }
    }
  }
  return vertices;
}

// Takes the image and coordinates as input 
// and returns a boolean depending on if there
// is a vertice at those coordinates or not. 
// A vertice is defined as at least 4 * line_size neighbours in black,
function checkCurrentForVertice(image, x, y, line_size) {
  var count = 0;
  // If the coordinates is not a black pixel, we do not want to check it. 
  if (image[x][y] != 0) return false;
  // Loop through the neighbours of the pixel (in a (line_size+2) by (line_size+2) section)
  // and count the number of black neighbours. If there are
  // 4 * line_size black neighbours plus the pixel (of line_size) itself,
  // then there is a vertice. 
  var num_neighbours = 5 * line_size;
  for (i = x - line_size; i <= x + line_size; i++) {
    for (j = y - line_size; j <= y + line_size; j++) {
      if (image[i][j] == 0) {
        count ++;
      }
      if (count >= num_neighbours) break;
    }
    if (count >= num_neighbours) break;
  }
  if (count >= num_neighbours) return true;
  else return false;
}

// Loop through the current vertice array and check if any 
// vertices in it are neighbours of the current coordinates. 
function checkVerticesArray(vertices, i, j, line_size) {
  var verticeExists = false;
  for (vi = 0; vi < vertices.length; vi++) {
    var v = vertices[vi];
    // Check the distance from the vertice to the given coordinates.
    // If it is less than 2 * line size * sqrt(2), or two diagonal steps, then the 
    // coordinates are a neighbour of an existing vertice and should
    // not be used. 
    if (checkDistance(i, j, v[0], v[1], line_size)) {
      verticeExists = true;
      break;
    }
  }
  return verticeExists;
}

// Check the distance between the given coordinates. If the
// distance is less than or equal to 2 * the line size * sqrt(2),
// which is two diagonal steps, then return true. Otherwise it returns false.  
function checkDistance(x1, y1, x2, y2, line_size) {
  var dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return dist <= (line_size * 2 * Math.sqrt(2));
}

// Set size and expanse of cloth from webpage input
function setCloth() {
  var size = Number(document.getElementById("nodes").value);
  var expanse = Number(document.getElementById("size").value);

  cloth = new Cloth(size, expanse);
}