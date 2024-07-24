import React, { Fragment, FC, ReactNode, useInsertionEffect } from 'react';

import { EnqueuedStylesheet } from "@/types";
import { escapeRegExp } from 'lodash';

export interface StyleProps {
  id?: string;
  precedence?: 'low'|'medium'|'high';
  href?: string;
  children?: ReactNode;
}

const Style = 'style' as unknown as FC<StyleProps>;

type RenderStylesheetsProps = {
  stylesheets: EnqueuedStylesheet[];
};

function createLinkElement(href: string, id?: string, precedence?: 'low'|'medium'|'high') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.id = id || '';
  link.dataset.precedence = precedence || 'medium';
  return link;
}

let isInserted = new Set();
export async function RenderStylesheets({ stylesheets }: RenderStylesheetsProps) {
  

  useInsertionEffect(() => {
    stylesheets.map(({ src, handle }) => {
      if (src && !isInserted.has(handle)) {
        const href = src?.replace(
          new RegExp(`^((?:http(s)?:\/\/|\/\/)${escapeRegExp(process.env.wcr_wp_domain)})?\/(.*)$`),
          `${process.env.wcr_frontend_url}/api/wp-assets/$2`,
        ) || '';

        isInserted.add(handle);
        document.head.appendChild(createLinkElement(href));
      }
    });
  });
  
  return (
    <Fragment>
      {stylesheets.map((stylesheet) => {
        const { handle } = stylesheet;
        const src = stylesheet.src?.startsWith('/')
          ? `${process.env.wcr_wp_siteurl}${stylesheet.src}`
          : stylesheet.src;
        return (
          <Fragment key={handle}>
            {stylesheet.before && (
              <Style id={`${handle}-before`} data-precedence="low" data-href={src}>
                {stylesheet.before.join('')}
              </Style>
            )}
            {stylesheet.after && (
              <Style id={`${handle}-after`} precedence="high" href={src as string}>
                {stylesheet.after.join('')}
              </Style>
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
}