
window.addEventListener('DOMContentLoaded', () => {
  loadBasketFromStorage();
  console.log("Успешно подгружено");
  // Загружаем продукты только если есть каталог и это не basket.html
  if (document.querySelector('.catalog__list') && !window.location.pathname.endsWith('basket.html')) {
    load(); // загрузка продуктов
  }

  const sortSelect = document.querySelector(".catalog__sort-select");
  if (sortSelect) sortSelect.addEventListener('change', sortBy);

  const locationCity = document.querySelector(".location__city");
  if (locationCity) locationCity.addEventListener('click', showLocation);

  document.querySelectorAll(".location__sublink").forEach(btn => {
    btn.addEventListener('click', function(e) {
      changeLocation.call(this, e);
      // Сохраняем выбранный город в localStorage
      var city = this.textContent.trim();
      localStorage.setItem('selectedCity', city);
    });
  });

  // Восстанавливаем город из localStorage при загрузке
  var savedCity = localStorage.getItem('selectedCity');
  if (savedCity) {
    var cityNameEl = document.querySelector('.location__city-name');
    if (cityNameEl) cityNameEl.textContent = savedCity;
  }

  const instock = document.getElementById('instock');
  if (instock) instock.addEventListener('change', applyAllFilters);
  const allItem = document.getElementById('all-item');
  if (allItem) allItem.addEventListener('change', applyAllFilters);

  document.querySelectorAll('input[name="type"]').forEach(cb => {
    cb.addEventListener('change', applyAllFilters);
  });

  //  Открытие бургерного меню Каталог 
  const catalogBtn = document.querySelector('.header__catalog-btn');
  const mainMenu = document.querySelector('.main-menu');
  const mainMenuClose = document.querySelector('.main-menu__close');

  if (catalogBtn && mainMenu) {
    catalogBtn.addEventListener('click', () => {
      mainMenu.classList.add('main-menu--active');
    });
  }
  if (mainMenuClose && mainMenu) {
    mainMenuClose.addEventListener('click', () => {
      mainMenu.classList.remove('main-menu--active');
    });
  }

  //  Открытие/закрытие корзины 
  const basketBtn = document.querySelector('.header__user-btn');
  const basket = document.querySelector('.header__basket');

  //  Сброс фильтров каталога 
  const catalogForm = document.querySelector('.catalog-form');
  if (catalogForm) {
    catalogForm.addEventListener('reset', function() {
      setTimeout(applyAllFilters, 0);
    });
  }
  if (basketBtn && basket) {
    basketBtn.addEventListener('click', () => {
      basket.classList.toggle('basket--active');
    });
  }
  const form = document.querySelector('.questions__form');
  if (form) {
    const validate = new window.JustValidate(form, {
      errorFieldCssClass: 'is-invalid',
      errorLabelStyle: {
        color: '#d32f2f',
        fontSize: '14px',
      },
    });

    validate
      .addField('#name', [
        {
          rule: 'required',
          errorMessage: 'Введите имя',
        },
        {
          rule: 'minLength',
          value: 3,
          errorMessage: 'Имя должно быть не менее 3 символов',
        },
        {
          rule: 'maxLength',
          value: 20,
          errorMessage: 'Имя должно быть не более 20 символов',
        },
      ])
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: 'Введите email',
        },
        {
          rule: 'email',
          errorMessage: 'Введите корректный email',
        },
      ])
      .addField('#agree', [
        {
          rule: 'required',
          errorMessage: 'Необходимо согласие',
        },
      ])
      .onSuccess((event) => {
        event.preventDefault();
        sendForm(form);
      });
  }
  document.querySelectorAll('.accordion__btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const isActive = this.classList.contains('accordion__btn--active');
      // Закрыть все
      document.querySelectorAll('.accordion__btn').forEach(b => b.classList.remove('accordion__btn--active'));
      document.querySelectorAll('.accordion__content').forEach(c => c.style.display = 'none');
      if (!isActive) {
        // Открыть выбранный
        this.classList.add('accordion__btn--active');
        const content = this.parentElement.querySelector('.accordion__content');
        if (content) content.style.display = 'flex';
      }
      // Если был активен — всё закроется
    });
  });
  // Делегирование для кнопок "В корзину" и удаления из корзины
  document.body.addEventListener('click', function (e) {
    // Добавление в корзину
    const btn = e.target.closest('.product-card__link.btn--icon');
    if (btn && btn.querySelector('.btn__text')?.textContent.trim() === 'В корзину') {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;
      const id = card.getAttribute('data-id');
      if (!id) return;
      addToBasket(id);
    }
    // Удаление товара из корзины
    const closeBtn = e.target.closest('.basket__item-close');
    if (closeBtn) {
      const basketItem = closeBtn.closest('.basket__item');
      if (basketItem) {
        const id = basketItem.getAttribute('data-id');
        removeFromBasket(id);
      }
    }
  } 
  
);

  // Первичная отрисовка корзины
  renderBasket();

  //  ЛОГИН 
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const message = document.getElementById('login-message');
      // Получаем пользователей из localStorage
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('users')) || [];
      } catch (e) {
        users = [];
      }
      // Проверка на admin/1 (старая логика)
      let user = null;
      if (username === 'admin' && password === '1') {
        user = { username: 'admin' };
      } else {
        user = users.find(u => u.username === username && u.password === password);
      }
      if (user) {
        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('username', user.username);
        message.style.color = 'green';
        message.textContent = 'Успешный вход!';
        setTimeout(() => {
          window.location.href = 'catalog.html';
        }, 1000);
      } else {
        localStorage.removeItem('isAuth');
        localStorage.removeItem('username');
        message.style.color = '#d32f2f';
        message.textContent = 'Неверный логин или пароль';
      }
    });
  }

  //  РЕГИСТРАЦИЯ
  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const message = document.getElementById('registration-message');
      // Получаем пользователей
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('users')) || [];
      } catch (e) {
        users = [];
      }
      // Проверка на уникальность username/email
      if (users.find(u => u.username === username)) {
        message.style.color = '#d32f2f';
        message.textContent = 'Пользователь с таким логином уже существует';
        return;
      }
      if (users.find(u => u.email === email)) {
        message.style.color = '#d32f2f';
        message.textContent = 'Пользователь с таким email уже существует';
        return;
      }
      // Добавляем пользователя
      users.push({ username, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      message.style.color = 'green';
      message.textContent = 'Регистрация успешна! Теперь вы можете войти.';
      regForm.reset();
    });
  }

  // --- КНОПКА ВОЙТИ/ВЫЙТИ ---
  function updateAuthButton() {
    const userList = document.querySelector('.header__user-list');
    if (!userList) return;
    // Ищем <li> с кнопкой Войти/Выйти (последний элемент)
    const items = userList.querySelectorAll('.header__user-item');
    if (!items.length) return;
    const loginItem = items[items.length - 1];
    const isAuth = localStorage.getItem('isAuth') === 'true';
    if (isAuth) {
      // Если авторизован — показать кнопку Выйти и имя пользователя
      const username = localStorage.getItem('username') || '';
      loginItem.innerHTML = `
        <button class="header__user-btn" id="logout-btn" type="button">
          <span class="header__user-text">Выйти</span>
          <svg class="header__user-icon" width="24" height="24" aria-hidden="true">
            <use xlink:href="images/sprite.svg#icon-user"></use>
          </svg>
        </button>
        <span style="margin-left:8px;font-size:14px;color:#333;">(${username})</span>
      `;
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          localStorage.removeItem('isAuth');
          localStorage.removeItem('username');
          updateAuthButton();
        });
      }
    } else {
      // Если не авторизован — показать кнопку Войти
      loginItem.innerHTML = `
        <a href="login.html">
          <button class="header__user-btn" type="button">
            <span class="header__user-text">Войти</span>
            <svg class="header__user-icon" width="24" height="24" aria-hidden="true">
              <use xlink:href="images/sprite.svg#icon-user"></use>
            </svg>
          </button>
        </a>
      `;
    }
  }
  updateAuthButton();
  window.addEventListener('storage', updateAuthButton);
//  Обратный звонок: плавный скролл к блоку помощи 
  var callbackBtn = document.querySelector('.header__btn.btn');
  var contactHelp = document.getElementById('contact-help');
  if (callbackBtn && contactHelp) {
    callbackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      contactHelp.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

//  Пагинация 
let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let filteredData = []; // Сохраняем отфильтрованные данные для пагинации

//  Корзина 
window.window.basketItems = [];

function getCurrentBasketKey() {
  return localStorage.getItem('username') || 'guest';
}
// Загрузка корзины из localStorage
function loadBasketFromStorage() {
  const data = localStorage.getItem('basketByUser');
  let allBaskets = {};
  if (data) {
    try {
      allBaskets = JSON.parse(data);
    } catch (e) {
      allBaskets = {};
    }
  }
  const key = getCurrentBasketKey();
  window.basketItems = allBaskets[key] || [];
}
// Сохранение корзины в localStorage
function saveBasketToStorage() {
  const data = localStorage.getItem('basketByUser');
  let allBaskets = {};
  if (data) {
    try {
      allBaskets = JSON.parse(data);
    } catch (e) {
      allBaskets = {};
    }
  }
  const key = getCurrentBasketKey();
  allBaskets[key] = window.basketItems;
  localStorage.setItem('basketByUser', JSON.stringify(allBaskets));
}

// Универсальный справочник городов
const CITY_MAP = {
  "Москва": "moscow",
  "Оренбург": "orenburg",
  "Санкт-Петербург": "saintPetersburg"
};

function getCurrentCityKey() {
  const city = document.querySelector(".location__city-name").textContent.trim();
  return CITY_MAP[city] || "";
}

function fetchData() {
  return fetch('./data/data.json').then(response => response.json());
}

// Получить выбранные типы светильников из чекбоксов фильтра
function getSelectedTypes() {
  const checked = document.querySelectorAll('input[name="type"]:checked');
  return Array.from(checked).map(cb => cb.value);
}

// Получить выбранный фильтр наличия: 'instock', 'all-item', или null
function getStockFilter() {
  const instock = document.getElementById('instock');
  const allItem = document.getElementById('all-item');
  if (instock && instock.checked) return 'instock';
  if (allItem && allItem.checked) return 'all-item';
  return null;
}

// Применить все фильтры к данным и сбросить страницу
function applyAllFilters() {
  fetchData()
    .then(data => {
      // 1. Фильтрация по наличию
      const stockFilter = getStockFilter();
      if (stockFilter === 'instock') {
        const cityKey = getCurrentCityKey();
        if (cityKey) {
          data = data.filter(item =>
            item.availability && item.availability[cityKey] > 0
          );
        }
      }
      // 2. Фильтрация по типу светильника
      const selectedTypes = getSelectedTypes();
      if (selectedTypes.length > 0) {
        data = data.filter(item =>
          Array.isArray(item.type)
            ? item.type.some(type => selectedTypes.includes(type))
            : selectedTypes.includes(item.type)
        );
      }
      filteredData = data;
      currentPage = 1;
      renderPage();
    })
    .catch(error => console.log('Err:', error));
}

// Функция для отображения текущей страницы товаров и пагинации
function renderPage() {
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageItems = filteredData.slice(startIdx, endIdx);
  visibleitems(pageItems);
  renderPagination(totalPages);
}

// Функция для отрисовки кнопок пагинации
function renderPagination(totalPages) {
  let pagination = document.querySelector(".catalog__pagination");
  if (!pagination) {
    // Если блока пагинации нет, создаем его после .catalog__list
    const catalogList = document.querySelector(".catalog__list");
    if (!catalogList) return;
    pagination = document.createElement("ul");
    pagination.className = "catalog__pagination";
    catalogList.parentNode.insertBefore(pagination, catalogList.nextSibling);
  }
  pagination.innerHTML = "";

  if (totalPages <= 1) return; // Не показываем пагинацию, если всего 1 страница

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "catalog__pagination-item";
    const btn = document.createElement("button");
    btn.className = "catalog__pagination-link";
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.appendChild(btn);
    pagination.appendChild(li);
  }
}

// Модификация функции сортировки для работы с пагинацией и фильтрами
function sortBy() {
  const sortValue = this.value;
  fetchData()
    .then(data => {
      switch (sortValue) {
        case "price-max":
          data.sort((a, b) => b.price.new - a.price.new);
          break;
        case "price-min":
          data.sort((a, b) => a.price.new - b.price.new);
          break;
        case "rating-max":
          data.sort((a, b) => b.rating - a.rating);
          break;
      }
      // Применяем фильтры к отсортированным данным
      const stockFilter = getStockFilter();
      if (stockFilter === 'instock') {
        const cityKey = getCurrentCityKey();
        if (cityKey) {
          data = data.filter(item =>
            item.availability && item.availability[cityKey] > 0
          );
        }
      }
      const selectedTypes = getSelectedTypes();
      if (selectedTypes.length > 0) {
        data = data.filter(item =>
          Array.isArray(item.type)
            ? item.type.some(type => selectedTypes.includes(type))
            : selectedTypes.includes(item.type)
        );
      }
      filteredData = data;
      currentPage = 1;
      renderPage();
    })
    .catch(error => console.log('Err:', error));
}

// Модификация функции load для инициализации пагинации
function load() {
  fetchData()
    .then(data => {
      filteredData = data;
      currentPage = 1;
   
      
      renderPage();
      updateFilterCategoryCounts(data);


      initDayProductsSlider(data);
    })
    .catch(error => console.log('Err:', error));
}

function showTooltip() {
  const div = this.parentElement.querySelector('.tooltip__content');
  if (div) div.style.display = "flex";
}

function hideTooltip() {
  const div = this.parentElement.querySelector('.tooltip__content');
  if (div) div.style.display = "none";
}

// data-id карточкам товаров и обработка "В корзину" 
function visibleitems(data) {
  loadBasketFromStorage();
  console.log("Отрисовка всех товаров по фильтрам");
  const mainApp = document.querySelector(".catalog__list");
  if (!mainApp) return;
  mainApp.innerHTML = "";

  data.forEach(element => {
    const inBasket = window.basketItems.some(item => String(item.id) === String(element.id));
    mainApp.innerHTML += `
      <li class="catalog__item">
          <div class="product-card" data-id="${element.id}">
              <div class="product-card__visual">
                  <img class="product-card__img" src="${element.image}" height="436" width="290" alt="Изображение товара">
                  <div class="product-card__more">
                      ${inBasket
                        ? `<a href="basket.html" class="product-card__link btn btn--icon" style="background:#007aff;color:#fff;">
                            <span class="btn__text">Перейти в корзину</span>
                            <svg width="24" height="24" aria-hidden="true">
                              <use xlink:href="images/sprite.svg#icon-basket"></use>
                            </svg>
                          </a>`
                        : `<a href="#" class="product-card__link btn btn--icon">
                            <span class="btn__text">В корзину</span>
                            <svg width="24" height="24" aria-hidden="true">
                              <use xlink:href="images/sprite.svg#icon-basket"></use>
                            </svg>
                          </a>`}
                      <a href="#" class="product-card__link btn btn--secondary">
                          <span class="btn__text">Подробнее</span>
                      </a>
                  </div>
              </div>
              <div class="product-card__info">
                  <h2 class="product-card__title">${element.name}</h2>
                  <span class="product-card__old">
                      <span class="product-card__old-number">${element.price.old}</span>
                      <span class="product-card__old-add">₽</span>
                  </span>
                  <span class="product-card__price">
                      <span class="product-card__price-number">${element.price.new}</span>
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
                                  <span class="tooltip__text">Москва: <span class="tooltip__count">${element.availability.moscow}</span></span>
                              </li>
                              <li class="tooltip__item">
                                  <span class="tooltip__text">Оренбург: <span class="tooltip__count">${element.availability.orenburg}</span></span>
                              </li>
                              <li class="tooltip__item">
                                  <span class="tooltip__text">Санкт-Петербург: <span class="tooltip__count">${element.availability.saintPetersburg}</span></span>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </li>
      `;
  });

  document.querySelectorAll(".tooltip__btn").forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function visibleGoods(data) {
  loadBasketFromStorage();
  console.log("Отрисовка товаров дня");
  const mainApp = document.querySelector(".day-products__list");
  if (!mainApp) return;
  mainApp.innerHTML = "";

  data.forEach(element => {
    if (element.goodsOfDay) {
      const inBasket = window.basketItems.some(item => String(item.id) === String(element.id));
      mainApp.innerHTML += `
          <li class="day-products__item">
              <div class="product-card product-card--small">
                  <div class="product-card__visual">
                      <img class="product-card__img" src="${element.image}" height="344" width="290" alt="Изображение товара">
                      <div class="product-card__more">
                          ${inBasket
                            ? `<a href="basket.html" class="product-card__link btn btn--icon" style="background:#007aff;color:#fff;">
                                <span class="btn__text">Перейти в корзину</span>
                                <svg width="24" height="24" aria-hidden="true">
                                  <use xlink:href="images/sprite.svg#icon-basket"></use>
                                </svg>
                              </a>`
                            : `<a href="#" class="product-card__link btn btn--icon">
                                <span class="btn__text">В корзину</span>
                                <svg width="24" height="24" aria-hidden="true">
                                  <use xlink:href="images/sprite.svg#icon-basket"></use>
                                </svg>
                              </a>`}
                          <a href="#" class="product-card__link btn btn--secondary">
                              <span class="btn__text">Подробнее</span>
                          </a>
                      </div>
                  </div>
                  <div class="product-card__info">
                      <h2 class="product-card__title">${element.name}</h2>
                      <span class="product-card__old">
                          <span class="product-card__old-number">${element.price.old}</span>
                          <span class="product-card__old-add">₽</span>
                      </span>
                      <span class="product-card__price">
                          <span class="product-card__price-number">${element.price.new}</span>
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
                                      <span class="tooltip__text">Москва: <span class="tooltip__count">${element.availability.moscow}</span></span>
                                  </li>
                                  <li class="tooltip__item">
                                      <span class="tooltip__text">Оренбург: <span class="tooltip__count">${element.availability.orenburg}</span></span>
                                  </li>
                                  <li class="tooltip__item">
                                      <span class="tooltip__text">Санкт-Петербург: <span class="tooltip__count">${element.availability.saintPetersburg}</span></span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </li>
          `;
    }
  });

  document.querySelectorAll(".tooltip__btn").forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showLocation() {
  this.classList.toggle("location__city--active");
  this.classList.toggle("location__city");
}

function changeLocation() {
  const activeCity = document.querySelector(".location__city--active");
  const name = document.querySelector(".location__city-name");
  if (name) name.textContent = this.textContent;
  if (activeCity) {
    activeCity.classList.remove("location__city--active");
    activeCity.classList.add("location__city");
  }
}

//  КОРЗИНА
// Добавление товара в корзину
function addToBasket(id) {
  loadBasketFromStorage();
  // Проверяем, есть ли уже такой товар в корзине
  const existing = window.basketItems.find(item => item.id === id);
  if (existing) {
    existing.count += 1;
    saveBasketToStorage();
    loadBasketFromStorage();
    renderBasket();
    if (typeof renderPage === 'function') renderPage();
    return;
  }
  // Найти товар в исходных данных
  fetchData().then(data => {
    const item = data.find(el => String(el.id) === String(id));
    if (item) {
      window.basketItems.push({
        id: String(item.id),
        name: item.name,
        price: item.price, // сохраняем весь объект price
        image: item.image,
        count: 1
      });
      saveBasketToStorage();
      loadBasketFromStorage();
      renderBasket();
      if (typeof renderPage === 'function') renderPage();
    }
  });
}

// Удаление товара из корзины
function removeFromBasket(id) {
  loadBasketFromStorage();
  window.basketItems = window.basketItems.filter(item => String(item.id) !== String(id));
  saveBasketToStorage();
  loadBasketFromStorage();
  renderBasket();
}

// Обновление счетчика и отрисовка корзины
function renderBasket() {
  // basketItems уже актуален, не перезаписываем из localStorage!
  const basketList = document.querySelector('.basket__list');
  const basketCount = document.querySelector('.header__user-count');
  const emptyBlock = document.querySelector('.basket__empty-block');

  // Очистить список
  if (basketList) basketList.innerHTML = '';

  // Если корзина пуста
  if (window.basketItems.length === 0) {
    if (basketCount) basketCount.textContent = '0';
    if (emptyBlock) emptyBlock.style.display = '';
    return;
  }

  // Скрыть блок "Корзина пуста"
  if (emptyBlock) emptyBlock.style.display = 'none';

  // Обновить счетчик
  const totalCount = window.basketItems.reduce((sum, item) => sum + item.count, 0);
  if (basketCount) basketCount.textContent = totalCount;

  // Отрисовать товары в корзине
  window.basketItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'basket__item';
    li.setAttribute('data-id', item.id);
    li.innerHTML = `
      <div class="basket__img">
        <img src="${item.image}" alt="Фотография товара" height="60" width="60">
      </div>
      <span class="basket__name">${item.name}</span>
      <span class="basket__price">${item.price && typeof item.price === 'object' ? item.price.new : item.price} руб</span>
      <button class="basket__item-close" type="button">
        <svg class="main-menu__icon" width="24" height="24" aria-hidden="true">
          <use xlink:href="images/sprite.svg#icon-close"></use>
        </svg>
      </button>
    `;
    if (basketList) basketList.appendChild(li);
  });
}
function updateFilterCategoryCounts(data) {
  const categories = ['pendant', 'ceiling', 'overhead', 'point', 'nightlights'];
  const counts = {
    pendant: 0,
    ceiling: 0,
    overhead: 0,
    point: 0,
    nightlights: 0
  };

  data.forEach(item => {
    if (Array.isArray(item.type)) {
      item.type.forEach(type => {
        if (counts.hasOwnProperty(type)) {
          counts[type]++;
        }
      });
    } else if (typeof item.type === 'string' && counts.hasOwnProperty(item.type)) {
      counts[item.type]++;
    }
  });

  categories.forEach(category => {
    const label = document.querySelector(`label[for="${category}"]`);
    if (label) {
      const countSpan = label.querySelector('.custom-checkbox__count');
      if (countSpan) {
        countSpan.textContent = counts[category];
      }
    }
  });
}
// --- ОТПРАВКА ФОРМЫ И МОДАЛЬНЫЕ ОКНА ---
function sendForm(form) {
  const formData = new FormData(form);
  fetch('https://httpbin.org/post', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) throw new Error('Ошибка отправки');
      return response.json();
    })
    .then(() => {
      showModal('Ваша заявка успешно отправлена!');
      form.reset();
    })
    .catch(() => {
      showModal('Ошибка! Не удалось отправить заявку. Попробуйте позже.');
    });
}

// --- МОДАЛЬНОЕ ОКНО ---
function showModal(message) {
  // Удаляем старое модальное окно, если оно есть
  const oldModal = document.querySelector('.message');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.className = 'message';
  modal.innerHTML = `
    <div class="message__content">
      <button class="message__close" type="button" aria-label="Закрыть">
        <svg width="20" height="20"><use xlink:href="images/sprite.svg#icon-close"></use></svg>
      </button>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(modal);

  // Закрытие по крестику
  modal.querySelector('.message__close').addEventListener('click', () => {
    modal.remove();
  });

  // Закрытие по клику вне окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Закрытие по Esc
  document.addEventListener('keydown', function escClose(evt) {
    if (evt.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escClose);
    }
  });
}
