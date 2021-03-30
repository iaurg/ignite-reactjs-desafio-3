import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productInCart = updatedCart.find((product) => productId === product.id)
    
      const stock = await api.get(`/stock/${productId}`)
      const stockItem:Stock = stock.data
      const actualAmount = productInCart ? productInCart.amount : 0
      const amount = actualAmount + 1;

      if(amount > stockItem.amount) {
        toast.error('Quantidade solicitada fora de estoque');   
        return     
      }

      if(productInCart){
        productInCart.amount = amount
      } else {
        const getProduct = await api.get(`/products/${productId}`)
        const product = getProduct.data

        const newProduct = {
          ...product,
          amount: 1
        }
        updatedCart.push(newProduct)
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify([...updatedCart]))
      setCart([...updatedCart])
    } catch(error) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(product => productId === product.id)

      if (productExists) {
        const newCart = cart.filter((product) => productId !== product.id)      
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        setCart(newCart)
      } else {
        throw new Error('Erro na remoção do produto');        
      }                 
    } catch(error) {
      const { message } = error
      toast.error(message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        throw new Error();        
      }     

      const stock = await api.get(`/stock/${productId}`)
      const stockItem:Stock = stock.data

      if (amount > stockItem.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return     
      }

      const updatedCart = [...cart]
      const productExists = updatedCart.find(product => productId === product.id)
      
      if (productExists) {
        productExists.amount = amount
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        setCart(updatedCart)
      } else {
        throw new Error("Erro na alteração de quantidade do produto");
      }

    } catch(error) {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
