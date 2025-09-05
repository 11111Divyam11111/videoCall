// emit an event to the person who called us -> send sdp data
import { io } from "../server.js";
const onWebRTCSignal = async (data) => {
    if(data.isCaller){ // caller
        if(data.ongoingCall.participants.receiver.socketId){
            io.to(data.ongoingCall.participants.receiver.socketId).emit('webRTCSignal',data)
        }
    }else{ // reciever
        if(data.ongoingCall.participants.caller.socketId){
            io.to(data.ongoingCall.participants.caller.socketId).emit('webRTCSignal',data)
        }
    }
}

export default onWebRTCSignal;