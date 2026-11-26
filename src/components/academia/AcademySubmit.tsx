'use client';

import { Button } from '@astryxdesign/core/Button';
import { useFormStatus } from 'react-dom';

export function AcademySubmit({ label, pending, fullWidth = false, variant = 'primary' }: {
  label: string;
  pending: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const status = useFormStatus();
  return (
    <Button type="submit" variant={variant} size="lg" label={status.pending ? pending : label} isLoading={status.pending} width={fullWidth ? '100%' : undefined} />
  );
}
