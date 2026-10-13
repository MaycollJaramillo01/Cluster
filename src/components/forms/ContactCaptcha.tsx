'use client';

import { useEffect, useId, useState } from 'react';
import { useTranslations } from 'next-intl';

export function contactCaptchaPayload(data: FormData) {
  return {
    captchaToken: String(data.get('captchaToken') || ''),
    captchaAnswer: String(data.get('captchaAnswer') || ''),
    contactFax: String(data.get('contactFax') || ''),
  };
}

export function ContactCaptcha({ revision = 0, disabled = false }: {
  revision?: number; disabled?: boolean;
}) {
  const t = useTranslations('ContactCaptcha');
  const id = useId();
  const [refresh, setRefresh] = useState(0);
  const [challenge, setChallenge] = useState<{ token: string; image: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setChallenge(null);
    setFailed(false);
    setAnswer('');
    fetch('/api/contact/captcha', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('captcha_unavailable');
        return response.json();
      })
      .then((result) => { if (!controller.signal.aborted) setChallenge(result); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [refresh, revision]);

  return (
    <div className="mt-5 space-y-3">
      <label htmlFor={id} className="block text-sm font-medium text-muted">{t('label')}</label>
      <div className="flex flex-wrap items-center gap-3">
        {challenge ? (
          // A generated data URL is deliberately used instead of image optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={challenge.image} width={240} height={72} alt={t('imageAlt')} className="max-w-full rounded" />
        ) : (
          <p className="text-sm text-muted" role="status">{failed ? t('loadError') : t('loading')}</p>
        )}
        <button type="button" disabled={disabled} onClick={() => setRefresh((value) => value + 1)}
          className="min-h-11 text-sm text-accent underline underline-offset-4 disabled:opacity-50">
          {t('refresh')}
        </button>
      </div>
      <input type="hidden" name="captchaToken" value={challenge?.token || ''} />
      <input id={id} name="captchaAnswer" type="text" inputMode="numeric" autoComplete="off"
        required pattern="[0-9]{6}" maxLength={6} value={answer}
        onChange={(event) => setAnswer(event.target.value.replace(/\D/g, ''))}
        readOnly={!challenge || disabled} aria-describedby={`${id}-hint`}
        placeholder={t('placeholder')}
        className="w-full max-w-xs border border-line bg-surface px-4 py-3 text-[15px] text-fg outline-none focus:border-accent" />
      <p id={`${id}-hint`} className="text-xs text-muted">{t('hint')}</p>
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-fax`}>Fax</label>
        <input id={`${id}-fax`} name="contactFax" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  );
}
