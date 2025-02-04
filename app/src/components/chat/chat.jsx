import React, { useState, useEffect } from "react";
import { useData } from "../../context/dataContext";
import { io } from "socket.io-client";
import { useSocket } from "../../context/socketContext";
import axios from "axios";

export default function Chat() {
  const { socket, sendMessage, currentRoom, joinRoom, messages } = useSocket();
  const { data, rooms } = useData();
  const [message, setMessage] = useState("");

  const createRoom = async () => {
    const input = window.prompt("Enter your room's name");
    if (input) {
      try {
        const result = await axios.post(
          "http://localhost:8000/api/createRoom",
          { userId: data.id, title: input, username: data.username },
          { withCredentials: true }
        );
        if (result) {
          window.location.reload();
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    const messagesDiv = document.getElementById("messages");
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [messages]);

  const join = async (userId) => {
    const roomId = window.prompt("Enter room's id");
    if (roomId) {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/joinRoom",
          { roomId, userId },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response) {
          window.location.reload();
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const quitRoom = async (roomId, userId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/quitRoom",
        { roomId, userId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const deleteRoom = async (roomId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/deleteRoom",
        { roomId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="chat" className="flex w-full h-[calc(100vh-3.5rem)]">
      <div className="relative w-4/5 h-full">
        <div id="messagesZone" className="h-full p-2 bg-gray-500">
          <div id="roomTitle" className="h-14">
            <h1 className="font-bold text-gray-400 text-3xl uppercase">
              ROOM : {Array.isArray(rooms) ? rooms.find((room) => room.id === currentRoom)?.title : "No Room Selected"}
            </h1>
            {currentRoom && <span className="text-xs text-gray-400">id : {currentRoom}</span>}
          </div>
          <div id="messages" className="h-full bg-white flex flex-col overflow-y-auto p-2 h-[calc(100vh-14.5rem)]">
            {!messages && <span key="-5">No messages yet.</span>}
            {messages &&
              messages.map((msg, index) => (
                <div className="py-2 flex justify-between" key={msg.id || `msg-${index}`}>
                  <div className="flex gap-2">
                    <span className="font-semibold underline uppercase">{`<${msg.sender}>`}</span>
                    <span className="break-words max-w-xl">{msg.content}</span>
                  </div>
                  <span className="text-xs">{msg.createdAt}</span>
                </div>
              ))}
          </div>
        </div>
        <div id="textZone" className="absolute flex bottom-0 w-full h-24 bg-gray-500 p-2">
          <textarea className="w-full h-full outline-none resize-none p-2 rounded-md" onChange={(e) => setMessage(e.target.value)} value={message}></textarea>
          <button
            className="m-2 w-32 text-xl bg-gradient-to-b from-gray-600 to-gray-500 rounded-md text-white font-bold border border-gray-400 active:bg-violet-700 hover:from-gray-500 hover:to-gray-600"
            onClick={() => {
              sendMessage(message);
              setMessage("");
            }}
          >
            send
          </button>
        </div>
      </div>
      <div id="rooms" className="relative w-1/5 h-full bg-gray-500 p-4 flex flex-col justify-center items-center ">
        <button
          onClick={() => join(data.id)}
          className="self-center w-4/5 p-2 font-bold text-xl uppercase text-gray-500 border border-gray-300 rounded-md bg-gray-300 hover:text-gray-300 hover:bg-gray-500"
        >
          Join a room
        </button>
        {rooms && rooms.length > 0 && (
          <>
            <h1 className="my-4 text-3xl font-bold text-gray-800 uppercase">Rooms</h1>
            <div className="w-full h-full flex flex-col gap-2.5 items-center font-semibold text-2xl text-gray-300 overflow-y-auto h-[calc(100vh-10rem)] mb-20">
              {rooms.map((room, index) => (
                <div key={room.id} className="flex w-full items-center justify-between">
                  <button className="w-fit flex items-center gap-2.5 text-lg" onClick={() => joinRoom(room.id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square-more self-end"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M16 10h.01" />
                    </svg>
                    {`${room.title}`}
                  </button>
                  <div className="flex gap-2.5">
                    <button title="Quit this room" className="text-left hover:text-red-300" onClick={() => quitRoom(room.id, data.id)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-log-out hover:stroke-red-500"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                    </button>
                    <button title="Delete this room" className="text-left" key={room.id} onClick={() => deleteRoom(room.id)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x hover:stroke-red-500"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {((rooms && rooms.length <= 0) || !rooms) && (
          <>
            <span className="font-bold text-gray-400 text-xl text-center">you haven't joined any room yet</span>
          </>
        )}
        <button
          className="absolute top-[calc(100vh-7.5rem)] self-center w-4/5 p-2 font-bold text-xl uppercase text-gray-500 border border-gray-300 rounded-md bg-gray-300 hover:text-gray-300 hover:bg-gray-500"
          onClick={() => createRoom()}
        >
          Create room
        </button>
      </div>
    </div>
  );
}
