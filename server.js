import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import onCall from "./socket-events/onCall.js";
import onEnded from "./socket-events/onEnded.js";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;


// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
export let io;

app.prepare().then(() => {
    const httpServer = createServer(handler);

    io = new Server(httpServer);
    let onlineUsers = [];

    io.on("connection", (socket) => {
        socket.on("addNewUser", (clerkUser) => {
            if (!clerkUser) return;

            // Remove any old entries for this user
            onlineUsers = onlineUsers.filter((user) => user.userId !== clerkUser.id);

            // Add fresh entry
            onlineUsers.push({
                userId: clerkUser.id,
                socketId: socket.id,
                profile: clerkUser,
            });

            console.log("✅ User added:", clerkUser.id, "with socket:", socket.id);
            io.emit("getUsers", onlineUsers);
        });



        // Handle user disconnection
        socket.on("disconnect", () => {
            // remove any user tied to this socketId
            onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

            console.log(`User disconnected: ${socket.id}`);
            console.log("Remaining users:", onlineUsers);

            io.emit("getUsers", onlineUsers);
        });


        // Handle call initiation
        socket.on('call', (participants) => {
            console.log("📡 Call event received on server:", participants); // ✅ log
            onCall(participants);
        });

    
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
