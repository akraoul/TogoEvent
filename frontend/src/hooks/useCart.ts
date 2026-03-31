import { useState } from 'react';

// Types
export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
}

// Cart hook
export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => {
    const savedCart = localStorage.getItem('togoevents-cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0, currency: 'XOF' };
  });

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const cartItem: CartItem = {
      ...item,
      id: `${item.eventId}-${item.ticketTypeId}`,
    };

    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.eventId === cartItem.eventId && item.ticketTypeId === cartItem.ticketTypeId
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item
        );
      } else {
        newItems = [...prevCart.items, cartItem];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCart = { items: newItems, total, currency: prevCart.currency };
      
      localStorage.setItem('togoevents-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (eventId: string, ticketTypeId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(
        item => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId)
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCart = { items: newItems, total, currency: prevCart.currency };
      
      localStorage.setItem('togoevents-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(eventId, ticketTypeId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.eventId === eventId && item.ticketTypeId === ticketTypeId
          ? { ...item, quantity }
          : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCart = { items: newItems, total, currency: prevCart.currency };
      
      localStorage.setItem('togoevents-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, currency: 'XOF' });
    localStorage.removeItem('togoevents-cart');
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemsCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
};
