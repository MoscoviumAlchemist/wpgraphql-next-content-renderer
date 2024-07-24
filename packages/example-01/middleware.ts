import { NextRequest } from 'next/server';
import { proxyMatcher, proxyByWCR } from '@axistaylor/wpgraphql-next-content-renderer/proxyByWCR';

export const middleware = async (request: NextRequest) => {
  return proxyByWCR(request)
}

export const config = {
  matcher: proxyMatcher,
}