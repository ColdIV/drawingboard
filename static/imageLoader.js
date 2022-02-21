(function () {

    const gallery = document.querySelector('#gallery')
    const imageContainer = gallery.querySelector('.image-container')
    const loader = document.querySelector('#loader')
    const URL = gallery.dataset.url
    const startOffset = gallery.dataset.offset
    const filter = document.querySelector('#filter')
    const yearContainer = filter.querySelector('#year')
    const monthContainer = filter.querySelector('#month')
    const resetButton = filter.querySelector('#reset')

    const getImages = async (offset, year = 0, month = 0, fresh = false) => {
        let API_URL = URL + offset + ((year + month) == 0 ? '' : '/' + year + '/' + month)
        if (fresh) {
            // fresh request should provide a higher limit
            API_URL = URL + offset + '/' + year + '/' + month + '/True'
        }
        const response = await fetch(API_URL)
        
        if (!response.ok) {
            throw new Error(`An error occurred: ${response.status}`)
        }

        return await response.json()
    }

    const showImages = (images) => {
        images.forEach(image => {
            const imageEl = document.createElement('img')
            imageEl.dataset.verified = (image.verified) ? 'True' : 'False'
            imageEl.src = image.path
            imageEl.addEventListener('click', openLightbox)
            imageEl.addEventListener('touch', openLightbox)

            imageContainer.appendChild(imageEl)
        })
    }

    const hideLoader = () => {
        loader.classList.remove('loading')
        resetButton.classList.remove('loading')
        imageContainer.classList.remove('loading')
    }

    const showLoader = () => {
        loader.classList.add('loading')
    }

    const enableLoader = () => {
        loadMore = true
        loader.disabled = false
        loader.classList.remove('disabled')
        loader.innerHTML = 'load more'
    }

    const loadimages = async (offset, year = 0, month = 0, fresh = false) => {
        if (fresh == false) {
            showLoader();
        } else {
            imageContainer.classList.add('loading')
        }

        setTimeout(async () => {
            try {
                const response = await getImages(offset, year, month, fresh)
                if (response.success) {
                    showImages(response.images)
                    currentOffset = response.offset
                } else {
                    loadMore = false
                    loader.disabled = true
                    loader.classList.add('disabled')
                    loader.innerHTML = 'no more images'
                }
            } catch (error) {
                console.log(error.message)
            } finally {
                hideLoader()
                lockLoad = false
            }
        }, 500)
    }

    let currentOffset = startOffset
    let loadMore = true
    let lockLoad = false

    function loadBtn () {
        if (lockLoad) return
        lockLoad = true

        if (loadMore) {
            year = parseInt(yearContainer.value)
            month = parseInt(monthContainer.value)
            loadimages(currentOffset, year, month)
        }
    }

    loader.addEventListener('click', loadBtn)
    loader.addEventListener('touch', loadBtn)


    function updateFilter () {
        imageContainer.innerHTML = ''
        if (lockLoad) return
        lockLoad = true

        enableLoader()

        year = parseInt(yearContainer.value)
        month = parseInt(monthContainer.value)
        loadimages(0, year, month, true)
    }

    function reset () {
        yearContainer.value = 0
        monthContainer.value = 0
        resetButton.classList.add('loading')
        year = 0
        month = 0

        imageContainer.innerHTML = ''
        if (lockLoad) return
        lockLoad = true

        enableLoader()

        loadimages(0, year, month, true)

    }

    monthContainer.addEventListener('change', updateFilter)
    yearContainer.addEventListener('change', updateFilter)
    resetButton.addEventListener('click', reset)
    resetButton.addEventListener('touch', reset)
})()