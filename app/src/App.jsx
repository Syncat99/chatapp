import { useState } from "react";
import Navbar from "./components/navbar/navbar";
import Modal from "./components/modal";
import { useModal } from "./context/modalContext";
import HomePage from "./components/homePage/homePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Profile from "./components/profile/profile";

function App() {
  const { modalDetails } = useModal();

  return (
    <>
      {modalDetails.state && <Modal />}
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
