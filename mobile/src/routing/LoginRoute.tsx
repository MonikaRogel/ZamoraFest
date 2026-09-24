import {
  useEffect,
  useMemo,
} from 'react';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import {
  useApplicationState,
} from '../state/ApplicationStateContext';
import {
  resolvePostLoginDestination,
  sanitizeProtectedDestination,
} from './route-security';

function LoginRoute() {
  const history =
    useHistory();

  const location =
    useLocation();

  const {
    pendingDestination,
    setPendingDestination,
  } =
    useApplicationState();

  const redirectFromQuery =
    useMemo(() => {
      const params =
        new URLSearchParams(
          location.search,
        );

      return sanitizeProtectedDestination(
        params.get(
          'redirect',
        ),
      );
    }, [
      location.search,
    ]);

  const registrationSucceeded =
    useMemo(() => {
      const params =
        new URLSearchParams(
          location.search,
        );

      return (
        params.get(
          'registered',
        ) === '1'
      );
    }, [
      location.search,
    ]);

  useEffect(() => {
    if (
      redirectFromQuery !==
        null &&
      redirectFromQuery !==
        pendingDestination
    ) {
      setPendingDestination(
        redirectFromQuery,
      );
    }
  }, [
    pendingDestination,
    redirectFromQuery,
    setPendingDestination,
  ]);

  return (
    <LoginPage
      registrationSucceeded={
        registrationSucceeded
      }
      onAuthenticated={() => {
        const destination =
          resolvePostLoginDestination(
            pendingDestination ??
              redirectFromQuery,
          );

        setPendingDestination(
          null,
        );

        history.replace(
          destination,
        );
      }}
    />
  );
}

export default LoginRoute;
