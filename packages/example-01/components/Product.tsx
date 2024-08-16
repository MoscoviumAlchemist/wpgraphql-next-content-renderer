'use client';
import { useState, useEffect } from 'react';

import { addToCart, isInCart, removeCartItem } from '@/lib/cart';
import { useProduct } from '@/components/ProductProvider';

export function Product() {
  const { product, get, selectedVariation, selectVariation } = useProduct();
  const [inCart, setInCart] = useState<string|false>(false);
  useEffect(() => {
    if (!product) {
      return;
    }
  
    isInCart(product.databaseId, selectedVariation?.databaseId)
      .then(key => setInCart(key));
  }, [product, selectedVariation]);

  if (!product) {
    return null;
  }
  
  return (
    <div className="px-4 py-8 flex flex-col justify-center">
      <h1>{get('name')}</h1>
      <p>{get('price')}</p>
      {get('type') === 'VARIABLE' && (
        <select
          value={selectedVariation?.databaseId}
          onChange={e => selectVariation(Number(e.target.value))}
        >
          {product?.variations?.map(variation => (
            <option key={variation.id} value={variation.databaseId}>{variation.name}</option>
          ))}
        </select>
      )}
      <div dangerouslySetInnerHTML={{ __html: get('description')}} />
      {inCart ? (
        <button
          className="px-4 py-2.5 rounded bg-gray-700"
          type="button"
          onClick={() => removeCartItem(inCart)
            .then(async() => setInCart(await isInCart(product.databaseId, selectedVariation?.databaseId)))
          }
        >
          Remove from cart
        </button>
      ): (
        <button
          className="px-4 py-2.5 rounded bg-gray-700"
          type="button"
          onClick={() => addToCart(product.databaseId, 1, selectedVariation?.databaseId)
            .then(key => setInCart(key))
          }
        >
          Add to cart
        </button>
      )}
    </div>
  );
}