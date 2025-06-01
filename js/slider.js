
function generateDayProductCard(item) {
  return `
    <div class="product-card product-card--small">
      <div class="product-card__visual">
        <img class="product-card__img" src="${item.image}" height="344" width="290" alt="Изображение товара">
        <div class="product-card__more">
          <a href="#" class="product-card__link btn btn--icon" data-id="${item.id}">
            <span class="btn__text">В корзину</span>
            <svg width="24" height="24" aria-hidden="true">
              <use xlink:href="images/sprite.svg#icon-basket"></use>
            </svg>
          </a>
          <a href="#" class="product-card__link btn btn--secondary">
            <span class="btn__text">Подробнее</span>
          </a>
        </div>
      </div>
      <div class="product-card__info">
        <h2 class="product-card__title">${item.name}</h2>
        <span class="product-card__old">
          <span class="product-card__old-number">${item.price.old}</span>
          <span class="product-card__old-add">₽</span>
        </span>
        <span class="product-card__price">
          <span class="product-card__price-number">${item.price.new}</span>
          <span class="product-card__price-add">₽</span>
        </span>
        <div class="product-card__tooltip tooltip">
          <button class="tooltip__btn" aria-label="Показать подсказку">
            <svg class="tooltip__icon" width="5" height="10" aria-hidden="true">
              <use xlink:href="images/sprite.svg#icon-i"></use>
            </svg>
          </button>
          <div class="tooltip__content" style="display:none;">
            <span class="tooltip__text">Наличие товара по городам:</span>
            <ul class="tooltip__list">
              <li class="tooltip__item">
                <span class="tooltip__text">Москва: <span class="tooltip__count">${item.availability.moscow}</span></span>
              </li>
              <li class="tooltip__item">
                <span class="tooltip__text">Оренбург: <span class="tooltip__count">${item.availability.orenburg}</span></span>
              </li>
              <li class="tooltip__item">
                <span class="tooltip__text">Санкт-Петербург: <span class="tooltip__count">${item.availability.saintPetersburg}</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.initDayProductsSlider = function(data) {
    const goodsOfDay = data.filter(item => item.goodsOfDay);
    const list = document.querySelector('.day-products__list');
    if (!list) return;
  
    list.innerHTML = '';
    goodsOfDay.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('day-products__item', 'swiper-slide');
      li.innerHTML = generateDayProductCard(item);
      list.appendChild(li);
    });
  
     new Swiper('.day-products__slider', {
    // опициональные параметры
    loop: true,
    spaceBetween: 20, 

    // навигация
    navigation: {
      nextEl: '.day-products__navigation-btn--next',
      prevEl: '.day-products__navigation-btn--prev',
    },

    
    breakpoints: {
      
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      
      768: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      
      1024: {
        slidesPerView: 3,
        spaceBetween: 40
      },
    }
  });
  };