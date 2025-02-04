import axios from "axios";
import { useEffect, useState } from "react";
import { useModal } from "../../context/modalContext";
import { useData } from "../../context/dataContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { openModal, modalDetails, setModalDetails, authData, setAuthData, handleChange } = useModal();
  const { data } = useData();
  const [profileDrop, setProfileDrop] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 201) {
        window.location.reload();
      }
    } catch (err) {}
  };

  return (
    <nav className="flex justify-between py-4 px-64 bg-gray-700 text-gray-300 font-bold max-lg:px-6">
      <h1 id="logo" className="text-center cursor-pointer" onClick={() => navigate("/")}>
        CHAT APP
      </h1>
      <div className="relative">
        {!data && <button onClick={() => openModal("login")}>Login</button>}
        {data && <button onClick={() => setProfileDrop(!profileDrop)}>{data.username.toUpperCase()}</button>}
        {profileDrop && (
          <div id="drop" className="absolute flex flex-col gap-2 items-start bg-gray-600 p-4 w-48 right-0 top-8 rounded-md z-10 border border-gray-300">
            <button onClick={() => navigate("/profile")} className="flex gap-2 justify-between hover:bg-gray-500 w-full text-left py-px px-2 rounded-sm">
              Profile
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-circle-user-round"
              >
                <path d="M18 20a6 6 0 0 0-12 0" />
                <circle cx="12" cy="10" r="4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
            <button className="flex gap-2 justify-between hover:bg-gray-500 w-full text-left py-px px-2 rounded-sm" onClick={() => logout()}>
              Logout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-log-out"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
