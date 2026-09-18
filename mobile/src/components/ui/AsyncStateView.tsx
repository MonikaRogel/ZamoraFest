import { IonSpinner } from '@ionic/react';

import PrimaryButton from './PrimaryButton';
import './AsyncStateView.css';

type AsyncStateKind = 'loading' | 'empty' | 'error';

interface AsyncStateViewProps {
  readonly state: AsyncStateKind;
  readonly title?: string;
  readonly message?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

const defaultCopy: Record<
  AsyncStateKind,
  {
    readonly title: string;
    readonly message: string;
  }
> = {
  loading: {
    title: 'Cargando información',
    message: 'Espere un momento mientras obtenemos los datos.',
  },
  empty: {
    title: 'No hay información disponible',
    message: 'No encontramos contenido para mostrar en este momento.',
  },
  error: {
    title: 'No fue posible cargar la información',
    message: 'Intente nuevamente en unos momentos.',
  },
};

function AsyncStateView({
  state,
  title,
  message,
  actionLabel = 'Reintentar',
  onAction,
}: AsyncStateViewProps) {
  const copy = defaultCopy[state];
  const showAction = state !== 'loading' && onAction !== undefined;

  return (
    <section
      className={`zf-async-state zf-async-state--${state}`}
      role={state === 'error' ? 'alert' : 'status'}
      aria-live={state === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-busy={state === 'loading'}
    >
      {state === 'loading' && (
        <IonSpinner
          className="zf-async-state__spinner"
          name="crescent"
          aria-hidden="true"
        />
      )}

      <div className="zf-async-state__copy">
        <h2>{title ?? copy.title}</h2>
        <p>{message ?? copy.message}</p>
      </div>

      {showAction && (
        <div className="zf-async-state__action">
          <PrimaryButton onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}

export default AsyncStateView;