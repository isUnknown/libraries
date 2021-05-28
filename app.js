export class StretchOnScroll {
    /**
     * Streches the target on scroll.
     * @param {HTMLElement} target - The target that should be stretched on scroll.
     * @param {number} minSize - The minimum size under which the target shouldn't shrink more.
     * @param {number} resizeCoef - [Optional] The resize coefficient. Default = 1.007.
     * @param {boolean} conditions - [Optional] Conditions to be fulfilled to execute the function.
     */
    static init(targetSelector, minSize, resizeCoef, conditions) {
        const target = document.querySelector(targetSelector)
        resizeCoef = typeof resizeCoef === 'undefined' ? 1.007 : resizeCoef
        conditions = typeof conditions === 'undefined' ? 1 === 1 : conditions
        
        let prevScrollPos = 0
        const originalSize = parseInt(window.getComputedStyle(target).getPropertyValue('font-size'))
        target.style.fontSize = originalSize + 'px'

        window.addEventListener('scroll', event => {
            if ((window.scrollY * - resizeCoef + originalSize) >= minSize && conditions) {
                target.style.fontSize = window.scrollY * - resizeCoef + originalSize + 'px'
            } else {
                target.style.fontSize = minSize + 'px'
            }
        })

    }
}

export class Filter {

    /**
     * Init filters.
     * @param {string} filtersSelector - Targets a nodes collection or array of filter buttons.
     * @param {string} itemsSelector - Targets a nodes collection of array of items to filter.
     * @param {string} activeClass - Names the class to add to the buttons when they are active.
     * @param {boolean} [multiple=false] - Sets it to true to enable the possibility to combine filters.
     * @see prepareTags
     * @see changeActiveTag
     * @see refresh
     * @see reset
     */
    static init(filtersSelector, itemsSelector, activeClass, multiple) {
        multiple = typeof multiple === 'undefined' ? false : multiple
        activeClass = typeof activeClass === 'undefined' ? 'active' : activeClass

        const filterBtns = document.querySelectorAll(filtersSelector)
        const tags = this.prepareTags(filtersSelector)
        const items = document.querySelectorAll(itemsSelector)

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {

                const newTag = btn.textContent.toLowerCase()

                if (newTag === 'tout' || newTag === 'all') {
                    this.reset(btn, tags, filterBtns, items, activeClass)
                } else if (!multiple) {        
                    this.changeActiveTag(tags, newTag)
                    this.refresh(tags, filterBtns, items, activeClass)
                } else {
                    
                }
            })
        })
    }

    /**
     * 
     * @param {*} filtersSelector 
     * @returns 
     */
    static prepareTags(filtersSelector) {
        const allTags = []
        document.querySelectorAll(filtersSelector).forEach(tag => {
            const newTag = {
                name: tag.textContent.toLowerCase(),
                active: true
            }
            allTags.push(newTag)
        })

        return allTags
    }

    static changeActiveTag(tags, newTag) {
        tags.forEach(tag => {
            tag.active = true
        })
        tags.forEach(tag => {
            if (tag.name === newTag) {
                tag.active = false
            }
        })
    }

    static refresh(tags, btns, items, activeClass) {
        tags.forEach(tag => {
            if (!tag.active) {
                btns.forEach(btn => {
                    if (btn.textContent.toLowerCase() === tag.name) {
                        btn.classList.add(activeClass)
                    } else {
                        btn.classList.remove(activeClass)
                    }
                })
                items.forEach(item => {
                    const dataset = typeof item.dataset.tag === 'undefined' ? item.dataset.tags : item.dataset.tag
                    if (!dataset || !dataset.includes(tag.name)) {
                        item.style.display = 'none'
                    } else {
                        item.style.display = ''
                    }
                })
            }
        })
    }

    static reset(btn, tags, btns, items, activeClass) {
        tags.forEach(tag => {
            tag.active = true
        })

        btns.forEach(filterBtn => {
            filterBtn.classList.remove(activeClass)
        })

        btn.classList.add(activeClass)

        items.forEach(item => {
            item.style.display = ''
        })
    }

    /**
     * Gives a class to the filter button clicked and removes it from other filter buttons.
     * @param {HTMLElement[]} filters 
     * @param {HTMLElement} target 
     * @param {string} activeClass 
     */
    static activeButton(filters, target, activeClass) {
        filters.forEach(filter => {
            filter.classList.remove(activeClass)
        })

        target.classList.add(activeClass)
    }

    /**
     * Hides the items that doesn't have the tag.
     * @param {string} tag - Tag to check.
     * @param {HTMLElement[]} items - List of nodes to hide if they don't have the tag.
     */
    static hideFilteredItems(tag, items) {
        if (tag === 'all') {
            items.forEach(item => {
                item.classList.remove('hide')
            })
        } else {
            items.forEach(item => {
                item.classList.remove('hide')
                if (item.dataset.tag !== tag) {
                    item.classList.add('hide')
                }
            })
        }
    }

    static multiple(filtersSelector) {
        const filterBtns = document.querySelectorAll(filtersSelector)
        const tags = this.prepareTags(filtersSelector)
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.textContent
                this.activeTag(tags, tag)
            })
        })
    }

    static activeTag(tags, tag) {
        tags.forEach(item => {
            if (item.name === tag) {
                item.active = true
            }
        })
    }
}

export class Load {
    /**
     * Loads all <a> tags in AJAX. 
     * @param {HTMLElement} containerSelector - Targets where the content has to be injected
     * @param {string} target - Targets the node in another page that has to be injected in the container.
     * @param {string} [method=cut] - Sets the transition method.
     * @param {number} [duration=0.5] - Sets the duration of the transition.
     */
     static init(containerSelector, target, method, duration) {
        window.onpopstate = function() {
            window.location.href = window.location.href
        }


        const container = document.querySelector(containerSelector)
        const links = document.querySelectorAll('a')
        const rootTitle = document.querySelector('title').textContent
        const rootUrl = window.location.href
        duration = typeof duration === 'undefined' ? 0.5 : duration

        links.forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault()
                
                const url = link.getAttribute('href')
                this.getData(url).then(data => {
                    const parsedData = this.parseData(data, target)
                    const title = parsedData.title
                    this.injectData(parsedData, containerSelector, container, target, method, duration)
                    this.updateHistory(rootTitle, rootUrl, title, url)
                })
            })
        })
    }
    
    /**
     * Returns a promise containing stringifyied data fetched from the URL passed.
     * @param {string} url 
     * @returns {promise}
     */
     static async getData(url) {        
        const response = await fetch(url)

        if (!response.ok) {
            throw 'Requête invalide.'
        }

        return await response.text()
    }

    /**
     * Parses the data so as to get its title, body and targeted node that has to be injected further.
     * @param {string} data - The DOM of the distant page as string.
     * @param {string} target - A string selector targeting the node that has to be injected.
     * @returns 
     */
    static parseData(data, target) {
        const page = new DOMParser().parseFromString(data, 'text/xml').firstElementChild
        const title = page.querySelector('title').textContent
        const body = page.querySelector('body')
        target = page.querySelector(target)

        const parsedData = {
            page: page,
            title: title,
            body: body,
            target: target
        }

        return parsedData
    }

    /**
     * Injects a HTML string in a container using a certain method.
     * @see App.load()
     * @param {string} data - HTML string. Received as a promise after App.load()
     * @param {HTMLElement} container - The node Where the target has to be injected.
     * @param {HTMLElement} target - The node to be injected in the container.
     * @param {string} method - [Optional] Options : 'cut' (default) or 'fade'
     */
    static injectData(parsedData, containerSelector, container, target, method, duration) {

        const data = document.createElement('div')
        data.classList.add('ajaxLoadedData')
        data.innerHTML = parsedData.target.innerHTML

        document.querySelector('title').textContent += ` - ${parsedData.title}` 

        method = typeof method === 'undefined' ? 'cut' : method
    
        if (method === 'cut') {
            document.querySelectorAll(`${containerSelector} > *`).forEach(child => {
                child.style.display = 'none'
            })
            container.appendChild(data)
        } else if (method === 'fade') {
            container.style.transition = `opacity ${duration}s ease-in-out`
            setTimeout(() => {
                container.style.opacity = '0'
                setTimeout(() => {
                    document.querySelectorAll(`${containerSelector} > *`).forEach(child => {
                        child.style.display = 'none'
                    })
                    container.appendChild(data)
                    container.style.opacity = '1'
                    const ajaxLoad = new Event('ajaxLoad')
                    document.dispatchEvent(ajaxLoad)
                }, duration * 1000);
            }, 100);
        }
    }

    /**
     * Update the navigation history.
     * @param {string} prevTitle 
     * @param {string} prevUrl 
     * @param {string} newTitle 
     * @param {string} newUrl 
     */
    static updateHistory(prevTitle, prevUrl, newTitle, newUrl) {
        history.pushState(null, prevTitle, prevUrl)
        history.pushState(null, newTitle, newUrl)
    }
}

export class Img {

    /**
     * Lazy loads images.
     * @param {string} [containerSelector=body] - Targets the container where to apply the function.
     * @param {string} [imagesSelector=.lazy] - Targets the nodes collection \ array of images on which to apply the function.
     * @param {number} [threshold=0.1] - Using a number between 0 and 1, indicates the part of the image that must be visible in the screen for it to appear. 
     */
    static lazyLoad(containerSelector, imagesSelector, threshold) {

        let init = () => {
            let images = typeof imagesSelector === 'undefined' ? document.querySelectorAll('.lazy') : document.querySelectorAll(imagesSelector)
            let container =  typeof containerSelector === 'undefined' ? document.querySelector('body') : document.querySelector(containerSelector)
            threshold = typeof threshold === 'undefined' ? 0.1 : threshold

            let callback = entries => {
                entries.forEach(entry => {
                    let ratio = entry.intersectionRatio
                    let target = entry.target
                    if (ratio >= threshold) {
                        target.setAttribute('src', target.dataset.src)
                    }
                })
            }

            let options = {
                threshold: threshold
            }

            let observer = new IntersectionObserver(callback, options)

            console.log(images);
            images.forEach(image => {
                observer.observe(image)
            })
        }

        init()

        document.addEventListener('ajaxLoad', () => {
            init()
        })
    }

    /**
     * Smoothly fades images in when they are fully loaded.
     * @param {string} [bgColor=#EEE] - [Optional] Sets the background color that will be shown before an image is fully loaded.
     * @param {string} [duration=.5s] - [Optional] Sets the duration of the transition.
     */
    static fadeIn(bgColor, duration) {
        let init = () => {
            bgColor = typeof bgColor === 'undefined' ? '#EEE' : bgColor
            duration = typeof duration === 'undefined' ? '.5s' : duration

            const images = document.querySelectorAll('img')

            images.forEach(img => {
                img.style.position = 'relative'
                img.style.zIndex = '1'
                img.style.transition = `opacity ${duration} ease-in-out`

                const parent = img.parentNode
                parent.style.position = 'relative'
                
                const bg = document.createElement('div')
                bg.classList.add('imgBg')
                bg.style.backgroundColor = bgColor
                bg.style.transition = `opacity ${duration} ease-in-out`
                bg.style.opacity = '1'
                bg.style.position = 'absolute'
                bg.style.width = '100%'
                bg.style.height = '100%'
                bg.style.top = '0'
                bg.style.left = '0'
                bg.style.zIndex = '0'

                parent.appendChild(bg)
                
                if (img.getAttribute('src').length > 0 &&  img.complete) {
                    setTimeout(() => {
                        img.style.opacity = '1'
                        bg.style.opacity = '0'
                    }, 5);
                } else {
                    img.addEventListener('load', () => {
                        setTimeout(() => {
                            img.style.opacity = '1'
                            bg.style.opacity = '0'
                        }, 5);
                    })
                }
            })
        }
        init()
        document.addEventListener('ajaxLoad', () => {
            init()
        })
    }
}

export class Data {

    static async fetchApiData (apiUrl) {
        let headers = new Headers()
        let username = 'adrien.payet@outlook.com'
        let password = 'Ap&216991'
        headers.set('Authorization', 'Basic ' + btoa(username + ":" + password))

        const rawData = await fetch(apiUrl, {
            method: "GET",
            headers: headers
        })
        const jsonData = await rawData.json()
        const data = await jsonData.data
    
        return data
    }
    
    static update(siteUrl, page, key, value) {
        fetch(`${siteUrl}/update-data/${key}/${value}/${page}`, {
            method: 'GET'
        }).then(response => {
            if(response.ok) {
              console.log('Data correctly updated')
            } else {
              console.log('Wrong network response');
            }
          })
          .catch(function(error) {
            console.log('There have been a problem with the fetch : ' + error.message);
          });
    }
}

export class String {
    /**
     * 
     * @param {string} string
     * @returns 
     */
    static removeAccent(string) {
        string = string.replace(new RegExp(/[àáâãäå]/g),"a");
        string = string.replace(new RegExp(/æ/g),"ae");
        string = string.replace(new RegExp(/ç/g),"c");
        string = string.replace(new RegExp(/[èéêë]/g),"e");
        string = string.replace(new RegExp(/[ìíîï]/g),"i");
        string = string.replace(new RegExp(/ñ/g),"n");                
        string = string.replace(new RegExp(/[òóôõö]/g),"o");
        string = string.replace(new RegExp(/œ/g),"oe");
        string = string.replace(new RegExp(/[ùúûü]/g),"u");
        string = string.replace(new RegExp(/[ýÿ]/g),"y");
        
        return string
    }
}