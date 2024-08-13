import { Content } from '@axistaylor/wpgraphql-next-content-renderer';
import { fetchContentByUri } from '@/lib/utils';

export default async function Home() {
  const content = await fetchContentByUri('/sample-page');

  return (
    <div id="main-content" className="min-h-screen px-4 pt-4">
      <Content content={content} />
    </div>
  );
}
