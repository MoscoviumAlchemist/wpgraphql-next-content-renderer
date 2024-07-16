import { NextResponse, NextRequest } from 'next/server';

export async function proxyByWCR(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  const nextPath = request.nextUrl.pathname;

  //Proxy handler for WP assets e.g. (.js, .css, .png, etc.)
  if (nextPath.startsWith('/api/wp-assets')) {
    const scriptUrl = nextPath.replace(
      /^\/api\/wp-assets\/(.*)/,
      `${process.env.wcr_wp_url}/$1`
    );

    return NextResponse.rewrite(scriptUrl);
  }

  // Proxy handler for WP REST API requests. 
  if (nextPath.startsWith('/api/wp-json')) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const backendRoute = nextPath.replace(/^\/api\/wp\-json\/(.*)/, `${process.env.wcr_wp_url}/wp-json/$1?${params.toString()}`);
    
    const headers = new Headers(request.headers);
    headers.set('x-middleware-rewrite', backendRoute);

    const response = new NextResponse(null, { ...request, headers });

    return response;
  }

  // Proxy handler for WP Ajax API requests. 
  const forwardedApiRoutes = ['/api/wp', '/api/wc'];
  if (forwardedApiRoutes.includes(nextPath)) {
    const headers = new Headers(request.headers);

    const url = new URL(request.url);
    const params = url.searchParams;
    let backendRoute: string;
    if (nextPath === '/api/wc') {
      backendRoute = `${process.env.wcr_wp_url}/?${params.toString()}`;
    } else if (nextPath === '/api/wp-json') {
      backendRoute = nextPath.replace(/^\/api\/wp\-json\/(.*)/, `${process.env.wcr_wp_url}/wp-json/$1`);
    } else {
      backendRoute = `${process.env.wcr_wp_url}/wp-admin/admin-ajax.php?${params.toString()}`;
    }
    headers.set('x-middleware-rewrite', backendRoute);

    const response = new NextResponse(null, { ...request, headers });

    return response;
  }

  return NextResponse.next({
    request: {
      ...request,
      headers: requestHeaders,
    },
  });
}

export const proxyMatcher = {
  matcher: ['/api/wp', '/api/wc', '/api/wp-assets/:path*', '/api/wp-json/:path*'],
}

export const isProxiedRoute = (path: string) => {
  return proxyMatcher.matcher.includes(path);
}
