const LocalStorageService = {
    CART_KEY: 'cart',

    getCart() {
        const cart = localStorage.getItem(this.CART_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    addProductToCart(productId) {
      const cart = this.getCart();
        cart.push(productId);
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    },

    removeProductFromCart(productId) {
        const cart = this.getCart();
       const updatedCart = cart.filter(id => id !== productId);
        localStorage.setItem(this.CART_KEY, JSON.stringify(updatedCart));
    },

    clearCart() {
        localStorage.removeItem(this.CART_KEY);
    }
};
export default LocalStorageService;