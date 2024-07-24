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
        nodeByUri(uri: "/example-page") {
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

  return (
    <>
      <Styles stylesheets={stylesheets} />
      <RenderScripts scripts={scripts}>
        <Content content={content} />
      </RenderScripts>
    </>
  );
}
