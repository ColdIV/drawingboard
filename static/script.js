// @source: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
function hsv2rgb(hue, saturation, value) {
    let chroma = value * saturation
    let hue1 = hue / 60
    let x = chroma * (1- Math.abs((hue1 % 2) - 1))
    let r1, g1, b1
    if (hue1 >= 0 && hue1 <= 1) {
      ([r1, g1, b1] = [chroma, x, 0])
    } else if (hue1 >= 1 && hue1 <= 2) {
      ([r1, g1, b1] = [x, chroma, 0])
    } else if (hue1 >= 2 && hue1 <= 3) {
      ([r1, g1, b1] = [0, chroma, x])
    } else if (hue1 >= 3 && hue1 <= 4) {
      ([r1, g1, b1] = [0, x, chroma])
    } else if (hue1 >= 4 && hue1 <= 5) {
      ([r1, g1, b1] = [x, 0, chroma])
    } else if (hue1 >= 5 && hue1 <= 6) {
      ([r1, g1, b1] = [chroma, 0, x])
    }

    let m = value - chroma
    let [r,g,b] = [r1+m, g1+m, b1+m]

    return [parseInt(255*r),parseInt(255*g),parseInt(255*b)]
}

var ghue = 0
var ghue_steps = 20
var gvalue_steps = .2
var gvalue_start = .2
var gcolorarray = []
var gcolor_index = Math.round(Math.random() * 7)
var gcolor_palette = 4
var gcolor_max_palettes = 5
var eraser = false
var brushSize = document.querySelector('#medium').dataset.size || 2

let i = 0
// shades of gray
gcolorarray[i] = []
let value = 0;
for (ghue = 0; ghue <= 360; ghue += ghue_steps) {
    gcolorarray[i].push(hsv2rgb(360, 0, value))
    value += (100 / (360 / ghue_steps)) / 100
}
++i

// colored
for (let gvalue = gvalue_start; gvalue <= 1; gvalue += gvalue_steps) {
    gcolorarray[i++] = []
    for (ghue = 0; ghue <= 360; ghue += ghue_steps) {
        gcolorarray[i - 1].push(hsv2rgb(ghue, 1, gvalue))
    }
}

gcolor_max_palettes = gcolorarray.length - 1



function circleColor(increase = true, backwards = false) {
    if (increase == false) {
        if (backwards) {
            // decreases index by 1 and returns current color
            // improve in #7
            if (gcolor_index - 1 >= 0) return gcolorarray[gcolor_palette][gcolor_index--]
            else {
                --gcolor_index
                return gcolorarray[gcolor_palette][gcolorarray[gcolor_palette].length]
            }
        } else {
            if (1+gcolor_index >= gcolorarray[gcolor_palette].length) return gcolorarray[gcolor_palette][1]
            return gcolorarray[gcolor_palette][1+gcolor_index]
        }
    }
    if (++gcolor_index >= gcolorarray[gcolor_palette].length) gcolor_index = 1
        return gcolorarray[gcolor_palette][gcolor_index]
}

// @source: https://stackoverflow.com/a/67723999/10495683 (modified)
let elementCurrentColor = document.querySelector('#currentColor')
let next = gcolorarray[gcolor_palette].length > gcolor_index + 1 ? gcolor_index + 1 : 0
elementCurrentColor.style.backgroundColor = 'rgb(' + gcolorarray[gcolor_palette][next].join(', ') + ')'

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false
var colorLocked = false    

var x = 'rgb(' + gcolorarray[0].join(', ') + ')',
    y = 1.5
    
function init() {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext("2d")
    w = canvas.width
    h = canvas.height

    let tmpColor = ctx.fillStyle
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = tmpColor

    document.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false)
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false)
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false)
    document.addEventListener("mouseup", function (e) {
        findxy('out', e)
    }, false)
    canvas.addEventListener("touchmove", function (e) {
        findxy('move', e)
    }, false)
    canvas.addEventListener("touchstart", function (e) {
        findxy('down', e)
    }, false)
    canvas.addEventListener("touchend", function (e) {
        findxy('up', e)
    }, false)
    canvas.addEventListener("touchcancel", function (e) {
        findxy('out', e)
    }, false)

    document.querySelector('.loading').classList.remove('loading')
    cPush()
}
 
function draw() {
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    let tmpColor = ctx.fillStyle
    if (eraser) {
        // @TODO replace with proper erase when the undo is implemented properly
        ctx.fillStyle = '#111'
        ctx.strokeStyle = '#111'
    }
    ctx.lineWidth = y * brushSize
    ctx.lineTo(currX, currY)
    ctx.lineJoin = ctx.lineCap = 'round'
    ctx.stroke()
    ctx.closePath()
    if (eraser) {
        ctx.fillStyle = tmpColor
        ctx.strokeStyle = tmpColor
    }
}

function findxy(res, e) {
    e.preventDefault();
    if (res == 'down') {
        prevX = currX
        prevY = currY
        newX = e.clientX || e.touches[0].clientX
        newY = e.clientY || e.touches[0].clientY
        currX = newX - canvas.getBoundingClientRect().left
        currY = newY - canvas.getBoundingClientRect().top

        flag = true
        dot_flag = true
        if (dot_flag && !eraser) {
            ctx.beginPath()
            if (!colorLocked) {
                let tmp = circleColor()
                let tmpColor = 'rgb(' + tmp.join(', ') + ')'
                elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(false).join(', ') + ')'
                ctx.fillStyle = tmpColor
                ctx.strokeStyle = tmpColor
            }
            ctx.arc(currX, currY, (y * brushSize) / 2, 0, 2 * Math.PI, false)
            ctx.fill();
            ctx.closePath()
            dot_flag = false
        }
    }
    if (res == 'up' || res == "out") {
        if (flag === true && res === 'up') {
            cPush()
        }

        flag = false
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX
            prevY = currY
            newX = e.clientX || e.touches[0].clientX
            newY = e.clientY || e.touches[0].clientY
            currX = newX - canvas.getBoundingClientRect().left
            currY = newY - canvas.getBoundingClientRect().top
            if (0 > prevX || 0 > prevY ||
                w < prevX || h < prevY) {
                prevX = currX
                prevY = currY
            }
            draw()
        }
    }
}

function changeColor (e = null, setElement = true) {
    if (e) {
        e.preventDefault()
        e.stopPropagation()
    }
    let tmp = circleColor()
    let tmpColor = 'rgb(' + tmp.join(', ') + ')'
    if (setElement) {
        let elColor = circleColor(false)
        if (colorLocked) {
            elColor = tmp
        }
        elementCurrentColor.style.backgroundColor = 'rgb(' + elColor.join(', ') + ')'
    }
    ctx.fillStyle = tmpColor
    ctx.strokeStyle = tmpColor
}

function toggleColorPalette (e) {
    e.stopPropagation()
    let index = e.currentTarget.dataset.number
    index = (index >= 0 && index < gcolor_max_palettes) ? ++index : 0

    gcolor_palette = index
    e.currentTarget.dataset.number = index
    e.currentTarget.innerHTML = index + 1 // just for visuals ;)

    let tmp = gcolorarray[gcolor_palette][gcolor_index]
    let tmpColor = 'rgb(' + tmp.join(', ') + ')'
    if (colorLocked) {
        elementCurrentColor.style.backgroundColor = tmpColor
    } else {
        elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(false).join(', ') + ')'
    }
    ctx.fillStyle = tmpColor
    ctx.strokeStyle = tmpColor
}

// undo script
// @source: https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
// note: this is not an optimal approach. as @Max said in the comments of this article:
// "But saving the whole canvas as ana image for undo or redo, is memory intensive, and a performance killer."
// A better aproach would be this: https://stackoverflow.com/questions/17150610/undo-redo-for-paint-program-using-canvas
// @TODO future me, because I am too tired right now
var cPushArray = new Array();
var cStep = -1;
	
function cPush () {
    cStep++;
    if (cStep < cPushArray.length) { cPushArray.length = cStep; }
    cPushArray.push(canvas.toDataURL());
}


// controls:
let toggleButton = document.querySelector('#toggleCanvas')
let clearButton = document.querySelector('#clearButton')
let saveButton = document.querySelector('#saveButton')
let reportButton = document.querySelector('#flagButton')
let closeButton = document.querySelector('#closeButton')
let expandButton = document.querySelector('#expandButton')
let additionalControls = document.querySelector('#additionalControls')
let undoButton = document.querySelector('#undoButton')
let eraserEl = document.querySelector('#eraser')
let sizeSmall = document.querySelector('#small')
let sizeMedium = document.querySelector('#medium')
let sizeLarge = document.querySelector('#large')
let sizeExtraLarge = document.querySelector('#extralarge')
let toggleColorPaletteButton = document.querySelector('#colorPalette')
let toggleColor = document.querySelector('#currentColor')
let lockColor = document.querySelector('.colorContainer')
toggleColor.addEventListener('touchend', changeColor)
toggleColor.addEventListener('click', changeColor)

function toggleCanvas (e) {
    if (toggleButton.classList.contains('show')) {
        document.querySelector('#gallery').scrollIntoView()
    } else {
        document.querySelector('#wrapper').scrollIntoView()
    }
    return false
}

window.onscroll = function() {
    if (document.querySelector('#wrapper').getBoundingClientRect().bottom > 0){
        if (!toggleButton.classList.contains('show')) {
            toggleButton.classList.add('show')
        }
    }

    if (document.querySelector('#wrapper').getBoundingClientRect().bottom <= 0){
        if (toggleButton.classList.contains('show')) {
            toggleButton.classList.remove('show')
        }
    }
}

function expandAdditionalControls () {
    additionalControls.classList.toggle('show')
    if (additionalControls.classList.contains('show')) {
        expandButton.innerHTML = expandButton.dataset.hide
    } else {
        expandButton.innerHTML = expandButton.dataset.show
    }
}

function showAlert(text, prefix = '') {
    let alerts = document.querySelector('.alerts ul')
    let ealert = document.createElement('li')
    if (prefix != '') {
        let span = document.createElement('span')
        ealert.classList.add(prefix)
        span.innerHTML = prefix
        ealert.appendChild(span)
    }
    ealert.innerHTML += text
    alerts.appendChild(ealert)
    setTimeout(() => {
        ealert.classList.add('fadeout')
        setTimeout(() => {
            alerts.removeChild(ealert)
        }, 500)
    }, 2000)
}


function clearCanvas (e) {
    e.preventDefault()
    let tmpColor = ctx.fillStyle
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = tmpColor
    cPush()
    showAlert('canvas cleared')
}

function isCanvasBlank(canvas) {
    const context = canvas.getContext('2d')

    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    )

    return !pixelBuffer.some(color => color !== 0 && color !== 4279308561)
}

function closeLightbox(el) {
    document.querySelector('body').classList.remove('show-lightbox')
    document.querySelector('#lightbox').classList.remove('verified')
    document.querySelector('#lightbox').classList.remove('no-report')
    document.querySelector('#lightbox .image-wrapper').innerHTML = ''
}

function openLightbox(image) {
    closeLightbox()
    image = image.currentTarget
    document.querySelector('body').classList.add('show-lightbox')
    verified = image.dataset.verified
    if (verified == 'True') {
        document.querySelector('#lightbox').classList.add('verified')
    } else if (verified == undefined) {
        document.querySelector('#lightbox').classList.add('no-report')
    }

    var link = document.querySelector('#link-wrapper a')
    link.href = '/image/' + image.dataset.id
    img = document.createElement('img')
    img.src = image.src
    document.querySelector('#lightbox .image-wrapper').appendChild(img)
}

let canSave = true
let canSaveTimerRunning = false
function resetCanSave () {
    if (!canSaveTimerRunning) {
        canSaveTimerRunning = true
        setTimeout(() => {
            canSave = true
            canSaveTimerRunning = false
        }, 5000)
    }
}

function saveCanvas (e) {
    e.preventDefault()
    if (isCanvasBlank(canvas)) {
        showAlert('canvas is empty', 'error')
        return
    }
    
    if (!canSave) {
        showAlert('too many requests', 'error')
        return
    } else {
        canSave = false
    }


    canvas.toBlob(function(blob) {
        const formData = new FormData()
        formData.append('file', blob, 'filename')
        
        document.querySelector('#wrapper').classList.add('loading')
        let url = saveButton.dataset.url
        fetch(url, {
            method:"POST",
            body:formData
        }).then(response => {
            if (response.ok) return response
            else throw Error(`Server returned ${response.status}: ${response.statusText}`)
        }).then(response => {
            // success
            showAlert('image saved', 'success')
            var image = document.createElement('img')
            image.src = URL.createObjectURL(blob)
            document.querySelector('#gallery .image-container').prepend(image)

            image.addEventListener('click', openLightbox)
            image.addEventListener('touch', openLightbox)

            document.querySelector('#wrapper').classList.remove('loading')
            resetCanSave()
        }).catch(err => {
            // error
            showAlert('failed to save image', 'error')
            document.querySelector('#wrapper').classList.remove('loading')
            resetCanSave()
        })
    })
}

function undo () {
    if (cStep > 0) {
        cStep--
        var canvasPic = new Image()
        canvasPic.src = cPushArray[cStep]
        canvasPic.onload = function () { 
            let tmpColor = ctx.fillStyle
            ctx.fillStyle = '#111'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = tmpColor
            ctx.drawImage(canvasPic, 0, 0)
        }
    }
}

function toggleEraser () {
    if (eraserEl.checked) {
        eraser = true
    } else {
        eraser = false
    }
}

function toggleBrushSize (e) {
    el = e.currentTarget
    if (el.checked) {
        brushSize = el.dataset.size
    }
}

function report () {
    let image = document.querySelector('#lightbox img').src
    let filename = image.split('/').pop()
    const formData = new FormData()
    formData.append('image', filename)

    document.querySelector('.image-wrapper').classList.add('loading')
    let url = reportButton.dataset.url
    fetch(url, {
        method:"POST",
        body:formData
    }).then(response => {
        if (response.ok) return response
        else throw Error(`Server returned ${response.status}: ${response.statusText}`)
    }).then(response => {
        // success
        showAlert('image removed for review', 'success')
        document.querySelectorAll('#gallery .image-container img').forEach((e) => {
            if (image == e.src) {
                e.remove()
            }
        })
        closeLightbox()
        document.querySelector('.image-wrapper').classList.remove('loading')
    }).catch(err => {
        // error
        showAlert('failed to report image', 'error')
        closeLightbox()
        document.querySelector('.image-wrapper').classList.remove('loading')
    });
}

['click', 'touch'].forEach(function(e) {
    toggleButton.addEventListener(e, toggleCanvas)
    clearButton.addEventListener(e, clearCanvas)
    saveButton.addEventListener(e, saveCanvas)
    eraserEl.addEventListener(e, toggleEraser)
    sizeSmall.addEventListener(e, toggleBrushSize)
    sizeMedium.addEventListener(e, toggleBrushSize)
    sizeLarge.addEventListener(e, toggleBrushSize)
    sizeExtraLarge.addEventListener(e, toggleBrushSize)
    expandButton.addEventListener(e, expandAdditionalControls)
    toggleColorPaletteButton.addEventListener(e, toggleColorPalette)
    lockColor.addEventListener(e, () => {
        colorLocked = !colorLocked
        lockColor.classList.toggle('lock')
        
        if (colorLocked) {
            changeColor(null, false)
        } else {
            elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(false, true).join(', ') + ')'
        }
    })
    
    closeButton.addEventListener(e, closeLightbox)
    document.querySelector('#lightbox').addEventListener(e, closeLightbox)
    document.querySelector('#lightbox .lightbox-wrapper').addEventListener(e, function(event){event.stopPropagation()}, false)
    document.querySelectorAll('#gallery .image-container img').forEach((el) => {
        el.addEventListener(e, openLightbox)
    })

    reportButton.addEventListener(e, report)
})

undoButton.addEventListener('click', undo)
undoButton.addEventListener('touch', undo)

// prevent flashing on load, so start with display: none
additionalControls.style.display = 'flex';
