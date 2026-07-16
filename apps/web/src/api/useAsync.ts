import { useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Ejecuta una promesa al montar (o cuando cambian las deps) y expone su estado. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    fn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        active &&
        setState({
          data: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Error desconocido',
        }),
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
