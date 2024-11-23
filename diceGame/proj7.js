"use strict";

/*
Name: Dane Tsao
CWID: 12175276
CS435
Project 7

Dice Roll Guesser
- User can select the number of dice to roll (1-3)
- User can input a sum to guess
- User can roll the dice
- Dice will spin and display a random face
- Dice will stop spinning and display a face

This project is an extension of previous projects. We have a variable amount of dice.
This project explores texture mapping, lighting, user input and projection. 
*/

var canvas;
var gl;

var numPositions = 36;

var positionsArray = [];
var normalsArray = [];
var texCoordsArray = [];

var texCoord = [vec2(0, 1), vec2(0, 0), vec2(1, 0), vec2(1, 1)];

var dieTex = [];
var roll = 0;

var lightPosition = vec4(2.0, 2.0, 2.0, 0.0);
var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var materialDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 360.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelViewMatrix, projectionMatrix;
var viewerPos;
var program;

var die1Position = vec3(-1.0, 0.0, 0.0);
var die2Position = vec3(1.0, 0.0, 0.0);
var die1Rotation = vec3(0, 0, 0);
var die2Rotation = vec3(0, 0, 0);
var target1Rotation = vec3(0, 0, 0);
var target2Rotation = vec3(0, 0, 0);

var die3Position = vec3(1.5, 0.0, 0.0);
var die3Rotation = vec3(0, 0, 0);

var die1Tex;
var die2Tex;
var die3Tex;

var offset1 = 0;
var offset2 = 0;
var offset3 = 0;

var slowOffset;

var guessVal = 2;

var dieCount = 1;

var die1Speed = 1.0;
var die2Speed = 1.2;
var die3Speed = 0.8;


// Vars done

var vertices_1 = [
   vec4(-0.5, -0.5, 0.5, 1.0),
   vec4(-0.5, 0.5, 0.5, 1.0),
   vec4(0.5, 0.5, 0.5, 1.0),
   vec4(0.5, -0.5, 0.5, 1.0),
   vec4(-0.5, -0.5, -0.5, 1.0),
   vec4(-0.5, 0.5, -0.5, 1.0),
   vec4(0.5, 0.5, -0.5, 1.0),
   vec4(0.5, -0.5, -0.5, 1.0),
];

// Basic func to create a quad, taken from previous projects
function quad(a, b, c, d, vertices) {
   var t1 = subtract(vertices[b], vertices[a]);
   var t2 = subtract(vertices[c], vertices[b]);
   var normal = cross(t1, t2);
   normal = vec3(normal);

   positionsArray.push(vertices[a]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[0]);

   positionsArray.push(vertices[b]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[1]);

   positionsArray.push(vertices[c]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[2]);

   positionsArray.push(vertices[a]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[0]);

   positionsArray.push(vertices[c]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[2]);

   positionsArray.push(vertices[d]);
   normalsArray.push(normal);
   texCoordsArray.push(texCoord[3]);
}

function makeCube() {
   quad(1, 0, 3, 2, vertices_1);
   quad(2, 3, 7, 6, vertices_1);
   quad(3, 0, 4, 7, vertices_1);
   quad(6, 5, 1, 2, vertices_1);
   quad(4, 5, 6, 7, vertices_1);
   quad(5, 4, 0, 1, vertices_1);
}

window.onload = function init() {
   canvas = document.getElementById("gl-canvas");

   gl = canvas.getContext("webgl2");
   if (!gl) alert("WebGL 2.0 isn't available");

   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(1.0, 1.0, 1.0, 1.0);

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LESS); // Default depth comparison function

   //
   //  Load shaders and initialize attribute buffers
   //
   program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   makeCube();

   var nBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

   var normalLoc = gl.getAttribLocation(program, "aNormal");
   gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(normalLoc);

   var vBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

   var positionLoc = gl.getAttribLocation(program, "aPosition");
   gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(positionLoc);

   // Texture
   var tBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

   // aTexCoord
   var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
   gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(texCoordLoc);

   viewerPos = vec3(1.0, 1.0, 0);
   projectionMatrix = ortho(-3, 3, -3, 3, 50, -10);

   // Set up lighting
   var ambientProduct = mult(lightAmbient, materialAmbient);
   var diffuseProduct = mult(lightDiffuse, materialDiffuse);
   var specularProduct = mult(lightSpecular, materialSpecular);

   gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
   );
   gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
   );
   gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
   );
   gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
   );

   gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

   gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
   );

   // for vec4 inColor
   gl.uniform4fv(
      gl.getUniformLocation(program, "inColor"),
      vec4(1.0, 1.0, 1.0, 0.1)
   );

   // Load die textures
   dieTex[0] = configureTexture(document.getElementById("dietex1"));
   dieTex[1] = configureTexture(document.getElementById("dietex2"));
   dieTex[2] = configureTexture(document.getElementById("dietex3"));
   dieTex[3] = configureTexture(document.getElementById("dietex4"));
   dieTex[4] = configureTexture(document.getElementById("dietex5"));
   dieTex[5] = configureTexture(document.getElementById("dietex6"));

   gl.activeTexture(gl.TEXTURE0);
   gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);

   configUI();
   render();
};

var render = function () {
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   if (roll > 0) {
      handleSpin();
   } else {
      // Display die values based on offsets
      document.getElementById("die1").innerHTML = `Die 1: ${convertOffset(
         offset1
      )}`;
      if (dieCount >= 2) {
         document.getElementById("die2").innerHTML = `Die 2: ${convertOffset(
            offset2
         )}`;
      } else {
         document.getElementById("die2").innerHTML = ``;
      }
      if (dieCount == 3) {
         document.getElementById("die3").innerHTML = `Die 3: ${convertOffset(
            offset3
         )}`;
      } else {
         document.getElementById("die3").innerHTML = ``;
      }

      let sum = 0;
      if (dieCount == 1) {
         sum = convertOffset(offset1);
      } else if (dieCount == 2) {
         sum = convertOffset(offset1) + convertOffset(offset2);
      } else {
         sum =
            convertOffset(offset1) +
            convertOffset(offset2) +
            convertOffset(offset3);
      }
      document.getElementById("sumDis").innerHTML = `Sum: ${sum}`;
      //console.log("sum: " + sum);
      checkSum(sum);
   }
   //console.log("sum input: " + document.getElementById("sum").value);

   // Update die textures based on offsets
   die1Tex = dieTex.slice(offset1).concat(dieTex.slice(0, offset1));
   die2Tex = dieTex.slice(offset2).concat(dieTex.slice(0, offset2));
   die3Tex = dieTex.slice(offset3).concat(dieTex.slice(0, offset3));

   // Update positions based on dieCount
   if (dieCount == 1) {
      die1Position = vec3(0.0, 0.0, 0.0);
   } else if (dieCount == 2) {
      die1Position = vec3(-1.0, 0.0, 0.0);
      die2Position = vec3(1.0, 0.0, 0.0);
   } else if (dieCount == 3) {
      die1Position = vec3(-2, 0.0, 0.0);
      die2Position = vec3(0.0, 0.0, 0.0);
      die3Position = vec3(2, 0.0, 0.0);
   }

   // Render Die 1
   modelViewMatrix = mat4();
   modelViewMatrix = mult(modelViewMatrix, translate(die1Position));
   modelViewMatrix = mult(
      modelViewMatrix,
      rotate(die1Rotation[0], vec3(1, 0, 0))
   );
   modelViewMatrix = mult(
      modelViewMatrix,
      rotate(die1Rotation[1], vec3(0, 1, 0))
   );
   modelViewMatrix = mult(
      modelViewMatrix,
      rotate(die1Rotation[2], vec3(0, 0, 1))
   );
   gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
   );

   for (var i = 0; i < numPositions; i += 6) {
      gl.bindTexture(gl.TEXTURE_2D, die1Tex[i / 6]);
      gl.drawArrays(gl.TRIANGLES, i, 6);
   }

   // Render Die 2
   if (dieCount >= 2) {
      modelViewMatrix = mat4();
      modelViewMatrix = mult(modelViewMatrix, translate(die2Position));
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die2Rotation[0], vec3(1, 0, 0))
      );
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die2Rotation[1], vec3(0, 1, 0))
      );
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die2Rotation[2], vec3(0, 0, 1))
      );
      gl.uniformMatrix4fv(
         gl.getUniformLocation(program, "uModelViewMatrix"),
         false,
         flatten(modelViewMatrix)
      );

      for (var i = 0; i < numPositions; i += 6) {
         gl.bindTexture(gl.TEXTURE_2D, die2Tex[i / 6]);
         gl.drawArrays(gl.TRIANGLES, i, 6);
      }
   }

   // Render Die 3
   if (dieCount == 3) {
      modelViewMatrix = mat4();
      modelViewMatrix = mult(modelViewMatrix, translate(die3Position));
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die3Rotation[0], vec3(1, 0, 0))
      );
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die3Rotation[1], vec3(0, 1, 0))
      );
      modelViewMatrix = mult(
         modelViewMatrix,
         rotate(die3Rotation[2], vec3(0, 0, 1))
      );
      gl.uniformMatrix4fv(
         gl.getUniformLocation(program, "uModelViewMatrix"),
         false,
         flatten(modelViewMatrix)
      );

      for (var i = 0; i < numPositions; i += 6) {
         gl.bindTexture(gl.TEXTURE_2D, die3Tex[i / 6]);
         gl.drawArrays(gl.TRIANGLES, i, 6);
      }
   }

   requestAnimationFrame(render);
};

// Configure texture, from previous projects
function configureTexture(image) {
   var texture = gl.createTexture();

   gl.bindTexture(gl.TEXTURE_2D, texture);

   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR
   );
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   return texture;
}

var configUI = function () {
   document.getElementById("roll").onclick = function () {
      roll = 1;
      offset1 = Math.floor(Math.random() * 6);
      offset2 = Math.floor(Math.random() * 6);
      offset3 = Math.floor(Math.random() * 6);

      die1Speed = 1.0 + Math.random() * 0.5;
      die2Speed = 1.2 + Math.random() * 0.5;
      die3Speed = 0.8 + Math.random() * 0.5;
   };

   //get die count
   document.getElementById("dieCount").onchange = function () {
      dieCount = document.getElementById("dieCount").value;
      //console.log("Die Count: " + dieCount);
   };
};

// Spin the dice
function handleSpin() {
   if (roll > 0.2) {
      roll -= 0.01;

      // dieRoation contains x, y, z rotation values
      die1Rotation[0] += roll * die1Speed * 10;
      die1Rotation[1] += roll * die1Speed * 10;
      die1Rotation[2] += roll * die1Speed * 10;

      die2Rotation[0] += roll * die2Speed * 10;
      die2Rotation[1] += roll * die2Speed * 10;
      die2Rotation[2] += roll * die2Speed * 10;

      die3Rotation[0] += roll * die3Speed * 10;
      die3Rotation[1] += roll * die3Speed * 10;
      die3Rotation[2] += roll * die3Speed * 10;
   } else {
      // done spinning, align to face 1
      transitionToFace1(die1Rotation);
      transitionToFace1(die2Rotation);
      transitionToFace1(die3Rotation);

      if (
         isAlignedToFace1(die1Rotation) &&
         isAlignedToFace1(die2Rotation) &&
         isAlignedToFace1(die3Rotation)
      ) {
         roll = 0;
      }
   }
}


function transitionToFace1(rotation) {
   // align to face 1
   var speed = roll * 15;

   for (let i = 0; i < 3; i++) {
      if (Math.abs(rotation[i]) > speed) {
         rotation[i] += rotation[i] > 0 ? -speed : speed;
      } else {
         rotation[i] = 0;
      }
   }
}

function isAlignedToFace1(rotation) {
   // boolean check if aligned to face 1
   const tolerance = 1;

   return (
      Math.abs(rotation[0]) <= tolerance &&
      Math.abs(rotation[1]) <= tolerance &&
      Math.abs(rotation[2]) <= tolerance
   );
}

function translate(x, y, z) {
   if (Array.isArray(x) && x.length == 3) {
      z = x[2];
      y = x[1];
      x = x[0];
   }
   var result = mat4();
   result[0][3] = x;
   result[1][3] = y;
   result[2][3] = z;
   return result;
}

// Convert offset to face value
function convertOffset(offset) {
   let num = offset + 5;
   if (num > 6) {
      num = num % 6;
   }
   if (num == 0) {
      num = 6;
   }
   return num;
}

// Check sum and update UI
function checkSum(sum) {
   let newGuessVal = document.getElementById("sum").value;
   if (sum == newGuessVal) {
      document.getElementById("message").innerHTML = "Correct Guess! 🎉";
      document.getElementById("message").style.color = "green";
      document.getElementById("message").style.fontWeight = "bold";
   } else {
      document.getElementById("message").innerHTML = "Try Again!";
      document.getElementById("message").style.color = "black";
      document.getElementById("message").style.fontWeight = "normal";
   }
}
