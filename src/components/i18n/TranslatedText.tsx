'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

interface Props {
  id: TranslationKey;
}

export default function TranslatedText({ id }: Props) {
  const { t } = useI18n();

  return <>{t(id)}</>;
}
