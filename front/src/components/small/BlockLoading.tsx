// public modules
import React, { useState, useEffect } from "react";

// type
interface LoadingProps {
  isBlockLoading: boolean;
}

const BlockLoading: React.FC<LoadingProps> = ({ isBlockLoading }) => {
  //component state
  const [visible, setVisible] = useState(isBlockLoading);
  const [opacity, setOpacity] = useState(isBlockLoading ? 1 : 0);
  const [display, setDisplay] = useState(isBlockLoading ? "flex" : "none");

  // useEffects
  useEffect(() => {
    if (isBlockLoading) {
      setVisible(true);
      setOpacity(1);
      setDisplay("flex");
    } else {
      const timer = setTimeout(() => {
        setOpacity(0);
      }, 0);
      const fadeOutEnd = () => {
        setDisplay("none");
      };

      const spinnerElement = document.getElementById("spinner");
      spinnerElement?.addEventListener("transitionend", fadeOutEnd);

      return () => {
        clearTimeout(timer);
        spinnerElement?.removeEventListener("transitionend", fadeOutEnd);
      };
    }
  }, [isBlockLoading]);

  // etc
  if (!visible) return null;

  return (
    <div
      id="spinner"
      className="loading-spinner fixed inset-0 flex justify-center items-center w-screen h-screen z-[100] transition-opacity duration-300"
      style={{
        opacity,
        display,
        pointerEvents: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      <p className="absolute text-lg text-black bg-white bg-opacity-75 px-2 py-1 rounded">
        Wait a min plz . . .
      </p>
    </div>
  );
};

export default BlockLoading;
