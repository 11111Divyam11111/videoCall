"use client";

import { useSocket } from "@/context/socketContext";
import { MdCall, MdCallEnd } from "react-icons/md";
import { useEffect, useRef } from "react";

const CallNotification: React.FC = () => {
    const { ongoingCall, handleJoin, handleHangUp } = useSocket();

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (ongoingCall?.isRinging && audioRef.current) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay blocked by browser:", err);
            });
        } else if (audioRef.current) {
            // Stop when ringing ends
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [ongoingCall?.isRinging]);


    if (!ongoingCall?.isRinging) return null;

    return (
        <div className="flex justify-center flex-col p-3 gap-3">
            <div className="flex justify-center">

                <audio ref={audioRef} src="/audio/lamba_funk.mp3" preload="auto" loop/>
                <p className="bg-rose-500 p-4 text-white rounded-md">
                    {ongoingCall.participants.caller.profile.fullName?.split(" ")[0]} is calling you
                </p>
            </div>

            <div className="flex flex-row space-x-4 justify-center">
                <button
                    className="rounded-full p-3 bg-green-400"
                    onClick={() => handleJoin(ongoingCall)}
                >
                    <MdCall size={24} />
                </button>
                <button
                    className="px-4 py-2 bg-rose-500 text-white rounded-md"
                    onClick={() =>
                        handleHangUp({
                            ongoingCall: ongoingCall ?? undefined,
                            isEmitHangup: true,
                        })
                    }
                >
                    End Call
                </button>
            </div>
        </div>
    );
};

export default CallNotification;
