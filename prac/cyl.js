"use strict";

var numDivisions = 5;

var index = 0;

var points = [];

var modelViewMatrix, projectionMatrix;

var axis =0;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);

var render, canvas, gl;
var program;
var flag = true;


// new shit
var eye = vec3(0, 5, 26);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// Define camera parameters
var near = 20;
var far = 80;
var fovy = 35;

var HEIGHT = 512;
var WIDTH = 512;

var bezier = function(u) {
    var b =new Array(4);
    var a = 1-u;
    b[3] = a*a*a;
    b[2] = 3*a*a*u;
    b[1] = 3*a*u*u;
    b[0] = u*u*u;
    return b;
}

onload = function init()  {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var h = 1.0/numDivisions;

    var patch = new Array(numTeapotPatches);
    for(var i=0; i<numTeapotPatches; i++) patch[i] = new Array(16);
    for(var i=0; i<numTeapotPatches; i++)
        for(j=0; j<16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
             vertices[indices[i][j]][2],
                vertices[indices[i][j]][1], 1.0]);
    }


    for ( var n = 0; n < numTeapotPatches; n++ ) {

    var data = new Array(numDivisions+1);
    for(var j = 0; j<= numDivisions; j++) data[j] = new Array(numDivisions+1);
    for(var i=0; i<=numDivisions; i++) for(var j=0; j<= numDivisions; j++) {
        data[i][j] = vec4(0,0,0,1);
        var u = i*h;
        var v = j*h;
        var t = new Array(4);
        for(var ii=0; ii<4; ii++) t[ii]=new Array(4);
        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++)
            t[ii][jj] = bezier(u)[ii]*bezier(v)[jj];


        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
            var temp = vec4(patch[n][4*ii+jj]);
            temp = mult( t[ii][jj], temp);
            data[i][j] = add(data[i][j], temp);
        }
    }

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    for(var i=0; i<numDivisions; i++) for(var j =0; j<numDivisions; j++) {
        points.push(data[i][j]);
        points.push(data[i+1][j]);
        points.push(data[i+1][j+1]);
        points.push(data[i][j]);
        points.push(data[i+1][j+1]);
        points.push(data[i][j+1]);
        index += 6;
        }
    }

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );



    // projectionMatrix = ortho(-2, 2, -2, 2, -20, 20);
    projectionMatrix = perspective(fovy, (WIDTH / HEIGHT), near, far);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    render();
}

render = function(){
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if(flag) theta[axis] += 1;


            modelViewMatrix = lookAt(eye, at, up);
            projectionMatrix = perspective(fovy, (WIDTH / HEIGHT), near, far);

            // modelViewMatrix = mat4();

            // modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
            // modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
            // modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));


            gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix) );

            for(var i=0; i<index; i+=3) gl.drawArrays( gl.LINE_LOOP, i, 3 );
            requestAnimationFrame(render);
        }


    var numTeapotVertices = 306;



var vertices = [

vec3(1.4 , 0.0 , 0.01),
vec3(1.4 , -0.784 , 0.01),
vec3(0.784 , -1.4 , 0.01),
vec3(0.0 , -1.4 , 0.01),
vec3(1.3375 , 0.0 ,3.56),
vec3(1.3375 , -0.749 , 3.56),
vec3(0.749 , -1.3375 , 3.56),
vec3(0.0 , -1.3375 , 3.56),
vec3(1.4375 , 0.0 , 3.56),
vec3(1.4375 , -0.805 , 3.56),
vec3(0.805 , -1.4375 , 3.56),
vec3(0.0 , -1.4375 , 3.56),
vec3(1.5 , 0.0 , 0.01),
vec3(1.5 , -0.84 , 0.01),
vec3(0.84 , -1.5 , 0.01),
vec3(0.0 , -1.5 , 0.01),
vec3(-0.784 , -1.4 , 0.01),
vec3(-1.4 , -0.784 , 0.01),
vec3(-1.4 , 0.0 , 0.01),
vec3(-0.749 , -1.3375 , 3.56),
vec3(-1.3375 , -0.749 , 3.56),
vec3(-1.3375 , 0.0 , 3.56),
vec3(-0.805 , -1.4375 , 3.56),
vec3(-1.4375 , -0.805 , 3.56),
vec3(-1.4375 , 0.0 , 3.56),
vec3(-0.84 , -1.5 , 0.01),
vec3(-1.5 , -0.84 , 0.01),
vec3(-1.5 , 0.0 , 0.01),
vec3(-1.4 , 0.784 , 0.01),
vec3(-0.784 , 1.4 , 0.01),
vec3(0.0 , 1.4 , 0.01),
vec3(-1.3375 , 0.749 , 3.56),
vec3(-0.749 , 1.3375 , 3.56),
vec3(0.0 , 1.3375 , 3.56),
vec3(-1.4375 , 0.805 , 3.56),
vec3(-0.805 , 1.4375 , 3.56),
vec3(0.0 , 1.4375 , 3.56),
vec3(-1.5 , 0.84 , 0.01),
vec3(-0.84 , 1.5 , 0.01),
vec3(0.0 , 1.5 , 0.01),
vec3(0.784 , 1.4 , 0.01),
vec3(1.4 , 0.784 , 0.01),
vec3(0.749 , 1.3375 , 3.56),
vec3(1.3375 , 0.749 , 3.56),
vec3(0.805 , 1.4375 , 3.56),
vec3(1.4375 , 0.805 , 3.56),
vec3(0.84 , 1.5 , 0.01),
vec3(1.5 , 0.84 , 0.01)
];


var numTeapotPatches = 4;

var indices = new Array(numTeapotPatches);

    indices[0] = [
	0, 1, 2, 3,
	4, 5, 6, 7,
	8, 9, 10, 11,
	12, 13, 14, 15
    ];
    indices[1] = [
	3, 16, 17, 18,
	7, 19, 20, 21,
	11, 22, 23, 24,
	15, 25, 26, 27
    ];
    indices[2] = [
	18, 28, 29, 30,
	21, 31, 32, 33,
	24, 34, 35, 36,
	27, 37, 38, 39
    ];
    indices[3] = [
	30, 40, 41, 0,
	33, 42, 43, 4,
	36, 44, 45, 8,
	39, 46, 47, 12
    ];
    indices[4] = [
	12, 13, 14, 15,
	48, 49, 50, 51,
	52, 53, 54, 55,
	56, 57, 58, 59
    ];