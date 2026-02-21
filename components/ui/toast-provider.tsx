"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export function ToastProvider() {
  const [position, setPosition] = useState<"top-right" | "top-center">("top-right");

  useEffect(() => {
    const checkMobile = () => {
      setPosition(window.innerWidth < 640 ? "top-center" : "top-right");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          duration: 3000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
