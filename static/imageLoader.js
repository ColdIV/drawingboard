(function () {

    const gallery = document.querySelector('#gallery')
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

            gallery.insertBefore(imageEl, loader)
        })
    }

    const hideLoader = () => {
        loader.classList.remove('loading')
    }

    const showLoader = () => {
        loader.classList.add('loading')
    }

    // not yet working
    const hasMoreimages = (page, limit, total) => {
        const startIndex = (page - 1) * limit + 1;
        return total === 0 || startIndex < total;
    };

    const loadimages = async (offset) => {
        showLoader();

        setTimeout(async () => {

            try {
                if (true || hasMoreimages(page, limit, total)) {
                    const response = await getImages(offset)
                    if (response.success) {
                        showImages(response.images)
                        currentOffset = response.offset
                    } else {
                        loadMore = false
                    }
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

    window.onscroll = function() {
        var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,  document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight );
        if ((window.innerHeight + window.scrollY) >= pageHeight - 100) {
            if (lockLoad) return
            lockLoad = true

            if (loadMore) {
                loadimages(currentOffset)
            }
        }
    }
})();