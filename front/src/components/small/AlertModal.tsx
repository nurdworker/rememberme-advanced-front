// public modules
import React, { useEffect, useState } from "react";

// css
import "./AlertModal.scss";

// type
interface AlertModalProps {
  message: string | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  // component state
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

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
        <div className="alert-message">
          <img src="/nw-emo.png" alt="emoticon" />
          {message ? (
            message.split("\n").map((line, index) => (
              <p key={index} className="alert-line">
                {line}
              </p>
            ))
          ) : (
            <p>No message</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
