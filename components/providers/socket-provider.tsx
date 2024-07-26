'use client';
import React, { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import {io as clinetIo} from 'socket.io-client';

type SocketContexType = {
    socket: any | null;
    isConnected : Boolean;
}

const SocketContex = createContext<SocketContexType>({
    socket:null,
    isConnected:false,
});

export const useSocket = () =>{
    return useContext(SocketContex);
}

export const SocketProvider = ({
    children
}:{
    children: React.ReactNode
})=>{
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(()=>{
      const socketInstance = new(clinetIo as any)(process.env.NEXT_PUBLIC_SITE_URL!,{
        path: '/api/socket/io',
        addTrailingSlash: false,
      })

      socketInstance.on('connect', () =>{
        setIsConnected(true);
      });

      socketInstance.on('disconnect', ()=>{
        setIsConnected(false);
      })

      setSocket(socketInstance);
      return()=>{
        socketInstance.disconnect();
      }
    },[]);

    return (
        <SocketContex.Provider value={{socket,isConnected}}>
            {children}

        </SocketContex.Provider>
    )
}