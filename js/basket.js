(function() {
  function renderBasketPage() {
    if (typeof loadBasketFromStorage === 'function') loadBasketFromStorage();
    var basketList = document.getElementById('basket-list');
    var basketEmpty = document.getElementById('basket-empty');
    var items = window.basketItems || [];
    basketList.innerHTML = '';
    var basketTotal = document.getElementById('basket-total');
    if (!items.length) {
      basketEmpty.style.display = '';
      if (basketTotal) basketTotal.textContent = '';
      // Обнуляем суммы, если корзина пуста
      var sumEl = document.getElementById('basket-sum');
      var discountEl = document.getElementById('basket-discount');
      var finalEl = document.getElementById('basket-final');
      if (sumEl) sumEl.textContent = '0 ₽';
      if (discountEl) discountEl.textContent = '- 0 ₽';
      if (finalEl) finalEl.textContent = '0 ₽';
      return;
    }
    basketEmpty.style.display = 'none';
    let sumOld = 0;
    let sumDiscount = 0;
    let sumNew = 0;
    items.forEach(function(item) {
      // Ожидается, что item.price = { old: ..., new: ... }
      var priceOld = item.price && typeof item.price === 'object' ? Number(item.price.old) : Number(item.price);
      var priceNew = item.price && typeof item.price === 'object' ? Number(item.price.new) : Number(item.price);
      var count = Number(item.count);
      sumOld += priceOld * count;
      sumNew += priceNew * count;
      sumDiscount += (priceOld - priceNew) * count;
      basketList.innerHTML += `
      <li class="catalog__item">
        <div class="product-card" data-id="${item.id}">
          <div class="product-card__visual">
            <img class="product-card__img" src="${item.image}" height="436" width="290" alt="Изображение товара">
          </div>
          <div class="product-card__info">
            <h2 class="product-card__title">${item.name}</h2>
            <span class="product-card__price">
              <span class="product-card__price-number">${priceNew}</span>
              <span class="product-card__price-add">₽</span>
              ${priceOld > priceNew ? `<span class="product-card__price-old" style="text-decoration:line-through; color:#888; margin-left:8px;">${priceOld} ₽</span>` : ''}
            </span>
            <span class="product-card__count">Количество: ${item.count}</span>
            <button class="basket__item-close btn" style="margin-top:10px; background:#f8d7da; color:#b71c1c; border:none;" onclick="removeFromBasketPage('${item.id}')">Удалить</button>
          </div>
        </div>
      </li>
      `;
    });
    // Корректный расчет скидки: сумма (price.old - price.new) * count
    var sumEl = document.getElementById('basket-sum');
    var discountEl = document.getElementById('basket-discount');
    var finalEl = document.getElementById('basket-final');
    if (sumEl) sumEl.textContent = sumOld.toLocaleString('ru-RU') + ' ₽';
    if (discountEl) discountEl.textContent = '- ' + sumDiscount.toLocaleString('ru-RU') + ' ₽';
    if (finalEl) finalEl.textContent = sumNew.toLocaleString('ru-RU') + ' ₽';
  }
  window.removeFromBasketPage = function(id) {
    if (typeof loadBasketFromStorage === 'function') loadBasketFromStorage();
    var items = window.basketItems || [];
    items = items.filter(function(item) { return String(item.id) !== String(id); });
    window.basketItems = items;
    if (typeof saveBasketToStorage === 'function') saveBasketToStorage();
    renderBasketPage();
    if (typeof renderBasket === 'function') renderBasket();
  };
  if (document.getElementById('basket-list')) renderBasketPage();
})();
