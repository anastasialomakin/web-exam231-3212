document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'a61c953a-c4cb-47e4-abfe-ce2446e1d2d5';
  const API_URL_ORDERS = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders';
  const API_URL_GOODS = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';
  const orderTableBody = document.getElementById('order-table-body');
  const notificationArea = document.querySelector('.notification-area');
  const orderModal = document.getElementById('order-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const saveOrderButton = document.getElementById('save-order');
  const deleteOrderButton = document.getElementById('delete-order');
  const cancelDeleteButton = document.getElementById('cancel-delete');
  const closeModalButton = document.getElementById('close-modal');
  const closeOrderButton = document.getElementById('close-order');
  const emptyOrderMessage = document.getElementById('empty-order-message');
  notificationArea.style.display = 'none';
  let orders = [];
  let products = [];
  let selectedOrder = null;

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

  const getApiUrlOrders = (orderId = '') => {
     return `${API_URL_ORDERS}${orderId ? `/${orderId}` : ''}?api_key=${API_KEY}&student_id=10700`;
  };
  const getApiUrlGoods = () => {
    return `${API_URL_GOODS}?api_key=${API_KEY}`;
   };
 const fetchProducts = async () => {
      try {
          const response = await fetch(getApiUrlGoods());
           if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
           }
           return await response.json();
       } catch (error) {
           console.error('Ошибка загрузки товаров:', error);
          showNotification('Ошибка при загрузке товаров, попробуйте позже', 'error');
       }
  };
  
  const fetchOrders = async () => {
    try {
        const response = await fetch(getApiUrlOrders());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
         orders = await response.json();
         renderOrderTable();
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
           showNotification('Ошибка при загрузке заказов, попробуйте позже', 'error');
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
       const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
     return `${day}.${month}.${year} ${hours}:${minutes}`;
};
const calculateDeliveryCost = (order) => {
  let deliveryCost = 200;
       const date = new Date(order.delivery_date);
         const dayOfWeek = date.getDay();
       const hour = parseInt(order.delivery_interval.split(':')[0], 10);
         if (dayOfWeek === 0 || dayOfWeek === 6) {
            deliveryCost += 300;
        } else if (hour >= 18) {
              deliveryCost += 200;
        }
   return deliveryCost;
};
const productsToString = (goodIds) => {
 if (!goodIds || goodIds.length === 0){
      return 'Нет товаров';
  }
  const productNames = goodIds.map(id => {
          const product = products.find(p => p.id === id);
          return product ? `<li>${product.name}</li>` : '<li>Неизвестный товар</li>';
     });
   return productNames.join('');
};
const renderOrderTable = () => {
  orderTableBody.innerHTML = '';
     if (orders.length === 0) {
       emptyOrderMessage.style.display = 'block';
     } else {
      const headers = [
          "№",
           "Дата и время",
          "Состав заказа",
          "Стоимость (без доставки)",
          "Время доставки",
          "Действия"
      ];
    const tableHead = document.querySelector('.order-table thead');
      tableHead.innerHTML = '';
      const headerRow = document.createElement('tr');
          headers.forEach(headerText => {
            const header = document.createElement('th');
            header.classList.add('montserrat-alternates-semibold');
            header.textContent = headerText;
            headerRow.appendChild(header);
          });
         tableHead.appendChild(headerRow);
     
         emptyOrderMessage.style.display = 'none';
       orders.forEach((order, index) => {
          const orderRow = document.createElement('tr');
              const formattedDate = formatDate(order.created_at);
               const goodNames = productsToString(order.good_ids)
               orderRow.innerHTML = `
                  <td class="montserrat-alternates-light">${index + 1}</td>
                  <td class="montserrat-alternates-light">${formattedDate}</td>
                  <td class="montserrat-alternates-light">${goodNames}</td>
                  <td class="montserrat-alternates-light">${calculateOrderTotal(order.good_ids)} руб.</td>
                  <td class="montserrat-alternates-light">
                     <p class="delivery-time">${order.delivery_date}</p>
                      <p class="delivery-interval">${order.delivery_interval}</p>
                   </td>
                  <td class="actions">
                     <img src="img/view.png" alt="Просмотр" data-id="${order.id}" class="view-order">
                       <img src="img/edit.png" alt="Редактировать" data-id="${order.id}" class="edit-order">
                       <img src="img/delete.png" alt="Удалить" data-id="${order.id}" class="delete-order">
                 </td>
             `;
             orderTableBody.appendChild(orderRow);
       });
     }
    const viewButtons = document.querySelectorAll('.view-order');
      viewButtons.forEach(button => {
       button.addEventListener('click', () => openViewModal(button.dataset.id));
       });
    const editButtons = document.querySelectorAll('.edit-order');
    editButtons.forEach(button => {
        button.addEventListener('click', () => openEditModal(button.dataset.id));
    });
      const deleteButtons = document.querySelectorAll('.delete-order');
    deleteButtons.forEach(button => {
         button.addEventListener('click', () => openDeleteModal(button.dataset.id));
    });
  };
const calculateOrderTotal = (goodIds) => {
   if (!goodIds || goodIds.length === 0) {
        return 0;
      }

      let total = 0;
     goodIds.forEach(id => {
      const product = products.find(p => p.id === id);
       if(product){
         total += product.discount_price !== null ? product.discount_price : product.actual_price;
         }
      });
    return total;
};
 
const openViewModal = async (orderId) => {
  console.log('openViewModal: orderId =', orderId);
 selectedOrder = orders.find(order => order.id === parseInt(orderId));
  if (!selectedOrder) {
      console.error('Заказ не найден');
      return;
  }
  modalTitle.textContent = `Заказ № ${selectedOrder.id}`;
 const goodList =  productsToString(selectedOrder.good_ids);
modalBody.innerHTML = `
     <p><strong>Дата и время оформления:</strong> ${formatDate(selectedOrder.created_at)}</p>
       <p><strong>Состав заказа:</strong> </p>
       <ul>${goodList}</ul>
       <p><strong>Итоговая стоимость:</strong> ${calculateOrderTotalWithDelivery(selectedOrder)} руб.</p>
       <p><strong>Дата доставки:</strong> ${selectedOrder.delivery_date}</p>
      <p><strong>Временной интервал доставки:</strong> ${selectedOrder.delivery_interval}</p>
      <p><strong>Адрес доставки:</strong> ${selectedOrder.delivery_address}</p>
     <p><strong>Комментарий:</strong> ${selectedOrder.comment ? selectedOrder.comment : 'Нет комментария'}</p>
`;
saveOrderButton.style.display = 'none';
deleteOrderButton.style.display = 'none';
cancelDeleteButton.style.display = 'none';
closeOrderButton.style.display = 'inline-block';
orderModal.style.display = 'flex';
document.body.classList.add('modal-open');
};
const openEditModal = async (orderId) => {
console.log('openEditModal: orderId =', orderId);
selectedOrder = orders.find(order => order.id === parseInt(orderId));
if (!selectedOrder) {
   console.error('Заказ не найден');
    return;
}
modalTitle.textContent = 'Редактирование заказа';
modalBody.innerHTML = `
  <div class="form-group">
    <label for="edit_full_name">Имя:</label>
    <input type="text" id="edit_full_name" style="font-family: Montserrat Alternates, serif;" value="${selectedOrder.full_name}">
  </div>
  <div class="form-group">
     <label for="edit_email">Email:</label>
     <input type="email" id="edit_email" style="font-family: Montserrat Alternates, serif;" value="${selectedOrder.email}">
  </div>
   <div class="form-group">
    <label for="edit_phone">Телефон:</label>
    <input type="text" id="edit_phone" style="font-family: Montserrat Alternates, serif;" value="${selectedOrder.phone}">
  </div>
  <div class="form-group">
   <label for="edit_delivery_address">Адрес доставки:</label>
    <input type="text" id="edit_delivery_address" style="font-family: Montserrat Alternates, serif;" value="${selectedOrder.delivery_address}">
 </div>
<div class="form-group">
    <label for="edit_delivery_date">Дата доставки:</label>
    <input type="date" id="edit_delivery_date" style="font-family: Montserrat Alternates, serif;" value="${selectedOrder.delivery_date}">
</div>
 <div class="form-group">
     <label for="edit_delivery_interval">Временной интервал доставки:</label>
     <select id="edit_delivery_interval" style="font-family: Montserrat Alternates, serif;">
         <option style="font-family: Montserrat Alternates, serif;" value="08:00-12:00" ${selectedOrder.delivery_interval === '08:00-12:00' ? 'selected' : ''}>08:00-12:00</option>
         <option style="font-family: Montserrat Alternates, serif;" value="12:00-14:00" ${selectedOrder.delivery_interval === '12:00-14:00' ? 'selected' : ''}>12:00-14:00</option>
        <option style="font-family: Montserrat Alternates, serif;" value="14:00-18:00" ${selectedOrder.delivery_interval === '14:00-18:00' ? 'selected' : ''}>14:00-18:00</option>
       <option style="font-family: Montserrat Alternates, serif;" value="18:00-22:00" ${selectedOrder.delivery_interval === '18:00-22:00' ? 'selected' : ''}>18:00-22:00</option>
  </select>
</div>
<div class="form-group">
   <label for="edit_comment">Комментарий к заказу:</label>
    <textarea style="font-family: Montserrat Alternates, serif;" id="edit_comment">${selectedOrder.comment}</textarea>
</div>
`;
saveOrderButton.style.display = 'inline-block';
deleteOrderButton.style.display = 'none';
cancelDeleteButton.style.display = 'none';
 closeOrderButton.style.display = 'none';
 orderModal.style.display = 'flex';
document.body.classList.add('modal-open');
};

const openDeleteModal = (orderId) => {
console.log('openDeleteModal: orderId =', orderId);
selectedOrder = orders.find(order => order.id === parseInt(orderId));
if (!selectedOrder) {
 console.error('Заказ не найден');
 return;
}
modalTitle.textContent = 'Удаление заказа';
modalBody.textContent = 'Вы уверены, что хотите удалить заказ?';
saveOrderButton.style.display = 'none';
deleteOrderButton.style.display = 'inline-block';
cancelDeleteButton.style.display = 'inline-block';
closeOrderButton.style.display = 'none';
orderModal.style.display = 'flex';
document.body.classList.add('modal-open');
};
const closeModal = () => {
console.log('closeModal: closing modal window');
orderModal.style.display = 'none';
document.body.classList.remove('modal-open');
console.log('closeModal: modal window closed, classes removed =', orderModal.classList, document.body.classList);
};


const calculateOrderTotalWithDelivery = (order) => {
   let total = calculateOrderTotal(order.good_ids);
   let deliveryCost = calculateDeliveryCost(order);

    return total + deliveryCost;
};
const handleSaveOrder = async () => {
      if (!selectedOrder) {
          console.error('Нет выбранного заказа для сохранения');
           return;
     }

      const orderData = {
          full_name: document.getElementById('edit_full_name').value,
          email: document.getElementById('edit_email').value,
           phone: document.getElementById('edit_phone').value,
          delivery_address: document.getElementById('edit_delivery_address').value,
           delivery_date: document.getElementById('edit_delivery_date').value,
          delivery_interval: document.getElementById('edit_delivery_interval').value,
          comment: document.getElementById('edit_comment').value,
      };
     
      try {
           const response = await fetch(getApiUrlOrders(selectedOrder.id), {
              method: 'PUT',
               headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData)
          });
           if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
          }
         showNotification('Заказ успешно обновлен!', 'success');
         closeModal();
         await fetchOrders();
     } catch (error) {
      console.error('Ошибка при редактировании заказа:', error);
         showNotification('Ошибка при редактировании заказа', 'error');
     }
 };
 const handleDeleteOrder = async () => {
      if (!selectedOrder) {
         console.error('Нет выбранного заказа для удаления');
         return;
     }
       try {
            const response = await fetch(getApiUrlOrders(selectedOrder.id), {
              method: 'DELETE',
          });
          if (!response.ok) {
               const errorData = await response.json();
              throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
          }
         showNotification('Заказ успешно удален!', 'success');
         closeModal();
         await fetchOrders();
     } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
         showNotification('Ошибка при удалении заказа', 'error');
     }
 };
  
   closeModalButton.addEventListener('click', closeModal);
   closeOrderButton.addEventListener('click', closeModal);
   cancelDeleteButton.addEventListener('click', closeModal);
   saveOrderButton.addEventListener('click', handleSaveOrder);
   deleteOrderButton.addEventListener('click', handleDeleteOrder);
   
  const init = async () => {
      products = await fetchProducts();
      await fetchOrders();
 };
init();
});