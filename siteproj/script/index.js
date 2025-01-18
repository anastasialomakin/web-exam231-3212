document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'a61c953a-c4cb-47e4-abfe-ce2446e1d2d5';
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';
    const productList = document.getElementById('product-list');
    const categoryCheckboxes = document.getElementById('category-checkboxes');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const discountCheckbox = document.getElementById('discount-checkbox');
    const sortSelect = document.getElementById('sort-select');
    const applyFiltersButton = document.getElementById('apply-filters');
    const loadMoreButton = document.getElementById('load-more-button');
    const notificationArea = document.querySelector('.notification-area');
    notificationArea.style.display = 'none';
    let allProducts = [];
    let displayedProducts = [];
    let categories = new Set();
    let productsPerPage = 6;
    let currentPage = 1;

    function showNotification(message, type = 'info') {
        notificationArea.innerHTML = `
            <span class="notification-text">${message}</span>
            <button class="close-notification"><img src="img/close.png"></button>
        `;
        notificationArea.classList.add(type);
        notificationArea.style.display = 'flex';

      const closeButton = notificationArea.querySelector('.close-notification');
      closeButton.addEventListener('click', () => {
        notificationArea.style.display = 'none';
        notificationArea.classList.remove(type);
      });
        setTimeout(() => {
            notificationArea.style.display = 'none';
            notificationArea.classList.remove(type);
         }, 5000);
    }
    
    const getApiUrl = () => {
      return `${API_URL}?api_key=${API_KEY}`;
    }
    
    const getDiscount = (actualPrice, discountPrice) => {
        if (discountPrice === null) {
            return 0;
        }
        return Math.round(((actualPrice - discountPrice) / actualPrice) * 100);
    }

    const createProductCard = (product) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.dataset.id = product.id;
    
      const imageUrl = product.image_url || 'img/placeholder.png';
    
      const discountedPrice = product.discount_price !== null ? product.discount_price : product.actual_price;
      const discountPercent =  product.discount_price !== null ? getDiscount(product.actual_price, product.discount_price) : 0;
     const actualPriceClass = product.discount_price !== null ? 'actual-price montserrat-alternates-light discounted' : 'actual-price montserrat-alternates-semibold'
      productCard.innerHTML = `
          <div class="image-container">
               <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: auto;">
          </div>
          <div class="card-content">
          <h3 title="${product.name}" class="montserrat-alternates-regular">${product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}</h3>
          <div class="rating">
          <span class="montserrat-alternates-light"><img src="img/rating.png" alt="Рейтинг" style="height: 15px; width: 15px; margin-bottom: 0; margin-right: 5px;">${product.rating}</span>
          </div>
            <div class="price">
              ${
                product.discount_price !== null
                  ? `<span class="discount-price montserrat-alternates-semibold">${discountedPrice} руб.</span>
                     <span class="${actualPriceClass}">${product.actual_price} руб.</span>
                     <span class="discount-percent montserrat-alternates-light">-${discountPercent}%</span>`
                  : `<span class="${actualPriceClass}">${product.actual_price} руб.</span>`
              }
          </div>
           <button class="add-to-cart-btn montserrat-alternates-semibold ${isProductInCart(product.id) ? 'remove-from-cart-btn' : ''}">${isProductInCart(product.id) ? 'Убрать из корзины' : 'Добавить в корзину'}</button>
          </div>
      `;
      const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
      addToCartBtn.addEventListener('click', () => {
         toggleCart(product, productCard); 
          addToCartBtn.classList.add('active');
            setTimeout(() => {
              addToCartBtn.classList.remove('active');
             }, 150);
      });
      return productCard;
  };
    
    const toggleCart = (product, productCard) => {
        const cart = getCartFromLocalStorage();
          if(isProductInCart(product.id)) {
            removeProductFromCart(product.id);
            showNotification('Товар удален из корзины', 'success');
            productCard.querySelector('.add-to-cart-btn').textContent = 'Добавить в корзину';
          } else{
           addProductToCart(product);
            showNotification('Товар добавлен в корзину', 'success');
            productCard.querySelector('.add-to-cart-btn').textContent = 'Убрать из корзины';
          }
    };

    const isProductInCart = (productId) => {
        const cart = getCartFromLocalStorage();
       return cart.includes(productId);
    }

    const getCartFromLocalStorage = () => {
        const cart = localStorage.getItem('cart');
       return cart ? JSON.parse(cart) : [];
    };

    const addProductToCart = (product) => {
        const cart = getCartFromLocalStorage();
        cart.push(product.id);
        localStorage.setItem('cart', JSON.stringify(cart));
    };
    const removeProductFromCart = (productId) => {
        const cart = getCartFromLocalStorage();
      const updatedCart = cart.filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    const renderProducts = (products) => {
        productList.innerHTML = '';
        products.forEach(product => {
           const productCard = createProductCard(product);
           productList.appendChild(productCard);
         });
    };
     const loadProducts = async () => {
          try {
            const response = await fetch(getApiUrl());
           if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
             allProducts = await response.json();
            allProducts.forEach(product => {
               categories.add(product.main_category);
            });

           renderCategoryFilters();
           filterAndSortProducts();
         } catch (error) {
             console.error('Ошибка загрузки товаров:', error);
         }
      };
    
      const renderCategoryFilters = () => {
        categoryCheckboxes.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('filter-group-checkbox');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `category-${category}`;
            checkbox.value = category;

            const label = document.createElement('label');
            label.htmlFor = `category-${category}`;
            label.textContent = category;

            categoryDiv.appendChild(checkbox);
            categoryDiv.appendChild(label);
            categoryCheckboxes.appendChild(categoryDiv);
         });
    };

    const filterAndSortProducts = () => {
      let filteredProducts = [...allProducts];
      const selectedCategories = Array.from(categoryCheckboxes.querySelectorAll('input:checked')).map(checkbox => checkbox.value);

      if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => selectedCategories.includes(product.main_category));
    }

    const minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
      const maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;

      filteredProducts = filteredProducts.filter(product => {
          const price = product.discount_price !== null ? product.discount_price : product.actual_price;
          const isMinPriceValid = minPrice === null || price >= minPrice;
          const isMaxPriceValid = maxPrice === null || price <= maxPrice;
          return isMinPriceValid && isMaxPriceValid;
      });
      
      if (discountCheckbox.checked) {
        filteredProducts = filteredProducts.filter(product => product.discount_price !== null);
      }
    
       switch (sortSelect.value) {
         case 'rating':
             filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
           case 'price_asc':
             filteredProducts.sort((a, b) => (a.discount_price !== null ? a.discount_price : a.actual_price) - (b.discount_price !== null ? b.discount_price : b.actual_price));
             break;
         case 'price_desc':
             filteredProducts.sort((a, b) => (b.discount_price !== null ? b.discount_price : b.actual_price) - (a.discount_price !== null ? a.discount_price : a.actual_price));
             break;
       }

      displayedProducts = filteredProducts;
       currentPage = 1;
       loadMoreButton.style.display = 'block';
      renderFilteredProducts(displayedProducts.slice(0, productsPerPage));


       if (displayedProducts.length <= productsPerPage) {
        loadMoreButton.style.display = 'none';
      }
  };

    const renderFilteredProducts = (products) => {
      productList.innerHTML = ''; 
      products.forEach(product => {
         const productCard = createProductCard(product);
         productList.appendChild(productCard);
       });
  };


  const renderPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToRender = displayedProducts.slice(startIndex, endIndex);
    productsToRender.forEach(product => {
      const productCard = createProductCard(product);
      productList.appendChild(productCard);
    });
  
     if(endIndex >= displayedProducts.length) {
       loadMoreButton.style.display = 'none';
    }
};
    applyFiltersButton.addEventListener('click', () => {
        filterAndSortProducts();
    });
  
  loadMoreButton.addEventListener('click', () => {
    currentPage++;
    renderPaginatedProducts();
  });
    sortSelect.addEventListener('change', () => {
      filterAndSortProducts();
    });
      loadProducts();
  });