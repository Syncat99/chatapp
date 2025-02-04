import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../../context/dataContext";
import Chat from "../chat/chat";
import Footer from "../footer/footer";

export default function HomePage() {
  const { data } = useData();
  const memoizedComponent = useMemo(() => {
    return <Chat />;
  }, []);
  return (
    <>
      {!data && (
        <>
          <div className="flex flex-col justify-center bg-gray-300 py-32 px-48 h-[calc(100vh-7rem)] gap-6 items-center">
            <div className="flex flex-col w-1/2  gap-6 items-center text-gray-700">
              <span className="font-bold text-4xl uppercase">Chat in private rooms,</span>
              <span className="font-bold text-4xl uppercase">just for you and your friends.</span>
            </div>
            <img src="/demo.png" className="w-4/5 rounded-lg shadow-lg object-cover" alt="Demo Preview" title="Demo Preview" />
          </div>
          <Footer />
        </>
      )}
      {data && <>{memoizedComponent}</>}
    </>
  );
}
