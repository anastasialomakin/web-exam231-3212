document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'a61c953a-c4cb-47e4-abfe-ce2446e1d2d5';
    const API_URL_GOODS = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';
    const API_URL_ORDERS = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';

    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const orderForm = document.getElementById('order-form');
    const totalCostValue = document.getElementById('total-cost-value');
    const notificationArea = document.querySelector('.notification-area');
    notificationArea.style.display = 'none';

    let cart = [];
    let products = [];
    let deliveryCost = 200;

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
  
    const getApiUrlGoods = () => {
        return `${API_URL_GOODS}?api_key=${API_KEY}`;
    };
    
    const getApiUrlOrders = () => {
      return `${API_URL_ORDERS}?api_key=${API_KEY}&student_id=10700`;
    };

    const getCartFromLocalStorage = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };
    
    const removeProductFromCart = (productId) => {
        const cart = getCartFromLocalStorage();
        const updatedCart = cart.filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));  
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(getApiUrlGoods());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            products = data;
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            showNotification('Ошибка при загрузке товаров, попробуйте позже', 'error');
        }
    };

    const getProductById = (productId) => {
        return products.find(product => product.id === productId);
    };

     const getDiscount = (actualPrice, discountPrice) => {
        if (discountPrice === null) {
            return 0;
        }
        return Math.round(((actualPrice - discountPrice) / actualPrice) * 100);
    }

    const createCartItem = (product) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('product-card');
        const imageUrl = product.image_url || 'img/placeholder.png';
        const discountedPrice = product.discount_price !== null ? product.discount_price : product.actual_price;
        const discountPercent =  product.discount_price !== null ? getDiscount(product.actual_price, product.discount_price) : 0;
        const actualPriceClass = product.discount_price !== null ? 'actual-price montserrat-alternates-light discounted' : 'actual-price montserrat-alternates-semibold'

        cartItem.innerHTML = `
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
             <button class="remove-from-cart-btn montserrat-alternates-semibold">Удалить из корзины</button>
        </div>
        `;
        const removeButton = cartItem.querySelector('.remove-from-cart-btn');
        removeButton.addEventListener('click', () => {
            removeCartItem(product.id, cartItem);
        });
        return cartItem;
    };
  
    const removeCartItem = (productId, cartItem) => {
        removeProductFromCart(productId);
        cartItemsContainer.removeChild(cartItem);
        showNotification('Товар удален из корзины', 'success');
        updateCartDisplay();
        updateTotalCost();
    };

   const handleFormChange = () => {
        updateTotalCost();
   };

   const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            emptyCartMessage.innerHTML = `Корзина пуста. <a href='index.html'>Перейдите в каталог</a>, чтобы добавить товары.`;
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(productId => {
                const product = getProductById(productId);
                if (product) {
                    const cartItem = createCartItem(product);
                    cartItemsContainer.appendChild(cartItem);
                }
            });
        }
    };

    const updateCartDisplay = () => {
        cart = getCartFromLocalStorage();
        renderCartItems();
    }
  
    const calculateDeliveryCost = () => {
        const deliveryDate = document.getElementById('delivery_date').value;
        const deliveryInterval = document.getElementById('delivery_interval').value;
        if (cart.length === 0) {
            return 0;
        }

        if (!deliveryDate || !deliveryInterval) {
            return 200;
        }

        const date = new Date(deliveryDate);
        const dayOfWeek = date.getDay();
        const hour = parseInt(deliveryInterval.split(':')[0], 10);

        let cost = 200;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            cost = 300;
        } else if (hour >= 18) {
        cost += 200;
        }
        return cost;
    };

    const updateTotalCost = () => {
        let total = 0;
        cart.forEach(productId => {
            const product = getProductById(productId);
            if (product) {
                total += product.discount_price !== null ? product.discount_price : product.actual_price;
            }
        });
        deliveryCost = calculateDeliveryCost();
        const finalTotal = total + deliveryCost;
        totalCostValue.textContent = `${finalTotal} руб.`;
        const deliveryCostParagraph = document.getElementById('delivery-cost-paragraph');
        if(cart.length > 0) {
            deliveryCostParagraph.textContent = `(Стоимость доставки ${deliveryCost} руб.)`;
            deliveryCostParagraph.style.display = 'block';
        } else {
            deliveryCostParagraph.style.display = 'none';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
           return null;
         }
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
       return `${day}.${month}.${year}`;
  };

    const submitOrderForm = async (event) => {
        event.preventDefault();
        
         const orderData = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subscribe: document.getElementById('subscribe').checked,
            delivery_address: document.getElementById('delivery_address').value,
            delivery_date: formatDate(document.getElementById('delivery_date').value),
             delivery_interval: document.getElementById('delivery_interval').value,
            comment: document.getElementById('comment').value,
              good_ids: cart,
            student_id: 10700
         };
        console.log('submitOrderForm: orderData before sending =', orderData);
      try {
            const response = await fetch(getApiUrlOrders(), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
               },
              body: JSON.stringify(orderData)
            });
           console.log('submitOrderForm: server response =', response);
         if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
           }
            showNotification('Заказ успешно оформлен!', 'success');
           localStorage.removeItem('cart');
           setTimeout(() => {
            window.location.href = 'index.html';
         }, 2000);
       } catch (error) {
         console.error('Ошибка оформления заказа:', error);
           showNotification('Ошибка при оформлении заказа, попробуйте позже', 'error');
       }
   };

    orderForm.addEventListener('submit', submitOrderForm);
    orderForm.addEventListener('change', handleFormChange);
    
    const init = async () => {
        await fetchProducts();
        updateCartDisplay();
        updateTotalCost();
    };
    init();
});