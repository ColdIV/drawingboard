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

    return [255*r,255*g,255*b]
}

var ghue = 0
var ghue_steps = 20
var gcolorarray = []
var gcolor_index = 0
var eraser = false
var brushSize = document.querySelector('#medium').dataset.size || 2

for (ghue = 0; ghue <= 360; ghue += ghue_steps) {
    gcolorarray.push(hsv2rgb(ghue, .80, 1))
}
gcolorarray.push([0,0,0])
gcolorarray.push([255,255,255])

function circleColor(increase = true) {
    if (increase == false) {
        if (1+gcolor_index >= gcolorarray.length) return gcolorarray[1]
        return gcolorarray[1+gcolor_index]
    }
    if (++gcolor_index >= gcolorarray.length) gcolor_index = 1
        return gcolorarray[gcolor_index]
}


// @source: https://stackoverflow.com/a/67723999/10495683 (modified)
let elementCurrentColor = document.querySelector('#currentColor');
var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false

var x = 'rgb(' + gcolorarray[0].join(', ') + ')',
    y = 1.5
    
function init() {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext("2d")
    w = canvas.width
    h = canvas.height

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false)
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false)
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false)
    canvas.addEventListener("mouseout", function (e) {
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
}
 
function draw() {
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    if (eraser) {
        ctx.globalCompositeOperation = "destination-out"
    } else {
        ctx.globalCompositeOperation="source-over"
    }
    ctx.lineWidth = y * brushSize
    ctx.lineTo(currX, currY)
    ctx.stroke()
    ctx.closePath()
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
            let tmp = circleColor()
            let tmpColor = 'rgb(' + tmp.join(', ') + ')'
            elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(false).join(', ') + ')'
            ctx.fillStyle = tmpColor
            ctx.strokeStyle = tmpColor
            ctx.fillRect(currX, currY, 2, 2)
            ctx.closePath()
            dot_flag = false
        }
    }
    if (res == 'up' || res == "out") {
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
            draw()
        }
    }
}

function changeColor (e) {
    e.preventDefault()
    blockToggleColor = true
    let tmp = circleColor()
    let tmpColor = 'rgb(' + tmp.join(', ') + ')'
    elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(false).join(', ') + ')'
    ctx.fillStyle = tmpColor
    ctx.strokeStyle = tmpColor
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
let toggleColor = document.querySelector('#currentColor')
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    showAlert('canvas cleared')
}

function isCanvasBlank(canvas) {
    const context = canvas.getContext('2d')

    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    )

    return !pixelBuffer.some(color => color !== 0)
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
        
        document.querySelector('body').classList.add('loading')
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
            document.querySelector('#gallery').prepend(image)

            image.addEventListener('click', openLightbox)
            image.addEventListener('touch', openLightbox)

            document.querySelector('body').classList.remove('loading')
            resetCanSave()
        }).catch(err => {
            // error
            showAlert('failed to save image', 'error')
            document.querySelector('body').classList.remove('loading')
            resetCanSave()
        })
    })
}

function undo () {
    console.log('undoButton click')
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

    document.querySelector('body').classList.add('loading')
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
        document.querySelectorAll('#gallery img').forEach((e) => {
            if (image == e.src) {
                e.remove()
            }
        })
        closeLightbox()
        document.querySelector('body').classList.remove('loading')
    }).catch(err => {
        // error
        showAlert('failed to report image', 'error')
        closeLightbox()
        document.querySelector('body').classList.remove('loading')
    });
}

['click', 'touch'].forEach(function(e) {
    toggleButton.addEventListener(e, toggleCanvas)
    clearButton.addEventListener(e, clearCanvas)
    saveButton.addEventListener(e, saveCanvas)
    undoButton.addEventListener(e, undo)
    eraserEl.addEventListener(e, toggleEraser)
    sizeSmall.addEventListener(e, toggleBrushSize)
    sizeMedium.addEventListener(e, toggleBrushSize)
    sizeLarge.addEventListener(e, toggleBrushSize)
    expandButton.addEventListener(e, expandAdditionalControls)
    
    closeButton.addEventListener(e, closeLightbox)
    document.querySelector('#lightbox').addEventListener(e, closeLightbox)
    document.querySelector('#lightbox .lightbox-wrapper').addEventListener(e, function(event){event.stopPropagation()}, false)
    document.querySelectorAll('#gallery img').forEach((el) => {
        el.addEventListener(e, openLightbox)
    })

    reportButton.addEventListener(e, report)
})

// prevent flashing on load, so start with display: none
additionalControls.style.display = 'flex';