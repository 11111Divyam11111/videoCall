"use client";

import { useSocket } from "@/context/socketContext";
import { MdCall, MdCallEnd } from "react-icons/md";

const CallNotification = () => {
    const { ongoingCall , handleJoin} = useSocket();

    if (!ongoingCall?.isRinging) return null;
    else {
        return (
            <div className="flex justify-center flex-col p-3 gap-3">
                <div className="flex justify-center">
                    <p className="bg-rose-500 p-4 text-white rounded-md">someone is calling</p>
                </div>
                <div className="flex flex-row space-x-4 justify-center">                    
                    <button className="rounded-full p-3 bg-green-400" onClick={()=>handleJoin(ongoingCall)}> <MdCall size={24} /></button>
                    <button className="rounded-full p-3 bg-red-800"><MdCallEnd size={24} /></button>
                </div>
            </div>
        );
    }
};

export default CallNotification;
