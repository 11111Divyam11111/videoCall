'use client'

import { useSocket } from "@/context/socketContext";
import VideoContainer from "./VideoContainer";
import { useCallback, useEffect, useState } from "react";
import { MdMic, MdMicOff, MdVideoCall, MdVideocam, MdVideocamOff } from "react-icons/md";

const VideoCall = () => {
    const { localStream, peer, ongoingCall, handleHangUp, isCallEnded } = useSocket();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVidOn, setIsVidOn] = useState(true);

    useEffect(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            setIsVidOn(videoTrack.enabled);
            const audioTrack = localStream.getAudioTracks()[0];
            setIsMicOn(audioTrack.enabled);
        }
    }, [localStream])

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVidOn(videoTrack.enabled);
        }
    }, [localStream]);

    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    }, [localStream])

    const isOnCall = localStream && peer && ongoingCall ? true : false;

    if (isCallEnded) {
        return (
        <div className="mt-10 flex items-center justify-center ">
            <p className="p-3 bg-rose-500 text-white rounded-md">Call Ended</p>
        </div>);
    }

    if (!localStream && !peer) return

    return (
        <>
            <div className="mt-4 relative flex items-left justify-center">
                {localStream && <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} />}
                {
                    peer && peer.stream && <VideoContainer stream={peer?.stream} isLocalStream={false} isOnCall={isOnCall} />
                }
            </div>

            <div className="mt-8 space-x-2 flex items-center justify-center">
                <button onClick={toggleAudio} className="rounded-full bg-gray-300 p-2">
                    {isMicOn && <MdMic size={28} />}
                    {!isMicOn && <MdMicOff size={28} />}
                </button>
                <button className="px-4 py-2 bg-rose-500 text-white rounded-md" onClick={() => handleHangUp({ ongoingCall: ongoingCall ? ongoingCall : undefined, isEmitHangup: true })}>
                    End Call
                </button>
                <button onClick={toggleVideo} className="rounded-full bg-gray-300 p-2">
                    {isVidOn && <MdVideocam size={28} />}
                    {!isVidOn && <MdVideocamOff size={28} />}
                </button>
            </div>
        </>
    )
}

export default VideoCall;