// public modules
import React, { useEffect, useState } from "react";

// css
import "./AlertModal.scss";

// type
interface AlertModalProps {
  message: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  //component state
  const [isVisible, setIsVisible] = useState(false); // 처음에는 숨겨져 있다가 fade-in됨
  const [isFadingOut, setIsFadingOut] = useState(false); // fade-out 여부 추적
  const [isHidden, setIsHidden] = useState(false); // alert가 완전히 숨겨졌는지 추적

  // useEffects
  useEffect(() => {
    setIsVisible(true);

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500);

    const completeFadeOutTimer = setTimeout(() => {
      setIsHidden(true);
      onClose();
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeFadeOutTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`alert-modal-overlay ${isVisible ? "show" : "hide"} ${
        isFadingOut ? "fade-out" : ""
      }`}
      style={{
        pointerEvents: isFadingOut || isHidden ? "none" : "auto",
        display: isHidden ? "none" : "flex",
      }}
    >
      <div
        className={`alert-modal ${isVisible ? "show" : "hide"} ${
          isFadingOut ? "fade-out" : ""
        }`}
      >
        <div className="alert-message">{message}</div>
      </div>
    </div>
  );
};

export default AlertModal;
