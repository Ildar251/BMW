window.onload = function () {
	const slider = new Swiper('.slider', {
		parallax: true,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		speed: 1500,
		allowTouchMove: false,
	})

	const API_URL =
		'https://private-anon-b7f8f4d975-grchhtml.apiary-mock.com/slides'

	let currentPage = 0
	const slidesPerPage = 3
	let totalSlides = 0

	getSlides(0, slidesPerPage)

	function getTotalNumberOfSlides() {
		const url = `${API_URL}`

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Ошибка HTTP: ' + response.status)
				}
				return response.json()
			})
			.then(data => {
				totalSlides = data.countAll
			})
			.catch(error => {
				console.error('Error:', error)
			})
	}

	getTotalNumberOfSlides()

	function getSlides(offset, limit) {
		const url = `${API_URL}?offset=${offset}&limit=${limit}`

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Ошибка HTTP: ' + response.status)
				}
				return response.json()
			})
			.then(data => {
				data.data.forEach(item => {
					const slide = document.createElement('div')
					slide.classList.add('swiper-slide')
					slide.style.background = ``

					const likedSlide = localStorage.getItem(`liked-${item.id}`)

					slide.innerHTML = `
					<div class="swiper-slide-item" data-swiper-parallax="20%" data-swiper-parallax-scale="1.1"  style="background: url(${item.imgUrl ? item.imgUrl : '../images/error.png'}) center / ${item.imgUrl ? 'cover' : '50%'} no-repeat, lightgray 50% / cover no-repeat;" >
                    <h1 class="title" data-swiper-parallax="-50%" >${item.title}</h1>
                    <div class="line">${SVG_LINE}</div>
                    <p class="subtitle" data-swiper-parallax-opacity="0">${item.desc} </p>
                    <div class="swiper-slide__footer likes">
                        <button 
							class="likes__btn ${likedSlide ? 'active' : false}" 
							data-id="${item.id}">${SVG_LIKE}
						</button>
                        <div class="likes__count" id="likes-count-${item.id}">
                            <p>like: <span> ${likedSlide ? item.likeCnt + 1 : item.likeCnt}</span></p>
                        </div>
                    </div>
                	</div>
                    
                    `

					slider.appendSlide(slide)

					const likeBtn = slide.querySelector('.likes__btn')
					likeBtn.addEventListener('click', () => {

						const itemId = likeBtn.getAttribute('data-id')
						const liked = likeBtn.getAttribute('data-liked') === 'true'
						likeBtn.classList.add("active");
						if (!liked) {
							postLike(itemId)
							likeBtn.setAttribute('data-liked', 'true')

							localStorage.setItem(`liked-${itemId}`, 'true')
						}
					})
				})
			})
			.catch(error => {
				console.error('Error:', error)
			})

	}



	function postLike(id) {
		const likedSlide = localStorage.getItem(`liked-${id}`)

		if (likedSlide) {
			let btn_Liked = document.getElementsByClassName('likes__btn')
			btn_Liked.classList.add("active");
			return
		}

		const url = `https://private-anon-a33ac6d754-grchhtml.apiary-mock.com/slides/${id}/like`
		const data = {}

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}
		fetch(url, options)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				const likesCountElement = document.querySelector(
					`#likes-count-${id} span`
				)

				const currentLikes = parseInt(likesCountElement.textContent, 10)
				likesCountElement.textContent = currentLikes + 1

				const popupContent = document.getElementById('popup__container')
				popupContent.innerHTML = `
                <div class='popup__container-title'>
                    ${data.title}
                </div>
                <div class='popup__container-desc'>
                    ${data.desc}
                </div>
                <div class="popup_close" id="popup_close">
               		${SVG_CLOSE}
            	</div>
            `
				openPopup()
			})
			.catch(error => {
				console.error('Произошла ошибка:', error)
				const popupContent = document.getElementById('popup__container')
				popupContent.innerHTML = `
                <div class='popup__container-title'>
                    Ошибка
                </div>
                <div class='popup__container-desc'>
                    При отправке отзыва произошла ошибка.
                </div>
                <div class="popup_close" id="popup_close">
                	${SVG_CLOSE}
           		</div>
            `
				openPopup()
			})
	}

	slider.on('reachEnd', () => {
		currentPage++

		if (currentPage * slidesPerPage < totalSlides) {
			const offset = currentPage * slidesPerPage
			getSlides(offset, slidesPerPage)
		}
	})

	const popup = document.getElementById('popup')

	function openPopup() {
		popup.classList.add('popup_open')
		popup.querySelector('.popup__container').classList.add('open')
		document.getElementById('popup_close').addEventListener('click', () => closePopup())
	}

	function closePopup() {
		popup.classList.remove('popup_open')
		popup.querySelector('.popup__container').classList.remove('open')
	}

	popup.addEventListener('click', event => {
		if (event.target === popup) {
			closePopup()
		}
	})

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			closePopup()
		}
	})

}


