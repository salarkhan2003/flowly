import React from 'react';
import { UpdateModal } from './ui/UpdateModal';
import { useUpdateStore } from '../stores/updateStore';

/** Renders the global clay update modal — mount once in root layout. */
export function UpdateModalHost() {
  const modal = useUpdateStore((s) => s.modal);
  const hideUpdateModal = useUpdateStore((s) => s.hideUpdateModal);
  const openUpdateDownload = useUpdateStore((s) => s.openUpdateDownload);

  return (
    <UpdateModal
      visible={modal.visible}
      kind={modal.kind}
      title={modal.title}
      message={modal.message}
      manifest={modal.manifest}
      force={modal.force}
      installedVersion={modal.installedVersion}
      onClose={hideUpdateModal}
      onDownload={() => openUpdateDownload()}
    />
  );
}
