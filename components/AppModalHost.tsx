import React from 'react';
import { ClayModal } from './ui/ClayModal';
import { useModalStore } from '../stores/modalStore';

export function AppModalHost() {
  const visible = useModalStore((s) => s.visible);
  const variant = useModalStore((s) => s.variant);
  const title = useModalStore((s) => s.title);
  const message = useModalStore((s) => s.message);
  const confirmLabel = useModalStore((s) => s.confirmLabel);
  const cancelLabel = useModalStore((s) => s.cancelLabel);
  const loading = useModalStore((s) => s.loading);
  const runConfirm = useModalStore((s) => s.runConfirm);
  const runCancel = useModalStore((s) => s.runCancel);

  const showCancel = variant === 'confirm' || variant === 'destructive';

  return (
    <ClayModal
      visible={visible}
      variant={variant}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      loading={loading}
      dismissable={!loading && (showCancel || variant !== 'destructive')}
      onConfirm={runConfirm}
      onCancel={showCancel ? runCancel : undefined}
    />
  );
}
