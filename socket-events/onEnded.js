import {io} from '../server.js';
const onEnded = async (participants) => {

  if (participants.receiver.socketId) {
    io.to(participants.receiver.socketId).emit("callBandKarde", participants);
    console.log("✅ Incoming call ended");
  } else {
    console.log("❌ No receiver socketId found");
  }
};

export default onCall;