"use strict";

/*
Name: Dane Tsao
CWID: 12175276
CS435
Project 7

*/

var gl;
var points = [];

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl || gl == undefined) {
    alert("WebGL 2.0 isn't available");
    return -1;
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
