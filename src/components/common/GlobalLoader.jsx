import React, { useEffect, useState } from 'react';
import { subscribe } from '../../utils/loading';

const GlobalLoader = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribe(setVisible);
    return () => unsub();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-4 border-white/40 border-t-white animate-spin"></div>
        <div className="text-white font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default GlobalLoader;
