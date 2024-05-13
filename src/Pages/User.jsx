import React, { useEffect, useState } from "react";
import "../styles/User.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ApiClient, { api_method } from "../utils/ApiClient";

function User() {
  const [userName, setUserName] = useState("");
  const [userName2, setUserName2] = useState("");
  const [userEmailAddress, setUserEmailAddress] = useState("");
  const [userEmailAddress2, setUserEmailAddress2] = useState("");
  const [userID, setUserID] = useState("");
  const [userID2, setUserID2] = useState("");
  const [passWord, setPassWord] = useState("");
  const [passWord2, setPassWord2] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [Image, setImage] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );
  const [smShow, setSmShow] = useState(false);

  const token = sessionStorage.getItem("authorizeKey");

  const userInfo = async () => {
    try {
      const response = await axios.get(
        "http://api.hillntoe.com:7810/api/account/info",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response?.status === 200) {
        const username = response.data.userName;
        const userEmail = response.data.mailAddress;
        const userid = response.data.userID;
        const phonenumber = response.data.phoneNumber;
        // 비밀번호를 가져오지 않도록 수정
        // const passWord = response.data.password;
        setUserName(username);
        setUserEmailAddress(userEmail);
        setUserID(userid);
        setPhoneNumber(phonenumber);
        // setPassWord(passWord);
      } else {
        throw new Error(`Failed to fetch device info(${response?.status})`);
      }
    } catch (error) {
      console.error("Error fetching device info:", error);
    }
  };


  

const handleChangeInfo = async () => {
  try {
    const data = {
      userID: userID,
      password: passWord2, 
      userName: userName2,
      mailAddress: userEmailAddress2,
      phoneNumber: phoneNumber2,
    };

    const client = new ApiClient();

    // Send a POST request using ApiClient
    const response = await client.RequestAsync(
      api_method.post,
      "/api/account/modify",
      null,
      JSON.stringify(data),
      token
    );

    if (response?.status === 200) {
      console.log("Info modified successfully.");
    } else {
      throw new Error(`Failed to fetch device info (${response})`);
    }
  } catch (error) {
    console.error("Error", error);
  }
};

  const handleWithdrawal = async () => {
    try {
      const data = {
        UserID: userID2,
        Password: passWord2,
      };

      const client = new ApiClient();
      const response = await client.RequestAsync(
        api_method.post,
        "/web/account/withdrawal",
        null,
        data,
        token
      );
      if (response?.status === 200) {
      } else {
        alert("회원을 탈퇴하였습니다");
      }
    } catch (error) {
      console.error(`에러: ${error}`);
    }
  };

  useEffect(() => {
    userInfo();
  }
  , []);


  return (
    <div className="User-Main">
      {/* w: 900px h:830px */}
      <div className="User-Content">
        {/* 내 프로필 */}
        <div className="User-Content-Profile">
          <div className="Profile-header">
            <span className="User-content-title">내 프로필</span>
          </div>
          <div className="Profile-body">
            <div className="Profile-body-UserIcon">
              <h1 className="userAccountIcon">
                <img
                  src={Image}
                  style={{ width: "100px" }}
                  alt="프로필 이미지"
                />
              </h1>
              <div className="userAccount-Name">안녕하세요 {userName}님</div>
              <div>{userEmailAddress}</div>
            </div>
            <div className="Profile-body-UserInfo">
              <div className="body-userInfo">
                <span style={{ marginRight: "136px" }}>이름</span>
                <span>{userName}</span>
              </div>
              <hr />
              <div className="body-userInfo">
                <span style={{ marginRight: "116px" }}>아이디</span>
                <span>{userID}</span>
              </div>
              <hr />
              <div className="body-userInfo">
                <span style={{ marginRight: "116px" }}>이메일</span>
                <span>{userEmailAddress}</span>
              </div>
              <hr />
              <div className="body-userInfo">
                <span style={{ marginRight: "116px" }}>휴대폰</span>
                <span>01096868946</span>
              </div>
            </div>
          </div>
        </div>

        {/* 회원 정보 수정 */}
        <div className="User-Content-Modify">
          <div className="Modify-header">
            <span className="User-content-title">회원 정보 수정</span>
          </div>

          <div className="Modify-Member">
            <div className="UserName-Modify">
              <span>이름</span>
              <input
                type="text"
                className="Modify-input"
                style={{ marginLeft: "159px" }}
                placeholder="이름을 입력하세요"
                value={userID2}
                onChange={(e) => {
                  setUserID2(e.target.value);
                }}
              />
              <button onClick={handleChangeInfo}>이름 변경</button>
            </div>
            <div className="UserName-Modify">
              <span>이메일</span>
              <input
                type="text"
                className="Modify-input"
                style={{ marginLeft: "145px" }}
                placeholder="이메일을 입력하세요"
                value={userEmailAddress2}
                onChange={(e) => {
                  setUserEmailAddress2(e.target.value);
                }}
              />
              <button onClick={handleChangeInfo}>이메일 변경</button>
            </div>
            <div className="UserName-Modify">
              <span>휴대폰</span>
              <input
                type="text"
                className="Modify-input"
                style={{ marginLeft: "145px" }}
                placeholder="휴대폰 번호를 입력하세요"
                value={phoneNumber2}
                onChange={(e) => setPhoneNumber2(e.target.value)}
              />
              <button onClick={handleChangeInfo}>휴대폰 번호 변경</button>
            </div>
            <div className="UserName-Modify">
              <span>비밀번호</span>
              <input
                type="password"
                className="Modify-input"
                style={{ marginLeft: "131px" }}
                placeholder="비밀번호를 입력하세요"
                value={passWord2}
                onChange={(e) => {
                  setPassWord2(e.target.value);
                }}
              />
              <button>비밀번호 변경</button>
            </div>
            <div className="UserName-Modify">
              <span>새 비밀번호</span>
              <input
                type="password"
                className="Modify-input"
                style={{ marginLeft: "113px" }}
                placeholder="새로운 비밀번호를 입력하세요"
              />
            </div>
            <div className="UserName-Modify">
              <span>새 비밀번호 확인</span>
              <input
                type="password"
                className="Modify-input"
                style={{ marginLeft: "76px" }}
                placeholder="새로운 비밀번호를 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="account-Withdrawal">
        탈퇴를 원하시면 우측의 회원탈퇴 버튼을 눌러주세요
        <button
          onClick={() => {
            setSmShow(true);
          }}
          className="me-2"
        >
          회원탈퇴
        </button>
      </div>

      {/* 회원탈퇴 모달 창 */}

      <Modal size="sm" show={smShow} onHide={() => setSmShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>회원 탈퇴</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>사용자 아이디</label>
            <input
              type="text"
              value={userID2}
              onChange={(e) => setUserID2(e.target.value)} // 사용자 아이디 입력
            />
          </div>
          <div>
            <label>비밀번호</label>
            <input
              type="password"
              value={passWord2}
              onChange={(e) => setPassWord2(e.target.value)} // 비밀번호 입력
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSmShow(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleWithdrawal}>
            회원 탈퇴
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default User;
