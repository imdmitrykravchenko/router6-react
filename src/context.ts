import { createContext, createElement, PropsWithChildren } from 'react';
import Router6 from 'router6';

const context = createContext<Router6>(null);

export const RouterProvider = ({
  router,
  children,
}: PropsWithChildren<{ router: Router6 }>) =>
  createElement(context.Provider, { value: router }, children);

export const RouterConsumer = context.Consumer;

export default context;
