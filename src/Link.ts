import {
  AnchorHTMLAttributes,
  MouseEvent,
  useCallback,
  ReactNode,
  createElement,
} from 'react';
import url from 'url';
import Router6, { RouteParams, Query, Route } from 'router6';

import useRouter from './useRouter';

export type LinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> & {
  children:
    | ReactNode
    | ((payload: { route: Route; currentRoute: Route }) => ReactNode);
  to?: string;
  params?: RouteParams;
  query?: Query;
};

const getRoute = (
  router: Router6,
  {
    to,
    params,
    href,
    query,
  }: {
    to?: string;
    href?: string;
    params?: RouteParams;
    query?: Query;
  },
) => {
  let route = null;

  if (to) {
    route = router.findRoute(to, { params, query });
  }

  if (!route && href) {
    route = router.matchPath(href);
  }

  return [
    route,
    href || (route && url.format({ pathname: route.path, query })),
  ];
};

const Link = ({
  to,
  params,
  query,
  onClick,
  children,
  tagName: TagName = 'a',
  ...props
}: Omit<LinkProps, 'onClick'> & {
  tagName?: string;
  onClick?: (
    e: MouseEvent<HTMLAnchorElement>,
    route: Route,
  ) => Promise<any> | any;
}) => {
  const router = useRouter();
  const [route, href] = getRoute(router, {
    to,
    params,
    query,
    href: props.href,
  });

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const clickProcess = onClick && onClick(e, route);
      const defaultPrevented = e.isDefaultPrevented();

      const navigate = (process, payload) => {
        const resultRoute: Route = payload?.route || route;

        if (process && resultRoute) {
          e.preventDefault();
          router.navigateToRoute(resultRoute.name, {
            params: resultRoute.params,
            query: resultRoute.query,
            state: payload?.state,
          });
        }
      };

      if (clickProcess) {
        if (clickProcess.then) {
          clickProcess.then((payload) => navigate(true, payload));
        } else {
          navigate(true, clickProcess);
        }
      } else {
        navigate(!defaultPrevented, null);
      }
    },
    [route, onClick],
  );

  return createElement(
    TagName,
    { ...props, href, onClick: handleClick },
    typeof children === 'function'
      ? children({ route, currentRoute: router.currentRoute })
      : children,
  );
};

export default Link;
