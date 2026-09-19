export type RemoteData<T, E = string> =
  | {
      readonly status: 'idle';
    }
  | {
      readonly status: 'loading';
    }
  | {
      readonly status: 'success';
      readonly data: T;
    }
  | {
      readonly status: 'error';
      readonly error: E;
    };

export function remoteIdle<T, E = string>(): RemoteData<T, E> {
  return {
    status: 'idle',
  };
}

export function remoteLoading<T, E = string>(): RemoteData<T, E> {
  return {
    status: 'loading',
  };
}

export function remoteSuccess<T, E = string>(
  data: T,
): RemoteData<T, E> {
  return {
    status: 'success',
    data,
  };
}

export function remoteError<T, E = string>(
  error: E,
): RemoteData<T, E> {
  return {
    status: 'error',
    error,
  };
}
