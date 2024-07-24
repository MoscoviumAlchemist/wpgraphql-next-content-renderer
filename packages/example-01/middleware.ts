import { NextRequest } from 'next/server';
import { proxyByWCR } from '@axistaylor/wpgraphql-next-content-renderer/proxyByWCR';

export const middleware = async (request: NextRequest) => {
  return proxyByWCR(request);
}

export const config = {
  matcher: [
    '/api/wp',
    '/api/wc',
    '/api/wp-internal-assets/:path*',
    '/api/wp-assets/:path*',
    '/api/wp-json/:path*',
  ],
}