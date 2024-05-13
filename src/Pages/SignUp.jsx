import React, { useState } from "react";
import ApiClient, { api_method } from "../utils/ApiClient";
import "../styles/SignUp.css";
import { useNavigate,Routes,Route,Link } from "react-router-dom";
const SignUp = () => {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 필드 추가
  const [userName, setUserName] = useState("");
  const [mailAddress, setMailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessages, setErrorMessages] = useState({}); // 에러 메시지들을 저장할 상태 추가

  const naviage = useNavigate()

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    const newErrorMessages = {};

    if (!userID) {
      newErrorMessages.userID = "아이디를 입력해주세요.";
    }

    if (!password) {
      newErrorMessages.password = "비밀번호를 입력해주세요.";
    }

    if (password !== confirmPassword) {
      newErrorMessages.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 나머지 유효성 검사 로직 추가

    setErrorMessages(newErrorMessages);
    if (Object.keys(newErrorMessages).length === 0) {
      try {
        const data = {
          UserID: userID,
          Password: password,
          UserName: userName,
          MailAddress: mailAddress,
          PhoneNumber: phoneNumber,
          Right:0,
          isEnable:0
        };
        const client = new ApiClient();
        const response = await client.RequestAsync(
          api_method.post,
          "/web/account/signup",
          null,
          data
        );

        if (response?.status === 200) {
          console.log("회원가입 성공!");
          alert("회원가입 성공");
          setUserID("");
          setPassword("");
          setConfirmPassword(""); // 비밀번호 확인 필드 초기화 추가
          setUserName("");
          setMailAddress("");
          setPhoneNumber("");
        } else {
          console.error("회원가입 실패");
          alert("회원가입 실패");
        }
      } catch (error) {
        console.error(`에러: ${error}`);
      }
    }
  };

  return (
    <div className="Signup-container">
      <div className="Signup-Header-container">
      </div>
      <div className="Signup-Main-container">
        <span className="Signup-title">회원가입</span>
        <form className="Signup-form-input" onSubmit={handleSignUpSubmit}>
          <div></div>
          <div className="input-title-1">
            <div className="title-title">아이디</div>
            <input
              type="text"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              placeholder="아이디를 입력해주세요"
              className="Signup-input"
            />
          </div>
          <div className="input-title">
            <div className="title-title">비밀번호</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="Signup-input"
            />
          </div>
          <div className="input-title">
            <div className="title-title">비밀번호 확인</div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 한번 더 입력해주세요"
              className="Signup-input"
            />
            <div className="error-message">{errorMessages.confirmPassword}</div>
          </div>
          <div className="input-title">
            <div>이름</div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="Signup-input"
            />
          </div>
          <div className="input-title">
            <div className="title-title">이메일</div>
            <input
              type="email"
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              placeholder="이메일 주소를 입력해주세요"
              className="Signup-input"
            />
          </div>
          <div className="input-title">
            <div className="title-title">휴대폰</div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="숫자만 입력해주세요"
              className="Signup-input"
            />
          </div>
          <div className="input-title">
            <button type="submit" className="Signup-Btn">
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
