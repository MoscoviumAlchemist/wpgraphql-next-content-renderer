import React, { Fragment, PropsWithChildren, useState } from 'react';
import Script from 'next/script';
import { escapeRegExp } from 'lodash';

import {
  ScriptLoadingStrategyEnum,
  ScriptLoadingGroupEnum,
  EnqueuedScript,
} from "@/types";

interface RenderScriptProps {
  script: EnqueuedScript;
  loaded: string[];
  onReady: (handle: string) => void;
}

function RenderScript(props: RenderScriptProps) {
  const { script, loaded, onReady } = props;
  const {
    src: rawSrc,
    handle,
    strategy: loadingStrategy,
    location,
    before,
    after,
    extraData,
  } = script;

  const dependencies: string[] = script.dependencies?.map((dependency) => dependency?.handle as string) || [];

  let beforeScript: string|undefined;
  if (before) {
    beforeScript = Array.isArray(before) ? before.join(' ') : before;
  }

  let afterScript: string|undefined;
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

  const async = loadingStrategy === ScriptLoadingStrategyEnum.ASYNC || false;
  const defer = loadingStrategy === ScriptLoadingStrategyEnum.DEFER || undefined;
  const strategy = location === ScriptLoadingGroupEnum.HEADER ? 'beforeInteractive' : 'afterInteractive';

  let src = '';
  const isInternalRoute = new RegExp('^\/(?!\/)(.*)$');
  if (rawSrc && isInternalRoute.test(rawSrc)) {
    src = `${process.env.wcr_frontend_url}/api/wp-internal-assets${rawSrc}`;
  } else {
    src = rawSrc?.replace(
      new RegExp(`^((?:http(s)?:\/\/|\/\/)${escapeRegExp(process.env.wcr_wp_domain)})?\/(.*)$`),
      `${process.env.wcr_frontend_url}/api/wp-assets/$3`,
    ) || '';
  }

  if (dependencies?.length && !dependencies.every((dependency) => loaded.includes(dependency))) {
    return null;
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
        onLoad={() => onReady(handle as string)}
        onReady={() => onReady(handle as string)}
      />
      {afterScript && loaded.includes(handle as string) && (
        <Script
          id={`${handle}-after`}
          dangerouslySetInnerHTML={{ __html: afterScript }}
          strategy={strategy}
        />
      )}
    </Fragment>
  );
}

type RenderScriptsProps = { scripts: EnqueuedScript[], type?: 'header' | 'footer' };

export function RenderScripts({ scripts, type, children }: PropsWithChildren<RenderScriptsProps>) {
  const [loaded, updateLoaded] = useState<string[]>([]);
  const onReady = (handle: string) => {
    updateLoaded((prev) => [...prev, handle].filter((value, index, self) => self.indexOf(value) === index));
  }

  const headerScripts = scripts
    .filter((script) => script.location === ScriptLoadingGroupEnum.HEADER)
  const footerScripts = scripts
    .filter((script) => script.location === ScriptLoadingGroupEnum.FOOTER)

  if (type === 'header') {
    return <>{headerScripts.map((script) => <RenderScript key={script.handle} script={script} loaded={loaded} onReady={onReady} />)}</>;
  }

  if (type === 'footer') {
    return <>{footerScripts.map((script) => <RenderScript key={script.handle} script={script} loaded={loaded} onReady={onReady} />)}</>;
  }

  return (
    <Fragment>
      {headerScripts.map((script) => <RenderScript key={script.handle} script={script} loaded={loaded} onReady={onReady} />)}
      {children}
      {footerScripts.map((script) => <RenderScript key={script.handle} script={script} loaded={loaded} onReady={onReady} />)}
    </Fragment>
  );
}