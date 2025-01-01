// public modules
import React from "react";
import { AxiosError } from "axios";

// custom
import { auth } from "../auth";
import { staticData } from "../staticData";

// type
interface TestButtonProps {
  onClick: () => void;
  title: string;
  description: string;
}

// simple components
const TestButton: React.FC<TestButtonProps> = ({
  onClick,
  title,
  description,
}) => (
  <div className="row border shadow">
    <button className="test_btn btn btn-primary" onClick={onClick}>
      TEST
    </button>
    <div className="test_description">
      <h6 className="test_ds_title">{title}</h6>
      <p className="test_ds_detail">{description}</p>
    </div>
  </div>
);

const TestZone: React.FC = () => {
  // funcs
  const test_funcs = {
    test_front_env: () => {
      const dog: string | undefined = process.env.REACT_APP_DOG;
      alert(dog ? dog : "Dog environment variable is not set.");
    },
    test_front_env_api_gw_ep: () => {
      alert(
        staticData.endpoint
          ? "available to read endpoint."
          : "API Gateway endpoint environment variable is not set."
      );
    },
    test_connect_to_lambda: () => {
      if (staticData.endpoint) {
        fetch(`${staticData.endpoint}/test?request=connectLambda`)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then((data) => alert(data.message))
          .catch((error) =>
            alert("Error connecting to Lambda: " + JSON.stringify(error))
          );
      }
    },
    test_read_server_env: () => {
      if (staticData.endpoint) {
        fetch(`${staticData.endpoint}/test?request=readServerEnv`)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then((data) => alert(data.message))
          .catch((error) =>
            alert("Error reading server env: " + JSON.stringify(error))
          );
      }
    },
    test_connect_to_db: () => {
      if (staticData.endpoint) {
        fetch(`${staticData.endpoint}/test?request=connectDb`)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then((data) => alert(data.collections))
          .catch((error) =>
            alert("Error connecting to DB: " + JSON.stringify(error))
          );
      }
    },
    test_oauth_middle_ware: async () => {
      if (staticData.endpoint) {
        try {
          const response = await auth.api.get(
            `${staticData.endpoint}/test?request=testAuthFlow`
          );

          alert(JSON.stringify(response?.data));
        } catch (error) {
          const axiosError = error as AxiosError;
          alert(
            "Error connecting to oauthMiddleware: " +
              JSON.stringify(axiosError.response?.data || axiosError.message)
          );
        }
      }
    },
  };

  return (
    <div className="test_zone_container border shadow">
      <h2 className="text-center mb-4">Infra Test Zone</h2>
      <div className="test_zone_div">
        <TestButton
          onClick={test_funcs.test_front_env}
          title="S3 환경변수 읽기 test"
          description="frontend repository의 git action secret에 등록한 REACT_APP_DOG환경변수 값이 뜨면 성공!"
        />
        <TestButton
          onClick={test_funcs.test_front_env_api_gw_ep}
          title="S3환경변수 endpoint 읽기 test"
          description="'available to read endpoint'가 출력되면 성공!"
        />
        <TestButton
          onClick={test_funcs.test_connect_to_lambda}
          title="Lambda 통신 test"
          description="Test 람다랑 통신 테스트 / 'Hello test from test lambda'가 뜨면 성공!"
        />
        <TestButton
          onClick={test_funcs.test_read_server_env}
          title="백단 환경변수 test"
          description="백단 환경변수 test / we can read server env뜨면 성공!"
        />
        <TestButton
          onClick={test_funcs.test_connect_to_db}
          title="DB 통신 test"
          description="Test DB 통신 테스트 / 컬렉션 리스트가 보이면 성공!"
        />{" "}
        <TestButton
          onClick={test_funcs.test_oauth_middle_ware}
          title="인증 미들웨어 테스트"
          description="인증 미들웨어 테스트 / testdata가 보이면 성공!"
        />
      </div>
    </div>
  );
};

export default TestZone;
