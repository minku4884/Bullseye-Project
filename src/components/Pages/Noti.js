import { useEffect, useState } from "react";
import axios from "axios";
import LeftImage from "/HillnToe/hillntoe/src/asset/leftImg.png";
import RightImage from "/HillnToe/hillntoe/src/asset/rightImg.png";
import "./Noti.css";

function Noti() {
  const [userName, setUserName] = useState("");
  const [alarmInfo, setAlarmInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSortOption, setSelectedSortOption] = useState("최신순");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSearchByDate, setIsSearchByDate] = useState(false);

  const token = sessionStorage.getItem("authorizeKey");

  const accountInfo = async () => {
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
        const nameData = response.data;
        setUserName(nameData.userName);
      } else {
        throw new Error(`Failed to fetch device info (${response?.status})`);
      }
    } catch (error) {
      console.error("Error fetching device info:", error);
    }
  };
  accountInfo();

  const convertTimestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour:  "numeric",
      minute: "numeric",
    };
    const formattedDate = date.toLocaleString(undefined, options);
    return formattedDate;
  };
  const fetchData = async () => {
    try {
      const alarmInfoResponse = await axios.get(
        "http://api.hillntoe.com:7810/api/alarm/info",
        {
          headers: { Authorization: token },
        }
      );

      if (alarmInfoResponse?.status === 200) {
        const alarmData = alarmInfoResponse.data;
        setAlarmInfo(alarmData.map((item) => item));
      } else {
        throw new Error(
          `Failed to fetch alarm info (${alarmInfoResponse?.status})`
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handlesearchAlarm = async () => {
    try {
      const response = await axios.get(
        `http://api.hillntoe.com:7810/api/alarm/section?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response?.status === 200) {
        const alarmData = response.data;
        setAlarmInfo(alarmData);
      } else {
        throw new Error(`Failed to fetch alarm info (${response?.status})`);
      }
    } catch (error) {
      console.error("Error fetching alarm info:", error);
    }
  };

  // 알람을 최신순 또는 오래된 순으로 정렬하는 함수
  const sortAlarms = () => {
    if (selectedSortOption === "최신순") {
      return alarmInfo.slice().reverse(); // 최신순일 때는 배열을 뒤집음
    } else {
      return [...alarmInfo]; // 오래된 순일 때는 원래 배열 그대로 사용
    }
  };
  const handleSearchTypeChange = (searchType) => {
    setIsSearchByDate(searchType === "알람 기간 검색");
    if (searchType === "알람 전체 조회") {
      setStartDate("")
      setEndDate("")
      fetchData();
    }
  };

  //paging system
  const alarmsPerPage =7;
  const indexOfLastAlarm = currentPage * alarmsPerPage;
  const indexOfFirstAlarm = indexOfLastAlarm - alarmsPerPage;
  const totalPages = Math.ceil(alarmInfo.length / alarmsPerPage);
  const currentAlarms = sortAlarms().slice(indexOfFirstAlarm, indexOfLastAlarm);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  return (
    <div>
      <div className="notification-header">
        <div className="notification-header-title">
          <div style={{ fontSize: "28px", fontWeight: 500 }}>
            {userName}님, 환영합니다
          </div>
          <div style={{ fontSize: "20px" }}>
            NOTIFICATION 페이지에서 장치 신호 알람을 확인하고 관리하세요
          </div>
        </div>
      </div>

      <div className="notification-Category">
        <div className="notification-Category-Btn">
          <button
            onClick={() => handleSearchTypeChange("알람 전체 조회")}
            className={isSearchByDate ? "active" : ""}
          >
            알람 전체 조회
          </button>
          <button
            onClick={() => handleSearchTypeChange("알람 기간 검색")}
            className={!isSearchByDate ? "active" : ""}
          >
            알람 기간 검색
          </button>
        </div>

        <div
          className="notification-search"
          style={{ opacity: isSearchByDate ? 1 : 0.5 }}
        >
          <span style={{ margin: "0px 19px 0px 15px" }}>검색기간</span>
          <input
            type="text"
            value={startDate}
            disabled={!isSearchByDate}
            placeholder="ex)YYYYMMDDHHmm"
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
          />
          <span style={{ margin: "0px 7px" }}>~</span>
          <input
            type="text"
            value={endDate}
            disabled={!isSearchByDate}
            placeholder="ex)YYYYMMDDHHmm"
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
          />
          <button
            className="notification-search-Btn"
            onClick={handlesearchAlarm}
            disabled={!isSearchByDate}
          >
            검색
          </button>
        </div>
        <div></div>
      </div>
      <div className="notification-content">
        <span className="notification-Alarm-Count">
          전체알람 {alarmInfo.length}건
        </span>
        <select
          className="notification-DropDown"
          name="shop__selector"
          id="shop__selector"
          value={selectedSortOption}
          onChange={(e) => setSelectedSortOption(e.target.value)}
        >
          <option value="최신순">최신순</option>
          <option value="오래된순">오래된순</option>
        </select>
      </div>
      <div>
      <div style={{height:'600px'}}>
        <table className="alarm-table">
          <thead>
            <tr>
              <th
                style={{
                  width: "8%",
                  backgroundColor: "#fff",
                  borderColor: "#ededed",
                  borderRight: "1px solid #fff",
                  borderBottom: "1px solid #191919",
                }}
              >
                No.
              </th>
              <th
                style={{
                  width: "15%",
                  backgroundColor: "#fff",
                  borderColor: "#ededed",
                  borderRight: "1px solid #fff",
                  borderBottom: "1px solid #191919",
                }}
              >
                알람 생성일
              </th>
              <th
                style={{
                  width: "35%",
                  backgroundColor: "#fff",
                  borderColor: "#ededed",
                  borderRight: "1px solid #fff",
                  borderBottom: "1px solid #191919",
                }}
              >
                상세 알람 정보	
              </th>
              <th
                style={{
                  width: "20%",
                  backgroundColor: "#fff",
                  borderColor: "#ededed",
                  borderRight: "1px solid #fff",
                  borderBottom: "1px solid #191919",
                }}
              >
                알람 유형
              </th>
              <th
                style={{
                  width: "11%",
                  backgroundColor: "#fff",
                  borderColor: "#ededed",
                  borderRight: "1px solid #fff",
                  borderBottom: "1px solid #191919",
                }}
              >
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            {currentAlarms.map((value, index) => (
              <tr className="table-list" key={index}>
                <td
                  style={{
                    width: "8%",
                    borderColor: "#ededed",
                    borderRight: "1px solid #fff",
                  }}
                >
                  {(currentPage - 1) * alarmsPerPage + index + 1}
                </td>
                <td
                  style={{
                    width: "15%",
                    borderColor: "#ededed",
                    borderRight: "1px solid #fff",
                  }}
                >
                  {convertTimestampToFormattedDate(value.alarm_timestamp)}
                </td>
                <td
                  style={{
                    width: "35%",
                    borderColor: "#ededed",
                    borderRight: "1px solid #fff",
                  }}
                >
                  {value.message}
                </td>
                <td
                  style={{
                    width: "20%",
                    borderColor: "#ededed",
                    borderRight: "1px solid #fff",
                  }}
                >
                  {value.alarm_type === 9001
                    ? "공지사항"
                    : value.alarm_type === 9002
                    ? "시스템 알람"
                    : value.alarm_type === 9011
                    ? "조건 알람"
                    : value.alarm_type === 9021
                    ? "장치 소유 권한 요청 알림"
                    : value.alarm_type === 9901
                    ? "데이터 알림"
                    : value.alarm_type === 9902
                    ? "시간 알림"
                    : null}
                </td>
                <td
                  style={{
                    width: "11%",
                    borderColor: "#ededed",
                    borderRight: "1px solid #fff",
                  }}
                >
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/* 페이징 처리 */}
        <div className="paging-content">
          <button
            style={{ border: "none", backgroundColor: "#F6FAFD" }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <img src={LeftImage} alt="page-left" />
          </button>
          {pageNumbers.map((number) => (
            <button
              style={{
                backgroundColor: "none",
                color: "#999",
                border: "none",
                backgroundColor: "#F6FAFD",
              }}
              key={number}
              onClick={() => setCurrentPage(number)}
              className={currentPage === number ? "active" : ""}
            >
              {number}
            </button>
          ))}
          <button
            style={{ border: "none", backgroundColor: "#F6FAFD" }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={indexOfLastAlarm >= alarmInfo.length}
          >
            <img src={RightImage} alt="page-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Noti;
