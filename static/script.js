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

for (ghue = 0; ghue <= 360; ghue += ghue_steps) {
    gcolorarray.push(hsv2rgb(ghue, .80, 1))
}
gcolorarray.push([0,0,0])
gcolorarray.push([255,255,255])

function circleColor(color, increase = true) {
    if (increase == false) {
        if (1+gcolor_index >= gcolorarray.length) return gcolorarray[0]
        return gcolorarray[1+gcolor_index]
    }
    if (++gcolor_index >= gcolorarray.length) gcolor_index = 0
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
    y = 3
    
function init() {
    canvas = document.getElementById('can')
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
    ctx.lineTo(currX, currY)
    ctx.lineWidth = y
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
        if (dot_flag) {
            ctx.beginPath()
            let color = ctx.getImageData(currX, currY, 1, 1).data
            let tmp = circleColor(color)
            let tmpColor = 'rgb(' + tmp.join(', ') + ')'
            elementCurrentColor.style.backgroundColor = 'rgb(' + circleColor(tmp, false).join(', ') + ')'
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

// controls:
let toggleButton = document.querySelector('#toggleCanvas')
let clearButton = document.querySelector('#clearButton')
let saveButton = document.querySelector('#saveButton')
let reportButton = document.querySelector('#flagButton')

function toggleCanvas (e) {
    e.currentTarget.classList.toggle('show')
    if (e.currentTarget.classList.contains('show')) {
        document.querySelector('#wrapper').scrollIntoView()
    } else {
        document.querySelector('#gallery').scrollIntoView()
    }
    return false
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


function clearCanvas () {
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
    document.querySelector('#lightbox .image-wrapper').innerHTML = ''
}

function openLightbox(image) {
    closeLightbox()
    image = image.currentTarget
    document.querySelector('body').classList.add('show-lightbox')
    verified = image.dataset.verified
    if (verified == 'True') {
        document.querySelector('#lightbox').classList.add('verified')
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

function saveCanvas () {
    if (!canSave) {
        showAlert('too many requests', 'error')
        return
    } else {
        canSave = false
    }

    if (isCanvasBlank(canvas)) {
        showAlert('canvas is empty', 'error')
        return
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
            document.querySelector('#gallery').appendChild(image)

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
    
    document.querySelector('#lightbox').addEventListener(e, closeLightbox)
    document.querySelector('#lightbox .lightbox-wrapper').addEventListener(e, function(event){event.stopPropagation()}, false)
    document.querySelectorAll('#gallery img').forEach((el) => {
        el.addEventListener(e, openLightbox)
    })

    reportButton.addEventListener(e, report)
})
