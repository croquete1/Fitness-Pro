'use client';

import SessionForm, { type SessionFormProps } from '@/components/sessions/SessionForm';

type Props = Omit<SessionFormProps, 'scope' | 'prefillFromSearch' | 'onCompleted'> & {
  onSuccess?: () => void;
};

export default function AdminSessionFormClient({ onSuccess, ...rest }: Props) {
  return (
    <SessionForm
      scope="admin"
      prefillFromSearch
      onCompleted={onSuccess}
      {...rest}
    />
  );
}
