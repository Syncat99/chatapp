import { createContext, useContext, useEffect, useState } from "react";
import Modal from "../components/modal";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalDetails, setModalDetails] = useState({ state: false, content: { type: "", step: 0 } });

  const openModal = (modalType) => {
    setModalDetails({
      state: true,
      content: { type: modalType, step: 0 },
    });
  };

  const closeModal = () => {
    setModalDetails({
      state: false,
      content: { type: "", step: 0 },
    });
  };

  return <ModalContext.Provider value={{ modalDetails, openModal, closeModal, setModalDetails }}>{children}</ModalContext.Provider>;
};

export default ModalContext;
