"use strict";

/*
Name: Dane Tsao
CWID: 12175276
CS435
Project 1

This javascript program uses WebGL to create and display a Koch snowflake with 4 iterations. 
Starting with a triangle, the edges are recursively subdivided,
adding smaller triangles to form the intricate snowflake pattern.
This is done with recursive steps.

*/

var gl;
var points = [];
var numIterations = 4;
// 60 degrees in radians
var rotationAngle = Math.PI / 3;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl || gl == undefined) {
    alert("WebGL 2.0 isn't available");
    return -1;
  }

  // Define the vertices of the initial triangle
  var vertices = [
    vec2(-0.8, -0.46),
    vec2(0, 0.92),
    vec2(0.8, -0.46)
  ];

  // Iterate over verticies
  for (var i = 0; i < vertices.length; i++) {
    var curB = vertices[(i + 1) % vertices.length];
    generateKochSnowflake(vertices[i], curB, numIterations);
  }

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create buffer to store snowflake points
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

  // Transfer the flattened data
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(points)), gl.STATIC_DRAW);
  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);
  // Set viewport
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Clear
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  render();
};

// Render the snowflake
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINE_STRIP, 0, points.length);
}

// Recursive function to generate the Koch snowflake
function generateKochSnowflake(a, b, depth) {
  if (depth > 0) {
    // Divide the line into thirds
    var pointA = mix(a, b, 1 / 3);
    var pointB = mix(a, b, 2 / 3);

    // Calc diff between A and B
    var diffY = pointB[1] - pointA[1];
    var diffX = pointB[0] - pointA[0];

    var squaredLength = (diffX * diffX) + (diffY * diffY);
    var length = Math.sqrt(squaredLength);

    var cosTheta = Math.cos(rotationAngle);
    var sinTheta = Math.sin(rotationAngle);

    // Apply rotation transformatio
    var rotatedDeltaX = (cosTheta * diffX) - (sinTheta * diffY);
    var rotatedDeltaY = (sinTheta * diffX) + (cosTheta * diffY);

    var triangleApexX = pointA[0] + rotatedDeltaX;
    var triangleApexY = pointA[1] + rotatedDeltaY;
    var triangleApex = vec2(triangleApexX, triangleApexY);

    // Recursively divide each segment and reduce the depth
    generateKochSnowflake(a, pointA, depth - 1);
    generateKochSnowflake(pointA, triangleApex, depth - 1);
    generateKochSnowflake(triangleApex, pointB, depth - 1);
    generateKochSnowflake(pointB, b, depth - 1);
  }
  else {
    // No more iterations, just draw
    points.push(a, b);
  }
}
