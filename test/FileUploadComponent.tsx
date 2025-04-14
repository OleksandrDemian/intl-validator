import React from 'react';
import { useTranslations } from 'next-intl';

export const FileUploadComponent = () => {
  const t = useTranslations('components.fileUploadZone');
  const tButtons = useTranslations('buttons');

  return (
    <div className="upload-zone">
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <div className="actions">
        <button className="primary">{t('button')}</button>
        <button className="secondary">{tButtons('cancel')}</button>
        <button className="submit">{tButtons('submit')}</button>
      </div>
    </div>
  );
};