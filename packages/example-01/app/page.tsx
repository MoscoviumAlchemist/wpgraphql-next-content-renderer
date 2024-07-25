import {
  Content,
  RenderScripts,
} from '@axistaylor/wpgraphql-next-content-renderer';
import Styles from '@/components/Styles';

async function fetchContentAndScripts() {
  const response = await fetch(process.env.GRAPHQL_ENDPOINT as string, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query: `query {
        nodeByUri(uri: "/sample-page") {
          ... on ContentNode {
            enqueuedStylesheets(first: 500) {
              nodes {
                handle
                src
                version
                after
                before
              }
            }
            enqueuedScripts(first: 500) {
              nodes {
                handle
                src
                strategy
                version
                after
                group
                location
                before
                extraData
              }
            }
          }
          ... on Page {
            content
          }
          ... on Post {
            content
          }
        }
      }`,
    }),
    cache: 'no-store',
  });

  const { data } = await response.json();
  const node = data?.nodeByUri;

  if (!node) {
    return {
      content: '',
      scripts: [],
      stylesheets: [],
    };
  }

  const content = node.content;
  const scripts = node.enqueuedScripts.nodes;
  const stylesheets = node.enqueuedStylesheets.nodes;

  return {
    content,
    scripts,
    stylesheets,
  }
}

export default async function Home() {
  const {
    content,
    scripts,
    stylesheets,
  } = await fetchContentAndScripts();

  console.log('content', content);

  return (
    <>
      <Styles stylesheets={stylesheets} />
      <RenderScripts scripts={scripts}>
        <div id="main-content" className="min-h-screen px-4 pt-4">
          <Content content={content} />
        </div>
      </RenderScripts>
    </>
  );
}
