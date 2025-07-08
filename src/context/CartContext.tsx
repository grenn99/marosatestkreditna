import React, { createContext, useState, useContext, useEffect } from 'react';
import { CartItem, GiftItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { STORAGE_KEYS } from '../config/appConfig';

// Define the shape of the context value
interface CartContextProps {
  cart: CartItem[];
  gifts: GiftItem[];
  addToCart: (productId: number, packageOptionId: string, quantity: number) => Promise<{ success: boolean; message?: string }>; // packageOptionId is string
  removeFromCart: (productId: number, packageOptionId: string) => void; // packageOptionId is string
  updateQuantity: (productId: number, packageOptionId: string, quantity: number) => Promise<{ success: boolean; message?: string }>; // packageOptionId is string
  addGiftToCart: (giftItem: GiftItem) => void;
  removeGiftFromCart: (giftId: string) => void;
  clearCart: () => void;
  // Simple notification state
  showNotification: boolean;
  hideNotification: () => void;
}

// Create the context
const CartContext = createContext<CartContextProps | undefined>(undefined);

// Cart Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple notification state
  const [showNotification, setShowNotification] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.cart && Array.isArray(parsedCart.cart)) {
          setCart(parsedCart.cart);
        }
        if (parsedCart.gifts && Array.isArray(parsedCart.gifts)) {
          setGifts(parsedCart.gifts);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify({ cart, gifts }));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, gifts, isInitialized]);

  // Function to check stock availability
  const checkStockAvailability = async (productId: number, packageOptionId: string, requestedQuantity: number): Promise<{ available: boolean; currentStock: number; message?: string }> => {
    try {
      // Get the product from the database with stock_quantity
      const { data: product, error } = await supabase
        .from('products')
        .select('package_options, stock_quantity')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error checking stock:', error);
        return { available: false, currentStock: 0, message: 'Error checking stock availability' };
      }

      if (!product) {
        return { available: false, currentStock: 0, message: 'Product not found' };
      }

      // Parse package options
      let packageOptions;
      try {
        packageOptions = typeof product.package_options === 'string'
          ? JSON.parse(product.package_options)
          : product.package_options;
      } catch (e) {
        console.error('Error parsing package options:', e);
        return { available: false, currentStock: 0, message: 'Error parsing product options' };
      }

      // Find the specific package option
      const packageOption = packageOptions.find((pkg: any) => pkg.uniq_id === packageOptionId);

      if (!packageOption) {
        return { available: false, currentStock: 0, message: 'Package option not found' };
      }

      // Check if the package is active
      if (packageOption.isActive === false) {
        return { available: false, currentStock: 0, message: 'This product option is not available' };
      }

      // Get current stock from stock_quantity field
      const currentStock = product.stock_quantity || 0;

      // Check if we have enough in cart already
      const existingCartItem = cart.find(
        item => item.productId === productId && item.packageOptionId === packageOptionId
      );
      const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;

      // Calculate total requested quantity (existing in cart + new request)
      const totalRequestedQuantity = existingQuantity + requestedQuantity;

      // Check if enough stock is available
      if (totalRequestedQuantity > currentStock) {
        return {
          available: false,
          currentStock,
          message: `Only ${currentStock} items available in stock${existingQuantity > 0 ? ` (${existingQuantity} already in your cart)` : ''}`
        };
      }

      return { available: true, currentStock };
    } catch (e) {
      console.error('Unexpected error checking stock:', e);
      return { available: false, currentStock: 0, message: 'Unexpected error checking stock' };
    }
  };

  // Function to add an item (or increase quantity)
  const addToCart = async (productId: number, packageOptionId: string, quantity: number) => {
    if (quantity <= 0) {
      console.warn("Attempted to add item with non-positive quantity:", quantity);
      return { success: false, message: "Invalid quantity" };
    }

    // Check stock availability
    const stockCheck = await checkStockAvailability(productId, packageOptionId, quantity);

    if (!stockCheck.available) {
      console.warn("Stock not available:", stockCheck.message);
      return { success: false, message: stockCheck.message };
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        item => item.productId === productId && item.packageOptionId === packageOptionId
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
        };
        console.log("Updated item quantity in cart:", updatedCart);
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        const newCart = [...prevCart, { productId, packageOptionId, quantity }];
        console.log("Added new item to cart:", newCart);
        return newCart;
      }
    });

    // Simple notification trigger
    setShowNotification(true);

    return { success: true };
  };

  // Function to remove an item completely
  const removeFromCart = (productId: number, packageOptionId: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        item => !(item.productId === productId && item.packageOptionId === packageOptionId)
      );
      console.log("Removed item from cart:", updatedCart);
      return updatedCart;
    });
  };

  // Function to update the quantity of a specific item
  const updateQuantity = async (productId: number, packageOptionId: string, quantity: number) => {
     if (quantity <= 0) {
       removeFromCart(productId, packageOptionId);
       return { success: true };
     }

    // Get current quantity in cart
    const existingItem = cart.find(
      item => item.productId === productId && item.packageOptionId === packageOptionId
    );

    if (!existingItem) {
      return { success: false, message: "Item not found in cart" };
    }

    // Calculate the difference in quantity
    const quantityDifference = quantity - existingItem.quantity;

    // If increasing quantity, check stock
    if (quantityDifference > 0) {
      const stockCheck = await checkStockAvailability(productId, packageOptionId, quantityDifference);

      if (!stockCheck.available) {
        return { success: false, message: stockCheck.message };
      }
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map(item =>
        item.productId === productId && item.packageOptionId === packageOptionId
          ? { ...item, quantity }
          : item
      );
      console.log("Updated specific item quantity:", updatedCart);
      return updatedCart;
    });

    return { success: true };
  };

  // Function to add a gift item to the cart
  const addGiftToCart = (giftItem: GiftItem) => {
    setGifts((prevGifts) => {
      // Check if a gift with the same ID already exists
      const existingGiftIndex = prevGifts.findIndex(gift => gift.id === giftItem.id);

      if (existingGiftIndex > -1) {
        // Replace the existing gift
        const updatedGifts = [...prevGifts];
        updatedGifts[existingGiftIndex] = giftItem;
        console.log("Updated gift in cart:", updatedGifts);
        return updatedGifts;
      } else {
        // Add new gift
        const newGifts = [...prevGifts, giftItem];
        console.log("Added new gift to cart:", newGifts);
        return newGifts;
      }
    });
  };

  // Function to remove a gift item from the cart
  const removeGiftFromCart = (giftId: string) => {
    setGifts((prevGifts) => {
      const updatedGifts = prevGifts.filter(gift => gift.id !== giftId);
      console.log("Removed gift from cart:", updatedGifts);
      return updatedGifts;
    });
  };

  // Function to clear the entire cart
  const clearCart = () => {
    setCart([]);
    setGifts([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.cart);
    } catch (error) {
      console.error('Error removing cart from localStorage:', error);
    }
    console.log("Cart cleared.");
  };

  // Function to hide notification
  const hideNotification = () => {
    setShowNotification(false);
  };

  // Context value provided to consumers
  const value: CartContextProps = {
    cart,
    gifts,
    addToCart,
    removeFromCart,
    updateQuantity,
    addGiftToCart,
    removeGiftFromCart,
    clearCart,
    showNotification,
    hideNotification,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
