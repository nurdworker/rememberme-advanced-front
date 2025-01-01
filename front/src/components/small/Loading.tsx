// public modules
import React, { useState, useEffect } from "react";

// type
interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  //component state
  const [visible, setVisible] = useState(isLoading);
  const [opacity, setOpacity] = useState(isLoading ? 1 : 0);
  const [display, setDisplay] = useState(isLoading ? "flex" : "none");

  // useEffects
  useEffect(() => {
    if (isLoading) {
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
  }, [isLoading]);

  // etc
  if (!visible) return null;

  return (
    <div
      id="spinner"
      className="loading-spinner fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 w-screen h-screen z-[100] transition-opacity duration-300"
      style={{ opacity, display }}
    >
      <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      <p className="absolute text-lg text-white">Loading...</p>
    </div>
  );
};

export default Loading;
