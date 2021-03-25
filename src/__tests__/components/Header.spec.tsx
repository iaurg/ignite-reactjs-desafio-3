import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import Header from '../../components/Header';
import { useCart } from '../../hooks/useCart';

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children }: { children: ReactNode }) => children,
  };
});

jest.mock('../../hooks/useCart', () => {
  return {
    useCart: jest.fn(() => ({
      cart: [
        {
          amount: 2,
          id: 1,
          image:
            'https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg',
          price: 179.9,
          title: 'Tênis de Caminhada Leve Confortável',
        },
        {
          amount: 1,
          id: 2,
          image:
            'https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis2.jpg',
          price: 139.9,
          title: 'Tênis VR Caminhada Confortável Detalhes Couro Masculino',
        },
      ],
    })),
  };
});

const useCartMock = useCart as jest.Mock;

describe('Header Component', () => {
  it('should be able to render the amount of products added to cart', () => {
    const { getByLabelText } = render(<Header />);

    const cartSizeCounter = getByLabelText('cart-size');
    expect(cartSizeCounter).toHaveTextContent('2 itens');
  });

  it('should be able to render no data message when cart is empty', () => {
    useCartMock.mockImplementation(() => ({ cart: [] }));

    const { getByLabelText } = render(<Header />);

    const cartSizeCounter = getByLabelText('cart-size');
    expect(cartSizeCounter).toHaveTextContent('Sem itens');
  });

  it('should be able to render cart message when it has just one item', () => {
    useCartMock.mockImplementation(() => ({
      cart: [{
        amount: 2,
        id: 1,
        image:
          'https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg',
        price: 179.9,
        title: 'Tênis de Caminhada Leve Confortável',
      },]
    }));

    const { getByLabelText } = render(<Header />);

    const cartSizeCounter = getByLabelText('cart-size');
    expect(cartSizeCounter).toHaveTextContent('1 item');
  });
});
