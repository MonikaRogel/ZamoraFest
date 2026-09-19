import { Redirect, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';

import { useApplicationState } from '../state/ApplicationStateContext';
import type { AuthRole } from '../types/api';
import { buildLoginRedirect } from './route-security';

interface ProtectedRouteProps
  extends Omit<
    RouteProps,
    'render' | 'component' | 'children'
  > {
  readonly render: NonNullable<RouteProps['render']>;
  readonly allowedRoles?: readonly AuthRole[];
  readonly forbiddenRedirect?: string;
}

function ProtectedRoute({
  render,
  allowedRoles,
  forbiddenRedirect = '/explore',
  ...routeProps
}: ProtectedRouteProps) {
  const {
    session,
    role,
  } = useApplicationState();

  return (
    <Route
      {...routeProps}
      render={(routeComponentProps) => {
        const {
          pathname,
          search,
          hash,
        } = routeComponentProps.location;

        const requestedDestination =
          `${pathname}${search}${hash}`;

        if (session === null) {
          return (
            <Redirect
              to={buildLoginRedirect(
                requestedDestination,
              )}
            />
          );
        }

        const requiresSpecificRole =
          allowedRoles !== undefined &&
          allowedRoles.length > 0;

        const hasAllowedRole =
          role !== null &&
          allowedRoles?.includes(role);

        if (
          requiresSpecificRole &&
          !hasAllowedRole
        ) {
          return (
            <Redirect
              to={forbiddenRedirect}
            />
          );
        }

        return render(routeComponentProps);
      }}
    />
  );
}

export default ProtectedRoute;
