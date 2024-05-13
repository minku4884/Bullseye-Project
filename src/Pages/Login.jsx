import React, { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import ApiClient, { api_method } from "../utils/ApiClient";
import MainLayout from "../routes/MainLayout";
import Modal from "react-bootstrap/Modal";
import { useNavigate, Routes, Route } from "react-router-dom";
import mainlogo from "../asset/img/logo_pwc.png";
import axios from "axios";

const Login = () => {
  const storedToken = sessionStorage.getItem("authorizeKey");
  const [isRemember, setIsRemember] = useState(false); //ID Remember
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(storedToken !== null);
  const [loginError, setLoginError] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    setShow(false);
    navigate("/");
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (storedToken !== null) {
      checkAuthToken(storedToken);
    }
  }, []);

  const checkAuthToken = async (token) => {
    const client = new ApiClient();
    const response = await client.RequestAsync(
      api_method.get,
      "/api/account/info",
      null,
      null,
      token
    );
    if (response?.status === 200) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
      sessionStorage.removeItem("authorizeKey");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        Id: username,
        Password: password,
      };

      const client = new ApiClient();
      const response = await client.RequestAsync(
        api_method.post,
        "/web/login",
        null,
        data
      );

      if (response?.status === 200) {
        const token = "Bearer " + response.data;
        sessionStorage.setItem("authorizeKey", token);
        setLoggedIn(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    } catch (error) {
      console.error(`에러: ${error}`);
    }
  };

  if (loggedIn) {
    return <MainLayout />;
  }

  return (
    <div className="login-container">
      <Modal show={show} onHide={handleClose}>
        <Modal.Header
          style={{
            backgroundColor: "#fff",
            height: "70px",
            borderBottom: "1px solid #0041b9",
          }}
        >
          <div style={{ width: "50%", height: "100%", paddingTop: "20px" }}>
            <Link to="/findId" className="find findid">
              아이디 찾기
            </Link>
          </div>
          <div style={{ width: "52%", height: "100%", paddingTop: "20px" }}>
            <Link to="/findPw" className="find findpw">
              비밀번호 찾기
            </Link>
          </div>
        </Modal.Header>
        <Routes>
          <Route
            exact
            path="/findId"
            element={<FindID handleClose={handleClose} />}
          />
          <Route
            exact
            path="/findPw"
            element={<FindPW handleClose={handleClose} />}
          />
        </Routes>
      </Modal>
      <img className="hillntoe-symbol" src={mainlogo} />
      <div className="logo-container">
        <div
          className="hillntoe-Info"
          style={{ fontSize: "30px", fontWeight: "bold" }}
        >
          통합 모니터링 SW
        </div>
        <p className="logo-text">
          최고 수준의 레이다 기술력을 보유하며 IoT, 인공지능,
          <br />
          네트워크 기술을 결합한 레이다 솔루션을 제공합니다.
        </p>
      </div>
      <h2 className="Login_title">로그인</h2>
      <div className="login-form-container">
        <div className="login-box">
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div className="check_label">
              <input type="checkbox" />
              <label htmlFor="idSaveCheckbox" className="checkbox-label">
                아이디 저장
              </label>
            </div>
            <button
              type="button"
              className="search_btn"
              onClick={() => {
                navigate("/findid");
                handleShow();
              }}
            >
              아이디·비밀번호 찾기
            </button>
            <button type="submit" className="login_btn">
              로그인
            </button>
          </form>
          <button type="button" className="signin_btn">
            <Link
              to="signup"
              style={{
                color: "#0041b9",
                textDecoration: "none",
                width: "100%",
                display: "block",
              }}
            >
              회원가입
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

function FindID(props) {
  const [mailAddress, setMailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundId, setFoundId] = useState(""); // 아이디를 표시하기 위한 상태

  const navigate = useNavigate();

  const handleFindIdSubmit = () => {
    // 이 함수가 실행될 때 서버에 아이디 찾기 요청을 보냅니다.
    // 이때 입력된 이메일 주소와 휴대폰 번호를 사용합니다.
    axios
      .post("http://192.168.0.78:7810/api/account/find/id", {
        mailAddress: mailAddress,
        phoneNumber: phoneNumber,
      })
      .then((response) => {
        if (response.status === 200) {
          const foundUsername = response.data;
          setFoundId(foundUsername);
        } else {
          setFoundId("아이디를 찾을 수 없습니다.");
        }
      })
      .catch((error) => {
        setFoundId("아이디를 찾을 수 없습니다.");
      });
  };

  return (
    <div className="Login-Find-Modal">
      {foundId ? (
        <div>
          <div className="foundIDbox">
            <div className="foundIDContent">
              고객님의 정보와 일치하는 아이디입니다.
            </div>
            <div className="foundID">{foundId}</div>
          </div>
          <div className="foundBtn_zip">
            <button className="foundBtn1" onClick={props.handleClose}>
              확인
            </button>
            <button
              className="foundBtn2"
              onClick={() => {
                navigate("/findpw");
              }}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="find-id-title">이메일</div>
          <input
            className="find-id-input"
            type="email"
            value={mailAddress}
            onChange={(e) => setMailAddress(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
          />
          <div style={{ marginTop: "30px" }} className="find-id-title">
            휴대폰
          </div>
          <input
            className="find-id-input"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="휴대폰 번호를 입력하세요"
          />
          <button
            className="find-id-Btn"
            style={{ marginTop: "84px" }}
            onClick={handleFindIdSubmit}
          >
            아이디 찾기
          </button>
        </>
      )}
    </div>
  );
}

function FindPW(props) {
  const navigate = useNavigate();

  const [userID, setUserID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mailAddress, setMailAddress] = useState("");
  const [foundPw, setFoundPw] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false); // 버튼 클릭 여부를 관리하는 상태


  const handleFindPwSubmit = () => {
    if (!buttonClicked) {
      // 버튼이 클릭되지 않은 상태일 때만 실행
      setButtonClicked(true); // 버튼 클릭 상태로 변경
      axios
        .post("http://192.168.0.78:7810/api/account/find/password", {
          userID: userID,
          phoneNumber: phoneNumber,
          mailAddress: mailAddress,
        })
        .then((response) => {
          if (response.status === 200) {
            setFoundPw(`${mailAddress}, 이메일로 전송이 되었습니다`);
          } else {
            setFoundPw("비밀번호를 찾을 수 없습니다");
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            setFoundPw("비밀번호를 찾을 수 없습니다");
          } else {
            setFoundPw("오류가 발생했습니다. 나중에 다시 시도해주세요");
          }
        });
    }
  };

  return (
    <div className="Login-Find-Modal">
      {foundPw ? (
        <div>
          <div className="foundIDbox">
            <div className="foundIDContent">
              고객님의 이메일 {mailAddress} 로 <br />
              임시 비밀번호를 발급하였습니다.
            </div>
          </div>
          <div className="foundBtn_zip">
            <button className="foundBtn3" onClick={props.handleClose}>
              확인
            </button>
            <button
              className="foundBtn4"
              onClick={() => {
                navigate("/modify");
              }}
            >
              비밀번호 재설정
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="find-id-title">아이디</div>
            <input
              className="find-id-input"
              type="text"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div>
            <div className="find-id-title">이메일</div>
            <input
              className="find-id-input"
              type="email"
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
            />
          </div>
          <div>
            <div className="find-id-title">휴대폰</div>
            <input
              className="find-id-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="휴대폰 번호를 입력하세요"
            />
          </div>
          <button className="find-id-Btn" onClick={handleFindPwSubmit}>
            비밀번호 찾기
          </button>
        </>
      )}
    </div>
  );
}

export default Login;
