import { OngoingCall, Participants, PeerData, SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { Socket, io } from "socket.io-client";
import Peer, { SignalData } from 'simple-peer';

interface iSocketContext {
    onlineUsers: SocketUser[] | null;
    ongoingCall: OngoingCall | null;
    handleCall: (user: SocketUser) => void;
    localStream: MediaStream | null;
    handleJoin: (ongoingCall: OngoingCall) => void;
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
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peer, setPeer] = useState<PeerData | null>(null)


    console.log("online users >> ", onlineUsers);

    const currentSocketUser = onlineUsers?.find(
        (onlineUser) => onlineUser.userId == user?.id
    );

    const getMediaStream = useCallback(async (faceMode?: String) => {
        if (localStream) {
            return localStream
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(device => device.kind == 'videoinput')

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 360, ideal: 720, max: 1080 },
                    frameRate: { min: 16, ideal: 30, max: 30 },
                    facingMode: videoDevices.length > 0 ? faceMode : undefined
                }
            });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.log("Failed to get the stream : ", error);
            setLocalStream(null);
            return null;
        }
    }, [localStream])

    const handleCall = useCallback(
        async (user: SocketUser) => {
            if (!currentSocketUser || !socket) return;

            const stream = await getMediaStream();

            if (!stream) return null;

            const participants = { caller: currentSocketUser, receiver: user };
            console.log("📞 Emitting call with participants:", participants); // ✅ log
            setOngoingCall({
                participants,
                isRinging: false,
            });
            socket.emit('call', participants);
        },
        [socket, currentSocketUser, ongoingCall]
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

    const handleHangUp = useCallback(({ }) => {

    }, []);


    // peer
    const createPeer = useCallback((stream: MediaStream, initiator: boolean) => {
        const iceServers: RTCIceServer[] = [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
            ]
        }]

        const peer = new Peer({
            stream,
            initiator,
            trickle: true,
            config: { iceServers },
        })

        peer.on('stream', (stream) => {
            setPeer((prevPeer) => {
                if (prevPeer) {
                    return { ...prevPeer, stream }
                }
                return prevPeer
            })
        })

        peer.on('error', console.error);
        peer.on('close', () => handleHangUp({}));


        const rtcPeerConnection:RTCPeerConnection = (peer as any)._pc

        rtcPeerConnection.oniceconnectionstatechange = async() =>{
            if(rtcPeerConnection.iceConnectionState == 'disconnected' || rtcPeerConnection.iceConnectionState == 'failed'){
                handleHangUp({});
            }
        }
        
        return peer
    }, [ongoingCall, setPeer]);

    const handleJoin = useCallback(async (ongoingCall: OngoingCall) => {
        // join call
        console.log(ongoingCall);
        setOngoingCall(prev => {
            if (prev) {
                return { ...prev, isRinging: false }
            }
            return prev
        });


        const stream = await getMediaStream()
        if (!stream) {
            console.log("could not get stream")
            return
        }

        const newPeer = createPeer(stream,true)
        setPeer({
            peerConnection : newPeer,
            participantUser : ongoingCall.participants.caller,
            stream : undefined
        })

        newPeer.on('signal' , async (data : SignalData) => {
            if(socket){
                console.log('emit offer');
                socket.emit('webRTCSignal',{
                    sdp : data,
                    ongoingCall,
                    isCaller : false
                })
            }
        })
    }, [socket, currentSocketUser])

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
        <SocketContext.Provider value={{ onlineUsers, handleCall, ongoingCall, localStream, handleJoin }}>
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
