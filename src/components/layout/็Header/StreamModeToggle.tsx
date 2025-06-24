// src/components/layout/StreamModeToggle.tsx

import { Switch } from '@/components/ui/switch';
import { useConfigStore } from '@/stores/configStore';

export const StreamModeToggle = () => {
  const { useStream, setUseStream } = useConfigStore();

  return (
    <div className="flex items-center gap-1 text-xs">
      <span>REST</span>
      <Switch checked={useStream} onCheckedChange={setUseStream} aria-label="toggle streaming" />
      <span>WS</span>
    </div>
  );
};
