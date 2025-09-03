import {io} from '../server.js';
const onCall = async (participants) => {
  console.log("📡 onCall triggered:", participants); // ✅ log
  console.log("👤 Receiver socketId:", participants.receiver.socketId); // ✅ log

  if (participants.receiver.socketId) {
    io.to(participants.receiver.socketId).emit("incomingCall", participants);
    console.log("✅ Incoming call emitted");
  } else {
    console.log("❌ No receiver socketId found");
  }
};

export default onCall;