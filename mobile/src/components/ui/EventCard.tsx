import { IonIcon } from '@ionic/react';
import {
  calendarOutline,
  locationOutline,
  pricetagOutline,
} from 'ionicons/icons';

import PrimaryButton from './PrimaryButton';
import './EventCard.css';

type EventCardVariant = 'featured' | 'compact';

interface EventCardProps {
  readonly title: string;
  readonly description?: string;
  readonly dateLabel: string;
  readonly locationLabel: string;
  readonly categoryLabels?: readonly string[];
  readonly costLabel?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly variant?: EventCardVariant;
}

function EventCard({
  title,
  description,
  dateLabel,
  locationLabel,
  categoryLabels = [],
  costLabel,
  actionLabel = 'Ver detalles',
  onAction,
  variant = 'compact',
}: EventCardProps) {
  return (
    <article
      className={`zf-event-card zf-event-card--${variant}`}
    >
      <div className="zf-event-card__content">
        <div className="zf-event-card__topline">
          {categoryLabels.length > 0 && (
            <div
              className="zf-event-card__categories"
              aria-label="Categorías del evento"
            >
              {categoryLabels.map((category, index) => (
                <span
                  className="zf-event-card__category"
                  key={`${category}-${index}`}
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {costLabel && (
            <span
              className="zf-event-card__cost"
              aria-label={`Costo: ${costLabel}`}
            >
              <IonIcon
                icon={pricetagOutline}
                aria-hidden="true"
              />
              <span>{costLabel}</span>
            </span>
          )}
        </div>

        <div className="zf-event-card__copy">
          <h2 className="zf-event-card__title">
            {title}
          </h2>

          {description && (
            <p className="zf-event-card__description">
              {description}
            </p>
          )}
        </div>

        <dl className="zf-event-card__details">
          <div className="zf-event-card__detail">
            <dt>
              <IonIcon
                icon={calendarOutline}
                aria-hidden="true"
              />
              <span>Fecha</span>
            </dt>
            <dd>{dateLabel}</dd>
          </div>

          <div className="zf-event-card__detail">
            <dt>
              <IonIcon
                icon={locationOutline}
                aria-hidden="true"
              />
              <span>Lugar</span>
            </dt>
            <dd>{locationLabel}</dd>
          </div>
        </dl>

        {onAction && (
          <div className="zf-event-card__action">
            <PrimaryButton
              ariaLabel={`${actionLabel}: ${title}`}
              onClick={onAction}
            >
              {actionLabel}
            </PrimaryButton>
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;