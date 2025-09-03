"use client";

import { useSocket } from "@/context/socketContext";

const CallNotification = () => {
  const { ongoingCall } = useSocket();

  if (!ongoingCall?.isRinging) return null;
  else {
    return (
      <div className="absolute bg-slate-500 w-screen bg-opacity-70 h-screen top-0 bottom-0 flex items-center justify-center">
        someone is calling
      </div>
    );
  }
};

export default CallNotification;
