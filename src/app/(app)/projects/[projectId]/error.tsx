import { useNavigate, useRouteError } from 'react-router';
import { DataError } from '~/components/feedback';

/** Scoped error boundary for a single project's board/settings. */
export default function ProjectError() {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <DataError
      title="Couldn't load this project"
      error={error}
      onRetry={() => navigate(0)}
    />
  );
}
