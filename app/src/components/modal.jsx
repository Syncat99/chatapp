import React, { useEffect, useState } from "react";
import { useModal } from "../context/modalContext";
import axios from "axios";

export default function Modal() {
  const { modalDetails, closeModal, openModal, setAuthState, setModalDetails } = useModal();
  const [authData, setAuthData] = useState({ login: { username: "", password: "" }, registration: { username: "", password: "", email: "" } });

  if (!modalDetails.state) return null;

  const handleChange = (e) => {
    if (e.target.name === "login") {
      setAuthData((prevData) => {
        return {
          ...prevData,
          [e.target.name]: { ...prevData[e.target.name], [e.target.id]: e.target.value },
        };
      });
    } else if (e.target.name === "registration") {
      setAuthData((prevData) => {
        return {
          ...prevData,
          [e.target.name]: { ...prevData[e.target.name], [e.target.id]: e.target.value },
        };
      });
    }
  };

  const createUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/createUser",
        { data: { username: authData.registration.username, password: authData.registration.password, email: authData.registration.email } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
        { withCredentials: true }
      );
    } catch (err) {}
  };

  const connect = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/login",
        { data: { username: authData.login.username, password: authData.login.password } },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res) {
        window.location.reload();
      }
    } catch (err) {}
  };

  return (
    <div
      id="modal-overlay"
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/90"
      onClick={() =>
        setModalDetails((prev) => {
          return {
            state: false,
            content: { type: "", step: 0 },
          };
        })
      }
    >
      <div id="modal-content" className="max-w-96" onClick={(e) => e.stopPropagation()}>
        {modalDetails.content.type === "login" ? (
          <div className="flex flex-col gap-2 w-72 items-center p-4 border border-px border-gray-500 rounded-xl bg-gray-600">
            <h1 className="text-gray-200 font-bold uppercase py-2">Login</h1>
            <input
              id="username"
              name="login"
              value={authData.login.username}
              className="rounded-md p-2 w-full outline-none"
              onChange={handleChange}
              placeholder="username"
              type="text"
            />
            <input
              id="password"
              name="login"
              value={authData.login.password}
              className="rounded-md p-2 w-full outline-none"
              onChange={handleChange}
              placeholder="password"
              type="password"
            />
            <span className="self-end text-gray-300">forgot password ?</span>
            <button
              className="uppercase bg-white text-gray-500 w-full border border-px border-white rounded-md p-2 hover:text-white hover:bg-transparent"
              onClick={() => {
                connect();
              }}
            >
              connect
            </button>
            <div className="flex gap-2 w-full items-center border-t border-gray-400 py-2 my-2 justify-between">
              <span className="text-gray-300 text-sm">not a member ?</span>
              <button className="uppercase text-gray-300 py-px rounded-md hover:text-cyan-200" onClick={() => openModal("register")}>
                register
              </button>
            </div>
          </div>
        ) : modalDetails.content.type === "register" ? (
          <div className="flex flex-col gap-2 w-72 items-center p-4 border border-px border-gray-500 rounded-xl bg-gray-600">
            <h1 className="text-gray-200 font-bold uppercase py-2">CREATE AN ACCOUNT</h1>
            <input
              id="username"
              value={authData.registration.username}
              name="registration"
              className="rounded-md p-2 w-full outline-none"
              onChange={handleChange}
              placeholder="username"
              type="text"
            />
            <input
              id="password"
              value={authData.registration.password}
              name="registration"
              className="rounded-md p-2 w-full outline-none"
              onChange={handleChange}
              placeholder="password"
              type="password"
            />
            <input
              id="email"
              value={authData.registration.email}
              name="registration"
              className="rounded-md p-2 w-full outline-none"
              onChange={handleChange}
              placeholder="email"
              type="email"
            />
            <span className="self-end text-gray-300">forgot password ?</span>
            <button
              className="uppercase bg-white text-gray-500 w-full border border-px border-white rounded-md p-2 hover:text-white hover:bg-transparent"
              onClick={() => createUser()}
            >
              register
            </button>
            <div className="flex gap-2 w-full items-center border-t border-gray-400 py-2 my-2 justify-between">
              <span className="text-gray-300 text-sm">already a member ?</span>
              <button className="uppercase text-gray-300 py-px rounded-md hover:text-cyan-200" onClick={() => openModal("login")}>
                login
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
