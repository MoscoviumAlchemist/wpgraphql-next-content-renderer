import React, { Fragment, PropsWithChildren } from 'react';
import Script from 'next/script';
import { escapeRegExp } from 'lodash';

import {
  ScriptLoadingStrategyEnum,
  ScriptLoadingGroupEnum,
  EnqueuedScript,
} from "@/types";

function ScriptMapper(script: EnqueuedScript) {
  const {
    src: rawSrc,
    handle,
    strategy: loadingStrategy,
    location,
    before,
    after,
    extraData
  } = script;

  let beforeScript;
  if (before) {
    beforeScript = Array.isArray(before) ? before.join(' ') : before;
  }

  let afterScript;
  if (after) {
    afterScript = Array.isArray(after) ? after.join(' ') : after;
  }

  switch (handle) {
    case 'wp-api-fetch':
      afterScript = afterScript?.replace(
        new RegExp(`(((https?:)?\/\/|\/\/)${escapeRegExp(process.env.wcr_wp_domain)}\/wp\-json)`),
        `${process.env.wcr_frontend_url}/wp-json`,
      );
      afterScript = afterScript?.replace(
        new RegExp(`(((https?:)?\/\/|\/\/)${escapeRegExp(process.env.wcr_wp_domain)}\/wp\-admin\/admin\-ajax\.php)`),
        `${process.env.wcr_frontend_url}/api/wp`,
      );
      break;
  }

  const async = loadingStrategy === ScriptLoadingStrategyEnum.ASYNC || undefined;
  const defer = loadingStrategy === ScriptLoadingStrategyEnum.DEFER || undefined;
  const strategy = location === ScriptLoadingGroupEnum.HEADER ? 'beforeInteractive' : 'afterInteractive';

  let src = rawSrc || '';
  if (src.startsWith('/')) {
    src = `${process.env.wcr_wp_siteurl}${src}`
  }

  return (
    <Fragment key={handle}>
      {extraData && (
        <Script
          id={`${handle}-extra`}
          dangerouslySetInnerHTML={{ __html: extraData }}
          strategy={strategy}
        />
      )}
      {beforeScript && (
        <Script
          id={`${handle}-before`}
          dangerouslySetInnerHTML={{ __html: beforeScript }}
          strategy={strategy}
        />
      )}
      <Script
        id={handle as string}
        src={src as string}
        strategy={strategy}
        async={async}
        defer={defer}
      />
      {afterScript && (
        <Script
          id={`${handle}-after`}
          dangerouslySetInnerHTML={{ __html: afterScript }}
          strategy={strategy}
        />
      )}
    </Fragment>
  );
}

type RenderScriptProps = { scripts: EnqueuedScript[] };

export async function RenderScripts({ scripts, children }: PropsWithChildren<RenderScriptProps>) {
  const headerScripts = scripts
    .filter((script) => script.location === ScriptLoadingGroupEnum.HEADER)
  const footerScripts = scripts
    .filter((script) => script.location === ScriptLoadingGroupEnum.FOOTER)

  return (
    <Fragment>
      {headerScripts.map(ScriptMapper)}
      {children}
      {footerScripts.map(ScriptMapper)}
    </Fragment>
  );
}