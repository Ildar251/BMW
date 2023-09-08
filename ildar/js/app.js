window.onload = function() { 
    
const slider = new Swiper('.slider', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    speed: 500,
    allowTouchMove: false
});

const SVG_LOGO = '../images/icons/logo.svg';
const SVG_LIKE = '../images/icons/like.svg'

const API_URL = "https://private-anon-b7f8f4d975-grchhtml.apiary-mock.com/slides";

let currentPage = 0; 
const slidesPerPage = 3; 
let totalSlides = 0; 

getSlides(0, slidesPerPage);

function getTotalNumberOfSlides() {
    const url = `${API_URL}`;
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка HTTP: " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        totalSlides = data.countAll
      })
      .catch((error) => {
        console.error("Error:", error);
      });
}

getTotalNumberOfSlides();

function getSlides(offset, limit) {

    const url = `${API_URL}?offset=${offset}&limit=${limit}`;

    fetch(url)
        .then((response) => {
        if (!response.ok) {
            throw new Error("Ошибка HTTP: " + response.status);
        }
        return response.json();
        })
        .then((data) => {
            data.data.forEach(item => {
                const slide = document.createElement("div");
                slide.classList.add("swiper-slide");
                slide.style.background = `url(${item.imgUrl}) center / cover no-repeat, lightgray 50% / cover no-repeat`;

                const likedSlide = localStorage.getItem(`liked-${item.id}`)


                slide.innerHTML = `
                <div class="logo">
                    <img src="${SVG_LOGO}" alt="Логотип">
                </div>
                <h1 class="title">
                    ${item.title}
                </h1>
                <div class="line"></div>
                <p class="subtitle">
                    ${item.desc}
                </p>
                <div class="swiper-slide__footer likes">
                    <button class="likes__btn" data-id="${item.id}"'}>
                        <img src="${SVG_LIKE}" alt="Логотип">
                    </button>
                    <div class="likes__count" id="likes-count-${item.id}">
                    <p>like:
                        <span>
                        ${likedSlide ? item.likeCnt + 1 : item.likeCnt}
                        </span>
                    </p>
                    </div>
                </div>
                `;

                slider.appendSlide(slide);

                const likeBtn = slide.querySelector('.likes__btn');
                likeBtn.addEventListener('click', () => {
                    const itemId = likeBtn.getAttribute('data-id');
                    const liked = likeBtn.getAttribute('data-liked') === 'true'; 
                
                    if (!liked) {
                        postLike(itemId);
                        likeBtn.setAttribute('data-liked', 'true'); 

                        localStorage.setItem(`liked-${itemId}`, 'true');
                    }
                });
            });
        })
        .catch((error) => {
        console.error("Error:", error);
        });
}

function postLike(id) {

    const likedSlide = localStorage.getItem(`liked-${id}`) 

    if (likedSlide) {
        return
    }

    const url = `https://private-anon-a33ac6d754-grchhtml.apiary-mock.com/slides/${id}/like`;
    const data = {};

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data), 
    };
    fetch(url, options)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const likesCountElement = document.querySelector(`#likes-count-${id} span`);
        
        const currentLikes = parseInt(likesCountElement.textContent, 10);
        likesCountElement.textContent = currentLikes + 1;

        const popupContent = document.getElementById('popupContent')
        popupContent.innerHTML = `
            <div class='title'>
                ${data.title}
            </div>
            <div class='desc'>
                ${data.desc}
            </div>
        `
        openPopup()

    })
    .catch(error => {
        console.error('Произошла ошибка:', error);
        const popupContent = document.getElementById('popupContent')
        popupContent.innerHTML = `
            <div class='title'>
                Ошибка
            </div>
            <div class='desc'>
                При отправке отзыва произошла ошибка.
            </div>
        `
        openPopup()
    });
}

slider.on('reachEnd', () => {
    currentPage++;
    
    if (currentPage * slidesPerPage < totalSlides) {
      const offset = currentPage * slidesPerPage;
      getSlides(offset, slidesPerPage);
    }

});


const popupContainer = document.getElementById('popupContainer');

function openPopup() {
    popupContainer.style.display = 'block';
}

function closePopup() {
    popupContainer.style.display = 'none';
}

popupContainer.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
        closePopup();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePopup();
    }
});

};