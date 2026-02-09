import { useState } from "react";
import UnlockScreen from "./components/UnlockScreen";
import VaultView from "./components/VaultView";
import bgImage from "./assets/indy.png";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {unlocked ? (
        <VaultView onLock={() => setUnlocked(false)} />
      ) : (
        <UnlockScreen onUnlock={() => setUnlocked(true)} />
      )}
    </div>
  );
}
