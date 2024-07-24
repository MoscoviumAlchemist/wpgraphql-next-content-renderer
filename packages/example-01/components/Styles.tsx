'use client';

import { RenderStylesheets, EnqueuedStylesheet } from "@axistaylor/wpgraphql-next-content-renderer/client";

export default function Styles({ stylesheets }: { stylesheets: EnqueuedStylesheet[] }) {
  return <RenderStylesheets stylesheets={stylesheets} />;
}