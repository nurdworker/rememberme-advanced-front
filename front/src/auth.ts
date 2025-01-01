// public modules
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";

// static data
const api: string | undefined = process.env.REACT_APP_API_GATEWAY_ENDPOINT;

// type
interface ClientData {
  clientId: string;
  redirectUri: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

interface SignResponse {
  authResponse: string;
  userInfo: UserInfo;
  tokens: Tokens;
}

// sign flow funcs
export const auth = {
  // Code verifier 생성
  createCodeVerifier: (): string => {
    const randomString: string = Math.random().toString(36).substring(2, 15);
    return randomString;
  },

  createCodeChallenge: (codeVerifier: string): string => {
    const hash = CryptoJS.SHA256(codeVerifier);

    const base64String = hash
      .toString(CryptoJS.enc.Base64)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    console.log(base64String);
    return base64String;
  },

  // Client ID와 Redirect URI를 백엔드에서 가져오기
  getClientIdAndRedirectUri: async (): Promise<ClientData> => {
    try {
      const response = await axios.get<{
        clientId: string;
        redirectUri: string;
      }>(`${api}/user?request=getClientIdAndRedirectUri`);
      return {
        clientId: response.data.clientId,
        redirectUri: response.data.redirectUri,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  // Google OAuth URL 생성 및 리디렉션
  joinGoogleOauthUrl: async (): Promise<void> => {
    try {
      const codeVerifier: string = auth.createCodeVerifier();
      localStorage.setItem("code_verifier", codeVerifier);

      const codeChallenge: string = await auth.createCodeChallenge(
        codeVerifier
      );

      const { clientId, redirectUri }: ClientData =
        await auth.getClientIdAndRedirectUri();

      const googleOauthUrl: string =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent("openid profile email")}&` +
        `state=state_parameter_passthrough_value&` +
        `code_challenge=${encodeURIComponent(codeChallenge)}&` +
        `code_challenge_method=S256&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = googleOauthUrl;
    } catch (error) {
      alert(error);
      console.error("Error during Google OAuth URL creation:", error);
      throw error;
    }
  },

  // 인증 후, 토큰 및 사용자 정보 저장
  sign: async (oauthCode: string): Promise<UserInfo | undefined> => {
    const codeVerifier = localStorage.getItem("code_verifier");

    if (!codeVerifier) {
      throw new Error("Code verifier not found in localStorage");
    }

    try {
      const response: AxiosResponse<SignResponse> = await axios.get(
        `${api}/user?request=sign`,
        {
          headers: {
            oauthCode: oauthCode,
            codeVerifier: codeVerifier,
          },
        }
      );

      const { userInfo, tokens } = response.data;

      if (userInfo && tokens) {
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        localStorage.setItem("email", userInfo.email);
        localStorage.setItem("picture", userInfo.picture);

        localStorage.removeItem("code_verifier");

        return userInfo;
      } else {
        throw new Error("Missing required sign data");
      }
    } catch (error) {
      console.error("Error while fetching tokens:", error);
      throw error;
    }
  },
  api: axios.create({
    baseURL: api,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  }),
};

//------------------- interceptors ----------------------

// Request interceptor
auth.api.interceptors.request.use(
  (config) => {
    const authData = {
      accessToken: localStorage.getItem("access_token"),
      email: localStorage.getItem("email"),
      refreshToken: localStorage.getItem("refresh_token"),
    };

    const hasMissingData = Object.values(authData).some((value) => !value);
    const hasAnyData = Object.values(authData).some((value) => value);

    if (hasMissingData && hasAnyData) {
      localStorage.clear();
      window.location.reload();
      return Promise.reject(new Error("Auth data is missing"));
    }

    if (!hasAnyData) {
      return Promise.reject(new Error("need sign"));
    }

    if (authData.accessToken) {
      config.headers["Access-Token"] = `Bearer ${authData.accessToken}`;
      config.headers["Content-Type"] = "application/json";
    }

    if (authData.email) {
      const encodedEmail = encodeURIComponent(authData.email);
      config.params = {
        ...(config.params || {}),
        email: encodedEmail,
      };
    }

    return config;
  },
  (error) => {
    console.log("there is error on auth request interceptor");
    return Promise.reject(error);
  }
);

// Response interceptor
auth.api.interceptors.response.use(
  (response) => {
    if (response.data.authResponse === "success authorization") {
      return response;
    } else if (response.data.authResponse?.message === "here is new tokens") {
      const access_token = response.data.authResponse.tokens.access_token;
      localStorage.setItem("access_token", access_token);
      return response;
    } else {
      return response;
    }
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 419 &&
      error.response?.data.authResponse === "expired access token"
    ) {
      console.error("access is expired. retry request with refresh token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.error("there is not refresh token in local storage!");
        return Promise.reject(error);
      }

      try {
        // delete originalRequest.headers["Access-Token"]; // 이걸 지워서 기존 access token다시보냄.
        originalRequest.headers["Refresh-Token"] = `Bearer ${refreshToken}`;
        originalRequest.headers["Content-Type"] = "application/json";

        const response = await auth.api(originalRequest);
        console.log(response?.data);
        return response;
      } catch (refreshError) {
        alert("Error refreshing token:" + JSON.stringify(refreshError));
        localStorage.clear();
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      if (error.response.status >= 500) {
        console.error("API error:", error.message);
      } else if (error.response.status >= 400 && error.response.status < 500) {
        alert(
          "Authorization Error" +
            JSON.stringify(error.response?.data?.authResponse) ||
            "Unknown error"
        );
        localStorage.clear();
        window.location.reload();
        return Promise.reject(error);
      }
    }
  }
);
