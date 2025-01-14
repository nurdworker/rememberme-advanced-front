// public modules
import React, { useEffect, useState } from "react";

// css
import "./ConfirmAlertModal.scss";

// type
interface ConfirmAlertModalProps {
  message: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAlertModal: React.FC<ConfirmAlertModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  // component state
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  // useEffects
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // button handlers
  const handleConfirmClick = () => {
    console.log("Confirm button clicked");
    onConfirm();
    setIsHidden(true);
    setIsFadingOut(true);
  };

  const handleCancelClick = () => {
    console.log("Cancel button clicked");
    onCancel();
    setIsHidden(true);
    setIsFadingOut(true);
  };

  return (
    <div
      className={`confirm-alert-modal-overlay ${isVisible ? "show" : "hide"} ${
        isFadingOut ? "fade-out" : ""
      }`}
      style={{
        pointerEvents: isFadingOut || isHidden ? "none" : "auto",
        display: isHidden ? "none" : "flex",
      }}
    >
      <div
        className={`confirm-alert-modal ${isVisible ? "show" : "hide"} ${
          isFadingOut ? "fade-out" : ""
        }`}
      >
        <div className="confirm-alert-message">
          <img src="/nw-emo.png" alt="emoticon" />
          {message ? (
            message.split("/n").map((line, index) => (
              <p key={index} className="confirm-alert-line">
                {line}
              </p>
            ))
          ) : (
            <p>empty</p>
          )}
        </div>
        <div className="confirm-alert-btns">
          <button className="confirm-btn" onClick={handleConfirmClick}>
            confirm
          </button>
          <button className="cancel-btn" onClick={handleCancelClick}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAlertModal;
