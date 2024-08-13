'use server';

import { cookies } from 'next/headers';
import { startSession, renewTokenIfExpired, cookieOptions, time } from '@/lib/session';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export async function getTokens(): Promise<{ sessionToken: string, authToken?: string }> {
  let sessionToken = cookies().get('sessionToken')?.value;
  let authToken = cookies().get('authToken')?.value;
  
  const updatedCookies: ResponseCookie[] = [];
  if (!sessionToken) {
    sessionToken = await startSession();
    updatedCookies.push({
      name: 'sessionToken',
      value: sessionToken,
      ...cookieOptions,
    });
  }

  if (authToken) {
    const refreshToken = cookies().get('refreshToken')?.value;
    const expirationTime = cookies().get('authTokenExp')?.value;
    authToken = await renewTokenIfExpired(authToken, refreshToken, expirationTime);

    authToken && updatedCookies.push({
      name: 'authToken',
      value: authToken,
      ...cookieOptions,
    });
    authToken && updatedCookies.push({
      name: 'authTokenExp',
      value: (time() + 3600).toString(),
      ...cookieOptions,
    });
  }

  updatedCookies.forEach(cookie => {
    cookies().set(cookie);
  });

  return { sessionToken, authToken };
}

type CartItem = {
  key: string;
  product: {
    node: {
      id: string;
      databaseId: number;
    };
  };
  variation?: {
    node: {
      id: string;
      databaseId: number;
    };
  };
};
export async function isInCart(productId: number, variationId?: number): Promise<string|false> {
  const { sessionToken, authToken } = await getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'woocommerce-session': `Session ${sessionToken}`,
  };

  console.log(headers);

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(process.env.GRAPHQL_ENDPOINT as string, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `query {
        cart {
          contents {
            nodes {
              key
              product {
                node {
                  id
                  databaseId
                }
              }
              variation {
                node {
                  id
                  databaseId
                }
              }
            }
          }
        }
      }`,
    }),
    cache: 'no-store',
  });

  const { data } = await response.json();
  const cartItems: CartItem[] = data?.cart?.contents?.nodes;
  const cartitem = cartItems?.find((item: CartItem) => {
    if (variationId) {
      return item.product.node.databaseId === productId && item.variation?.node.databaseId === variationId;
    }
    return item.product.node.databaseId === productId;
  });

  return cartitem?.key || false;
}

export async function addToCart(productId?: number, quantity?: number, variationId?: number, variation?: Record<string, string>, extraData?: Record<string, string>): Promise<string|false> {
  const input = {
    productId,
    quantity: quantity || 1,
    variationId,
    variation,
    extraData,
  };

  const { sessionToken, authToken } = await getTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'woocommerce-session': `Session ${sessionToken}`,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(process.env.GRAPHQL_ENDPOINT as string, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `mutation ($input: AddToCartInput!) {
        addToCart(input: $input) {
          cartItem {
            key
            product {
              node {
                id
              }
            }
          }
        }
      }`,
      variables: { input },
    }),
    cache: 'no-store',
  });

  const { data, errors } = await response.json();
  const cartItem = data?.addToCart?.cartItem;

  console.log(data, errors);

  if (!cartItem) {
    return false;
  }

  return cartItem.key;
}

export async function removeCartItem(key: string) {
  const { sessionToken, authToken } = await getTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'woocommerce-session': `Session ${sessionToken}`,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(process.env.GRAPHQL_ENDPOINT as string, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `mutation ($input: RemoveCartItemInput!) {
        removeCartItem(input: $input) {
          removed
        }
      }`,
      variables: { input: { keys: [ key ] } },
    }),
    cache: 'no-store',
  });

  const { data } = await response.json();
  const removed = data?.removeCartItem?.removed;

  return removed;
}