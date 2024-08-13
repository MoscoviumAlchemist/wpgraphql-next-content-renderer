'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import { RenderScripts, EnqueuedScript } from "@axistaylor/wpgraphql-next-content-renderer/client";


export interface ScriptsProps {
  scripts: EnqueuedScript[];
  type?: 'header' | 'footer';
}

export default function Scripts({ scripts, type, children }: PropsWithChildren<ScriptsProps>) {
  return <RenderScripts scripts={scripts} type={type}>{children}</RenderScripts>;
}