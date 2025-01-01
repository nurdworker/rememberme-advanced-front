// public modules
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// custom
import { auth } from "../auth";

const Auth: React.FC = () => {
  //default
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // useEffects
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        dispatch({ type: "SET_LOADING", value: true });
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const userInfo = await auth.sign(code);
          dispatch({ type: "SET_USER_INFO", value: userInfo });
          navigate("/");
        } else {
          navigate("/");
        }
        dispatch({ type: "SET_LOADING", value: false });
      } catch (error: any) {
        alert("Authentication failed: " + error.message);
        dispatch({ type: "SET_LOADING", value: false });
      }
    };

    authenticateUser();
  }, [dispatch, navigate]);

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
};

export default Auth;
