(function () {

    const gallery = document.querySelector('#gallery')
    const imageContainer = gallery.querySelector('.image-container')
    const loader = document.querySelector('#loader')
    const URL = gallery.dataset.url
    const startOffset = gallery.dataset.offset

    const getImages = async (offset) => {
        const API_URL = URL + offset
        const response = await fetch(API_URL)
        
        if (!response.ok) {
            throw new Error(`An error occurred: ${response.status}`)
        }

        return await response.json()
    }

    const showImages = (images) => {
        images.forEach(image => {
            const imageEl = document.createElement('img')
            imageEl.dataset.verified = image.verified
            imageEl.src = image.path
            imageEl.addEventListener('click', openLightbox)
            imageEl.addEventListener('touch', openLightbox)

            imageContainer.appendChild(imageEl)
        })
    }

    const hideLoader = () => {
        loader.classList.remove('loading')
    }

    const showLoader = () => {
        loader.classList.add('loading')
    }

    const loadimages = async (offset) => {
        showLoader();

        setTimeout(async () => {
            try {
                const response = await getImages(offset)
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
            loadimages(currentOffset)
        }
    }

    loader.addEventListener('click', loadBtn)
    loader.addEventListener('touch', loadBtn)
})()