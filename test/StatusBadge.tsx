import React from 'react';
import { useTranslations as translate } from 'next-intl';

export const StatusBadge = ({ status }) => {
  const t = translate('status');

  return (
    <div className="status-badge">
      {status === 'in_review' && (
        <span className="review">{t('in_review')}</span>
      )}
      
      {status === 'onboarded' && (
        <span className="success">{t('onboarded')}</span>
      )}
      
      {status === 'declined' && (
        <span className="error">{t('declined')}</span>
      )}
      
      {status === 'in_progress' && (
        <span className="pending">{t('in_progress')}</span>
      )}
      
      {/* This will be caught as a missing translation by our validator */}
      {status === 'unknown' && (
        <span className="unknown">{t('unknown')}</span>
      )}
    </div>
  );
};