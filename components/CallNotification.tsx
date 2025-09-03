"use client";

import { useSocket } from "@/context/socketContext";

const CallNotification = () => {
  const { ongoingCall , handleEndCall } = useSocket();

  if (!ongoingCall?.isRinging) return null;
  else {
    return (
      <div className="flex justify-center">
        <div className="flex w-1/5 flex-col bg-slate-500 bg-opacity-70 flex items-center justify-center">        
        <p>someone is calling</p>
        <button onClick={handleEndCall}>End Call</button>
        <button>Pick Up Call</button>
        </div>
      </div>
    );
  }
};

export default CallNotification;
