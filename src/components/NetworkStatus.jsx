import { useEffect, useState } from "react";

export default function NetworkStatus() {

  const [online, setOnline] =
    useState(navigator.onLine);


  useEffect(() => {

    const handleOnline = () => {
      setOnline(true);
    };

    const handleOffline = () => {
      setOnline(false);
    };


    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );


    return () => {

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

    };

  }, []);


  return (
    <div
      className={
        online
          ? "network online"
          : "network offline"
      }
    >
      {online ? (
        <>🟢 Online</>
      ) : (
        <>
          🔴 Offline
          <small>
            Dữ liệu sẽ được lưu trên thiết bị
          </small>
        </>
      )}
    </div>
  );
}