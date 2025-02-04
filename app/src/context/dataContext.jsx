import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./socketContext";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [rooms, setRooms] = useState(null);
  const getRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/getRooms", { withCredentials: true });
      if (!res) {
        setRooms(null);
      }
      if (res) {
        setRooms(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getData = async () => {
    try {
      const result = await axios.get("http://localhost:8000/api/checkAuth", { withCredentials: true });
      if (!result) {
        setData(null);
      }
      if (result) {
        setData(result.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getData();
    getRooms();
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        rooms,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
