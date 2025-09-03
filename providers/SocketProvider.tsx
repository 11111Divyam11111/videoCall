"use client"

import { SocketContextProvider } from "@/context/socketContext";

const SocketProvider = ({children} : {children:React.ReactNode}) => {
    return (
        <SocketContextProvider>
            {children}
        </SocketContextProvider>
    );
}
 
export default SocketProvider;