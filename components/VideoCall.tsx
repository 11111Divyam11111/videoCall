'use client'

import { useSocket } from "@/context/socketContext";
import VideoContainer from "./VideoContainer";
import { useCallback, useEffect, useState } from "react";
import { MdMic, MdMicOff, MdVideoCall, MdVideocam, MdVideocamOff } from "react-icons/md";

const VideoCall = () => {
    const { localStream, peer, ongoingCall } = useSocket();
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


    return (
        <>
            <div className="mt-4 relative ">
                {localStream && <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} />}
                {
                    peer && peer.stream && <VideoContainer stream={peer?.stream} isLocalStream={false} isOnCall={isOnCall} />
                }
            </div>

            <div className="mt-8 space-x-2 flex items-center">
                <button onClick={toggleAudio} className="rounded-full bg-gray-300 p-2">
                    {isMicOn && <MdMicOff size={28} />}
                    {!isMicOn && <MdMic size={28} />}
                </button>
                <button className="px-4 py-2 bg-rose-500 text-white rounded-md">
                    End Call
                </button>
                <button onClick={toggleVideo} className="rounded-full bg-gray-300 p-2">
                    {isVidOn && <MdVideocamOff size={28} />}
                    {!isVidOn && <MdVideocam size={28} />}
                </button>
            </div>
        </>
    )
}

export default VideoCall;