import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Web-only root HTML used while statically rendering every route.
// This runs in Node.js at build time, so it must not touch browser APIs.
export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Pomodoro</title>
        <meta name="description" content="Timer pomodoro, daftar tugas, dan statistik fokus." />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F4EFE6" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#131316" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: backgroundCSS }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

const backgroundCSS = `
html, body, #root {
  background-color: #F4EFE6;
}
@media (prefers-color-scheme: dark) {
  html, body, #root {
    background-color: #131316;
  }
}
`;
