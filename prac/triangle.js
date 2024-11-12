"use strict";

var gl;
var points;
var colors;

var xTranslation = [0, 0];

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    points = [
        vec4(-0.5,  0.5,  0.0, 1.0),
        vec4(0.5, 0.5,  0.0, 1.0),
        vec4(0.5, -0.5,  0.0, 1.0),
        
        vec4(0.5, -0.5 , 0.0, 1.0),
        vec4(-0.5, -0.5, 0.0, 1.0),
        vec4(-0.5, 0.5, 0.0, 1.0),
        
        vec4(-1, 0.9, 0.0, 1.0),
        vec4(-1, 1, 0.0, 1.0),
        vec4(-0.9, 1, 0.0, 1.0),
        
        vec4(-0.9, 1, 0.0, 1.0),
        vec4(-0.9, 0.9, 0.0, 1.0),
        vec4(-1, 0.9, 0.0, 1.0)
    ];

    colors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 0.0, 0.0, 1.0),  // red

        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 1.0, 0.0, 1.0),  // green

        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 0.0, 0.0, 1.0),  // red

        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 1.0, 0.0, 1.0)   // green
    ];

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    var colorBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    var xSlider = document.getElementById("xSlider");
    xSlider.onchange = function() {
        xTranslation[0] = parseFloat(xSlider.value);
        render();
    };

    var u_xTranslation = gl.getUniformLocation(program, "u_xTranslation");

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2fv(u_xTranslation, xTranslation);
        gl.drawArrays(gl.TRIANGLES, 0, 12);
        requestAnimationFrame(render);
    }

    render();
};
