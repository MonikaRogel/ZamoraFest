import type { ReactNode } from 'react';

import './ScreenHeader.css';

interface ScreenHeaderProps {
  readonly title: string;
  readonly eyebrow?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

function ScreenHeader({
  title,
  eyebrow,
  description,
  actions,
}: ScreenHeaderProps) {
  return (
    <header className="zf-screen-header">
      <div className="zf-screen-header__copy">
        {eyebrow && (
          <p className="zf-screen-header__eyebrow">
            {eyebrow}
          </p>
        )}

        <h1 className="zf-screen-header__title">
          {title}
        </h1>

        {description && (
          <p className="zf-screen-header__description">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="zf-screen-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
}

export default ScreenHeader;