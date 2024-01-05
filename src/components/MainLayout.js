import { Layout, theme } from "antd";
import { Routes, Route, useNavigate, Link, useLocation  } from "react-router-dom";
import DateTimer from "./Pages/DateTimer";
import Noti from "./Pages/Noti";
import User from "./Pages/User";
import Dashboard from "./Pages/Dashboard";
import Setting from "./Pages/Setting";
import "./MainLayout.css";
import UserImg_gray from "../asset/User_gray.png";
import UserImg_white from "../asset/User_white.png";
import NotificationImg_gray from "../asset/Notification_gray.png";
import NotificationImg_white from "../asset/Notification_white.png";
import Dashboard_gray from "../asset/Dashborad_gray.png";
import Dashboard_white from "../asset/Dashboard_white.png";
import Logout from "../asset/Logout.png";
import mainLogo from "../asset/logo_pwc.png"
import { useState } from "react";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  // 클릭한 메뉴를 상태로 관리 
  const location = useLocation();
  const [clickBtn, setClickBtn] = useState(location.pathname);

  const navigate = useNavigate();

  // 테마에서 컨테이너의 배경 색상을 가져옴
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 로그아웃 처리 함수
  const handleLogout = () => {
    sessionStorage.removeItem("authorizeKey");
    window.location.href = "/";
  };

  // 메뉴를 클릭할 때의 처리 함수
  const handleMenuClick = (key) => {
    setClickBtn(key);
    navigate(key);
  };

  return (
    <Layout style={{width:'1920px'}}>
      {/* 상단 헤더 */}
      <Header
        className="d-flex justify-content-between align-items-center"
        style={{
          width: "100%",
          background: colorBgContainer,
          height: "74px",
          padding: "21px 0px 21px 15px",
        }}
      >
        {/* 로고 이미지 */}
        <img src={mainLogo} alt="mainlogo" style={{width:'80px'}}/>

        <div className="d-flex align-items-center">
          {/* 날짜 타이머 컴포넌트 */}
          <DateTimer />
        </div>
        {/* 로그아웃 버튼 */}
        <button className="logout-button" onClick={handleLogout}>
          <img src={Logout} alt="LogoutImage"></img>
          로그아웃
        </button>
      </Header>
      <Layout>
        {/* 좌측 사이드바 */}
        <Sider style={{ background: "#ffffff" }} width={250}>
          {/* 각 메뉴를 Link로 구성 */}
          <Link
            style={{ marginTop: "26px" }}
            className={`SideBtn ${clickBtn === "/" ? "selected" : ""}`}
            to="/"
            onClick={() => handleMenuClick("/")}
          >
            {/* Dashboard 메뉴 */}
            <img
              className="Menu_icon_image"
              src={clickBtn === "/" ? Dashboard_white : Dashboard_gray}
              alt=""
            />
            <span>DASHBOARD</span>
          </Link>
          <Link
            className={`SideBtn ${clickBtn === "/user" ? "selected" : ""}`}
            to="/user"
            onClick={() => handleMenuClick("/user")}
          >
            {/* User 메뉴 */}
            <img
              className="Menu_icon_image"
              src={clickBtn === "/user" ? UserImg_white : UserImg_gray}
              alt="UserImage"
            />
            <span>USER</span>
          </Link>
          <Link
            className={`SideBtn ${
              clickBtn === "/notification" ? "selected" : ""
            }`}
            to="/notification"
            onClick={() => handleMenuClick("/notification")}
          >
            {/* Notification 메뉴 */}
            <img
              className="Menu_icon_image"
              src={
                clickBtn === "/notification"
                  ? NotificationImg_white
                  : NotificationImg_gray
              }
              alt="NotificationImage"
            />
            <span>NOTIFICATION</span>
          </Link>

        </Sider>
        <Layout className="site-layout">
          {/* 메인 컨텐츠 */}
          <Content
            style={{
              width: "100%",
              height: "1006px",
              margin: "0 auto",
              background: "#f6fafd",
            }}
          >
            {/* React Router의 Routes와 Route를 이용한 라우팅 */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/user" element={<User />} />
              <Route path="/notification/*" element={<Noti />} />
              <Route path="/setting" element={<Setting />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
