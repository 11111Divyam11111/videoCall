import { OngoingCall, Participants, SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

interface iSocketContext {
  onlineUsers: SocketUser[] | null;
  ongoingCall : OngoingCall | null;
  handleCall: (user: SocketUser) => void;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);

  console.log("online users >> ", onlineUsers);

  const currentSocketUser = onlineUsers?.find(
    (onlineUser) => onlineUser.userId == user?.id
  );

  const handleCall = useCallback(
    (user: SocketUser) => {
      if (!currentSocketUser || !socket) return 'tichki tui-ya';
      const participants = { caller: currentSocketUser, receiver: user };
      console.log("📞 Emitting call with participants:", participants); // ✅ log
      setOngoingCall({
        participants,
        isRinging: false,
      });
      socket.emit('call', participants);
    },
    [socket, currentSocketUser,ongoingCall]
  );

  const onIncomingCall = useCallback(
    (participants: Participants) => {
      setOngoingCall({
        participants,
        isRinging: true,
      });
    },
    [user, socket, ongoingCall]
  );

  // initialising a socket
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // check if the user is connected
  useEffect(() => {
    if (socket == null) return; // agar user hi nhi hai to chalo wapas
    if (socket.connected) {
      // agar use connected hai to bataodo ki wo connected hai
      onConnect();
    }

    // else agar wo connect hua to batao ki wo connected ho gaya hai
    function onConnect() {
      setIsConnected(true);
    }

    // else agar wo disconnect ho gaya to batado ki wo disconnect ho gaya hai
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // clean up the events
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // set online users
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    socket.emit("addNewUser", user);
    socket.on("getUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getUsers", (res) => {
        setOnlineUsers(res);
      });
    };
  }, [socket, isConnected, user]);

  // calls
  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on("incomingCall", onIncomingCall);
    return () => {
      socket.off("incomingCall", onIncomingCall);
    };
  }, [socket, isConnected, user, onIncomingCall]);

  return (
    <SocketContext.Provider value={{ onlineUsers, handleCall ,ongoingCall}}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context == null) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};
