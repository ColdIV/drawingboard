// @SOURCE: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
// hue in range [0, 360]
// saturation, value in range [0,1]
// return [r,g,b] each in range [0,255]
// See: https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
function hsv2rgb(hue, saturation, value) {
    let chroma = value * saturation;
    let hue1 = hue / 60;
    let x = chroma * (1- Math.abs((hue1 % 2) - 1));
    let r1, g1, b1;
    if (hue1 >= 0 && hue1 <= 1) {
      ([r1, g1, b1] = [chroma, x, 0]);
    } else if (hue1 >= 1 && hue1 <= 2) {
      ([r1, g1, b1] = [x, chroma, 0]);
    } else if (hue1 >= 2 && hue1 <= 3) {
      ([r1, g1, b1] = [0, chroma, x]);
    } else if (hue1 >= 3 && hue1 <= 4) {
      ([r1, g1, b1] = [0, x, chroma]);
    } else if (hue1 >= 4 && hue1 <= 5) {
      ([r1, g1, b1] = [x, 0, chroma]);
    } else if (hue1 >= 5 && hue1 <= 6) {
      ([r1, g1, b1] = [chroma, 0, x]);
    }

    let m = value - chroma;
    let [r,g,b] = [r1+m, g1+m, b1+m];

    return [255*r,255*g,255*b];
}

var HUE = 0;
    HUE_STEPS = 20;
var COLORARRAY = [];
var COLOR_INDEX = 0;

for (HUE = 0; HUE <= 360; HUE+=HUE_STEPS) {
    COLORARRAY.push(hsv2rgb(HUE, .80, 1));
}
COLORARRAY.push([0,0,0]);
COLORARRAY.push([255,255,255]);

function circleColor(color, increase = true) {
    if (increase == false) {
        if (1+COLOR_INDEX >= COLORARRAY.length) return COLORARRAY[0];
        return COLORARRAY[1+COLOR_INDEX];
    }
    if (++COLOR_INDEX >= COLORARRAY.length) COLOR_INDEX = 0;
        return COLORARRAY[COLOR_INDEX];

    return color
}


// @SOURCE: https://stackoverflow.com/a/67723999/10495683 (modified)
let elementCurrentColor = document.querySelector('#currentColor');
var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = 'rgb(' + COLORARRAY[0].join(', ') + ')',
    y = 3;
    
function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}
 
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.getBoundingClientRect().left;
        currY = e.clientY - canvas.getBoundingClientRect().top;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            let color = ctx.getImageData(currX, currY, 1, 1).data;
            let tmp = circleColor(color);
            let tmpColor = 'rgb(' + tmp.join(', ') + ')';
            elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(tmp, false).join(', ') + ')';
            ctx.fillStyle = tmpColor
            ctx.strokeStyle = tmpColor
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.getBoundingClientRect().left;
            currY = e.clientY - canvas.getBoundingClientRect().top;
            draw();
        }
    }
}

// CONTROLS:
let toggleButton = document.querySelector('#toggleCanvas');
let clearButton = document.querySelector('#clearButton')
let saveButton = document.querySelector('#saveButton')

function toggleCanvas (e) {
    e.currentTarget.classList.toggle('show');
    document.querySelector('#gallery').classList.toggle('show');
    return false;
}

function clearCanvas () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

['click', 'touch'].forEach(function(e) {
    toggleButton.addEventListener(e, toggleCanvas)
    clearButton.addEventListener(e, clearCanvas)
})
