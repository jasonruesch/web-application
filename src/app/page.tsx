import { Navigate } from 'react-router';
import { useCurrentUser } from '~/lib/use-auth';

/** Index route: send signed-in users to the dashboard, others to login. */
export default function IndexPage() {
  const user = useCurrentUser();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
