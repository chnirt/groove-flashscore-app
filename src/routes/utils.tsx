import { Suspense, lazy } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import { routes } from "../routes";
import useAuthRoute from "../hooks/useAuthRoute";
import { AuthStatus } from "../context/Auth";
import { FadeFramer } from "../animation";

type ILoadable = {
  factory: () => Promise<{
    default: React.ComponentType<unknown>;
  }>;
  fallback?: React.ReactNode;
};

export const Loadable = ({ factory, fallback, ...rest }: ILoadable) => {
  const LazyComponent = lazy(factory);
  const { pathname } = useLocation();
  return (
    <Suspense fallback={fallback ?? <Loading />}>
      <FadeFramer pathname={pathname}>
        <LazyComponent {...rest} />
      </FadeFramer>
    </Suspense>
  );
};

const MyOutlet = ({
  status,
  condition,
  redirect,
}: {
  status: AuthStatus;
  condition: boolean;
  redirect: string;
}) =>
  status === AuthStatus.loading ? (
    <Loading />
  ) : condition ? (
    <Navigate
      to={{
        pathname: redirect,
      }}
      replace
    />
  ) : (
    <Outlet />
  );

export const PrivateRoute = () => {
  const { isLoggedIn = false, status } = useAuthRoute();
  return (
    <MyOutlet status={status} condition={!isLoggedIn} redirect={routes.login} />
  );
};

export const PublicRoute = () => {
  const { isLoggedIn = false, status } = useAuthRoute();
  return (
    <MyOutlet status={status} condition={isLoggedIn} redirect={routes.app} />
  );
};

export const Common = () => {
  return <Outlet />;
};
