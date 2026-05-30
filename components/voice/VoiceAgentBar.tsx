import React, { useEffect, useState } from 'react';
import { VoiceMicFallback } from './VoiceMicFallback';

export type VoiceAgentBarProps = {
  onSubmit: (text: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
  /** @deprecated Mic always shows; fallback handles unavailable native module. */
  hideWhenUnavailable?: boolean;
};

type ImplComponent = React.ComponentType<VoiceAgentBarProps>;

export function VoiceAgentBar(props: VoiceAgentBarProps) {
  const [Impl, setImpl] = useState<ImplComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('./VoiceAgentBarImpl')
      .then((mod) => {
        if (!cancelled) setImpl(() => mod.VoiceAgentBarImpl);
      })
      .catch(() => {
        /* Native module missing — keep fallback mic visible */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (Impl) return <Impl {...props} />;
  return <VoiceMicFallback {...props} />;
}
