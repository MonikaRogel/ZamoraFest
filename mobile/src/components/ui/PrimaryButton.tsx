import { IonButton, IonSpinner } from '@ionic/react';
import type { ReactNode } from 'react';

import './PrimaryButton.css';

interface PrimaryButtonProps {
  readonly children: ReactNode;
  readonly type?: 'button' | 'submit';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly expand?: 'block' | 'full';
  readonly ariaLabel?: string;
  readonly onClick?: () => void;
}

function PrimaryButton({
  children,
  type = 'button',
  disabled = false,
  loading = false,
  loadingLabel = 'Cargando...',
  expand = 'block',
  ariaLabel,
  onClick,
}: PrimaryButtonProps) {
  return (
    <IonButton
      className="zf-primary-button"
      type={type}
      expand={expand}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {loading ? (
        <span className="zf-primary-button__loading">
          <IonSpinner name="crescent" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </IonButton>
  );
}

export default PrimaryButton;
