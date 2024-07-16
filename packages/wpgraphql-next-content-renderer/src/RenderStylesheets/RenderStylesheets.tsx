import React, { Fragment, FC, ReactNode } from 'react';
import { preinit } from "react-dom";

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

export async function RenderStylesheets({ stylesheets }: RenderStylesheetsProps) {
  stylesheets.map((stylesheet) => {
    if (stylesheet.src) {
      const src = stylesheet.src?.replace(
        new RegExp(`^((?:http:\/\/|\/\/)${escapeRegExp(process.env.wcr_wp_domain)})?\/(.*)$`),
        `${process.env.wcr_frontend_url}/api/wp-assets/$2`,
      ) || '';
      src && preinit(src, { as: 'style', precedence: 'medium', crossOrigin: 'anonymous' });
    }
  });
  
  return (
    <Fragment>
      {stylesheets.map((stylesheet) => {
        const { handle } = stylesheet;
        const src = stylesheet.src?.startsWith('/wp-')
          ? `${process.env.BACKEND_URL}${stylesheet.src}`
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