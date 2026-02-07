import { useState } from "react";
import UnlockScreen from "./components/UnlockScreen";
import VaultView from "./components/VaultView";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <UnlockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <VaultView onLock={() => setUnlocked(false)} />;
}
