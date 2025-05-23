declare module 'react-helmet-async' {
  import type React from 'react';

  interface HelmetProps {
    htmlAttributes?: React.HTMLAttributes<HTMLHtmlElement>;
    bodyAttributes?: React.HTMLAttributes<HTMLBodyElement>;
    title?: string;
    titleTemplate?: string;
    defaultTitle?: string;
    defer?: boolean;
    meta?: Array<React.MetaHTMLAttributes<HTMLMetaElement>>;
    link?: Array<React.LinkHTMLAttributes<HTMLLinkElement>>;
    script?: Array<React.ScriptHTMLAttributes<HTMLScriptElement>>;
    noscript?: Array<React.HTMLAttributes<HTMLElement>>;
    style?: Array<React.StyleHTMLAttributes<HTMLStyleElement>>;
    base?: React.BaseHTMLAttributes<HTMLBaseElement>;
    [key: string]: any;
  }

  interface HelmetProviderProps {
    context?: {};
    children: React.ReactNode;
  }

  export const Helmet: React.ComponentType<HelmetProps>;
  export const HelmetProvider: React.ComponentType<HelmetProviderProps>;
  export default Helmet;
}
