import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useData } from "./dataContext";
import axios from "axios";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { data, rooms } = useData();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });

    setSocket(newSocket);
    newSocket.on("connect", () => {
    });

    newSocket.on("disconnect", () => {
    });

    newSocket.on("receiveMessage", (msg) => {
      msg.createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");;
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (rooms && rooms[0] != null && !hasRun.current) {
      setCurrentRoom(rooms[0].id);
      joinRoom(rooms[0].id);
      hasRun.current = true;
    }
  }, [rooms]);

  const hasRun = useRef(false);

  const getMessages = async (roomId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/getMessages",
        { roomId }, 
        {
          withCredentials: true, 
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessages(response.data);
    } catch (error) {
      return [];
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit("joinRoom", roomId);
      setCurrentRoom(roomId);
      if (roomId != currentRoom) {
        setMessages([]);
      }
      getMessages(roomId);
    }
  };

  const sendMessage = (message) => {
    if (socket && message != "") {
      const messageData = {
        room: currentRoom,
        sender: data?.username,
        content: message,
      };
      socket.emit("sendMessage", messageData);
    }
  };

  return <SocketContext.Provider value={{ socket, joinRoom, sendMessage, currentRoom, setCurrentRoom, messages }}>{children}</SocketContext.Provider>;
};
