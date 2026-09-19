import { describe, expect, it } from 'vitest';

import {
  remoteError,
  remoteIdle,
  remoteLoading,
  remoteSuccess,
  type RemoteData,
} from './remote-data';

describe('RemoteData', () => {
  it('representa el estado idle sin datos ni error', () => {
    const state = remoteIdle<number[]>();

    expect(state).toEqual({
      status: 'idle',
    });
  });

  it('representa el estado loading sin datos ni error', () => {
    const state = remoteLoading<number[]>();

    expect(state).toEqual({
      status: 'loading',
    });
  });

  it('representa success únicamente con sus datos', () => {
    const state = remoteSuccess([1, 2, 3]);

    expect(state).toEqual({
      status: 'success',
      data: [1, 2, 3],
    });
  });

  it('representa error únicamente con su error', () => {
    const state = remoteError<number[]>(
      'No fue posible cargar los datos.',
    );

    expect(state).toEqual({
      status: 'error',
      error: 'No fue posible cargar los datos.',
    });
  });

  it('permite discriminar exhaustivamente el estado', () => {
    const state: RemoteData<readonly string[]> =
      remoteSuccess(['evento']);

    let result: string;

    switch (state.status) {
      case 'idle':
        result = 'idle';
        break;

      case 'loading':
        result = 'loading';
        break;

      case 'success':
        result = state.data.join(',');
        break;

      case 'error':
        result = state.error;
        break;
    }

    expect(result).toBe('evento');
  });
});
