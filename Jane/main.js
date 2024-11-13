"use strict";

var gl;
var points = [];
var draggedPointIndex = null;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl || gl === undefined) {
    alert("WebGL 2.0 isn't available");
    return -1;
  }

  // Initialize points with two initial positions
  points = [
    vec2(-0.5, 0.5), // Red point
    vec2(0.5, -0.5)  // Blue point
  ];

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create buffer to store points
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(points)), gl.DYNAMIC_DRAW);

  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // Set viewport
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Event listeners for dragging points
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);

  render();
};

function drawEquidistantLine() {
  const redPoint = points[0];
  const bluePoint = points[1];

  // Calculate the slope of the line connecting the two points
  const slope = (bluePoint[1] - redPoint[1]) / (bluePoint[0] - redPoint[0]);

  // Calculate the midpoint of the line connecting the two points
  const midpoint = vec2((redPoint[0] + bluePoint[0]) / 2, (redPoint[1] + bluePoint[1]) / 2);

  // Calculate the perpendicular slope
  const perpSlope = -1 / slope;

  // Calculate the y-intercept of the perpendicular line
  const yIntercept = midpoint[1] - perpSlope * midpoint[0];

  // Calculate the intersection point of the two lines
  const x = (yIntercept - 0) / (0 - perpSlope);
  const y = perpSlope * x + yIntercept;

  // Draw the equidistant line
  drawLine(midpoint, vec2(x, y));
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Highlight the side closest to the blue point

  // Draw points
  gl.uniform1i(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "isBlue"), false);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(points)), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, 1);  // Draw red point

  gl.uniform1i(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "isBlue"), true);
  gl.drawArrays(gl.POINTS, 1, 1);  // Draw blue point
  highlightClosestSide();
  displayCoordinates();
  
  // find if there is a equidistant line from both points to the closest side
  drawEquidistantLine();
}

function highlightClosestSide() {
  const bluePoint = points[1];

  // Calculate distances to each side of the canvas
  const distances = {
    top: Math.abs(bluePoint[1] - 1),
    bottom: Math.abs(bluePoint[1] + 1),
    left: Math.abs(bluePoint[0] + 1),
    right: Math.abs(bluePoint[0] - 1)
  };

  // Find the closest side
  const closestSide = Object.keys(distances).reduce((a, b) => (distances[a] < distances[b] ? a : b));

  // Draw the highlighted side
  gl.lineWidth(2.0);  // Set line width for highlight
  gl.uniform1i(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "isHighlight"), true);

  switch (closestSide) {
    case "top":
      drawLine([-1, 1], [1, 1]);
      break;
    case "bottom":
      drawLine([-1, -1], [1, -1]);
      break;
    case "left":
      drawLine([-1, 1], [-1, -1]);
      break;
    case "right":
      drawLine([1, 1], [1, -1]);
      break;
  }

  gl.uniform1i(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "isHighlight"), false);
}

function drawLine(start, end) {
  const lineVertices = new Float32Array([...start, ...end]);
  const lineBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gl.drawArrays(gl.LINES, 0, 2);
}

function onMouseDown(event) {
  const { x, y } = getMousePos(event);
  draggedPointIndex = findClosestPoint(x, y);
}

function onMouseMove(event) {
  if (draggedPointIndex !== null) {
    const { x, y } = getMousePos(event);
    points[draggedPointIndex] = vec2(x, y);
    render();
  }
}

function onMouseUp(event) {
  draggedPointIndex = null;
}

// Converts mouse position to WebGL coordinates
function getMousePos(event) {
  const rect = event.target.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width * 2 - 1;
  const y = (rect.top - event.clientY) / rect.height * 2 + 1;
  return { x, y };
}

// Finds the closest point to the mouse position
function findClosestPoint(x, y) {
  const threshold = 0.05;
  for (let i = 0; i < points.length; i++) {
    const [px, py] = points[i];
    if (Math.abs(px - x) < threshold && Math.abs(py - y) < threshold) {
      return i;
    }
  }
  return null;
}

// Display the coordinates of each point
function displayCoordinates() {
  const coordDisplay = document.getElementById("coordinates");
  coordDisplay.innerHTML = `Red: (${points[0][0].toFixed(4)}, ${points[0][1].toFixed(4)})<br>Blue: (${points[1][0].toFixed(4)}, ${points[1][1].toFixed(4)})`;
}

// Utility function for creating 2D vectors
function vec2(x, y) {
  return [x, y];
}

// Utility function to flatten an array
function flatten(arr) {
  return arr.flat();
}
