import { fetchProduct } from '@/lib/utils';
import { Product } from '@/components/Product';
import { ProductProvider } from '@/components/ProductProvider';

export interface ProductPageProps { 
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = await fetchProduct(slug);

  if (!slug || !product) return (
    <h1>Page not found</h1>
  );

  return (
    <ProductProvider product={product}>
      <Product />
    </ProductProvider>
  );
}