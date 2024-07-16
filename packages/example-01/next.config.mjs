import { withWCR } from '@axistaylor/wpgraphql-next-content-renderer/withWCR';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    GRAPHQL_ENDPOINT: 'http://localhost:8080/wp/graphql',
  }
};

export default withWCR(nextConfig, {
  wpDomain: 'localhost:8080',
  wpProtocol: 'http',
  frontendDomain: 'localhost:3000',
  frontendProtocol: 'http',
});