import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import "../styles/MainContents.css";
import StatusFallComponent from "./StatusFallComponent";
import ApiClient, { api_method } from "../utils/ApiClient";
import API_timestamp from "../store/timestamps";
function MainContents(props) {
  const [loading, setLoading] = useState(false);
  const [alarmInfo, setAlarmInfo] = useState([]);
  const [timestamp, setTimestamp] = useState(0);
  const [timestampList, setTimestampList] = useState([]);
  const [timeArr, setTimeArr] = useState([]);
  const [dataArr, setDataArr] = useState([]);
  const [status, setStatus] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("day");
  const [TotalStatusData, setTotalStatusData] = useState([]);
  let [fall, setFall] = useState([]);
  let [stateArray, setStateArray] = useState([]);
  let [fallArray, setFallArray] = useState([]);
  let [exist, setExist] = useState([]);
  const [StartDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeArray, setTimeArray] = useState([60]);
  const token = sessionStorage.getItem("authorizeKey");
  const client = new ApiClient();
  const api_timestamp = new API_timestamp();

  //==============================================API REQUSET============================================================================ 
  // 로그인 기기 API
  const fetchDeviceData = async () => {
    try {
        const response = await client.RequestAsync(
            api_method.get, 
            "/api/config/device/info",
            null,
            null,
            token
        );
        const deviceData = response.data;

        const data = deviceData.map((device) => device.device_name);
        setStatus(data);
    } catch (error) {
        console.error(error);
    }
  };
  // 재실 상태 및 낙상 API
  const fetchStatusAndFallData = async () => {
    try {
      for (const deviceId of props.deviceId) {
        setStartDate(api_timestamp.oneHoursdate);
        setEndDate(api_timestamp.date);
        const response = await axios.get(
          `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${api_timestamp.oneHoursdate}&end_date=${api_timestamp.date}`,
          { headers: { Authorization: token } }
        );
        
        const data = response.data;
        console.log(data)


      }

    } catch (error) {
      console.error(error);
    }
  };
  // 재실 패턴 감지 일,주,월 버튼 요청 로직 API
  const fetchTimeTotalData = async () => {
    try {
      const arr = [];
      for (const deviceId of props.deviceId) {
        let startDate, endDate;
        let acqType = "H";
        if (currentPeriod === "day") {
          endDate = api_timestamp.endTime;
          startDate = api_timestamp.startTime1
          acqType = "E";
        } else if (currentPeriod === "week") {
          startDate = api_timestamp.getSevenDayAgo()
          endDate = api_timestamp.endTime;
        } else if (currentPeriod === "month") {
          startDate = api_timestamp.getOneMonthAgo()
          endDate = api_timestamp.endTime;          console.log(startDate, endDate)
        }
        const response = await axios.get(
          `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=${acqType}&start_date=${startDate}&end_date=${endDate}`,
          {
            headers: { Authorization: token },
          }
        );
        const data = response.data;

        arr.push(data);
      }
      setDataArr(arr);
    } catch (error) {
      console.error(error);
    }
  };
  // 최근 알람 함수 API
  const fetchRecentAlarmData = async () => {

    try {
        const response = await axios.get("http://api.hillntoe.com:7810/api/alarm/info", {
          headers: { Authorization: token },
        })

      if (response?.status === 200) {
        const alarmData = response.data;
        setAlarmInfo(alarmData.map((item) => item));
      } else {
        throw new Error(
          `Failed to fetch alarm info (${response?.status})`
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  //==============================================LOGIC============================================================================ 
  
  // 재실 패턴 일 주 월 버튼함수
  const handleButtonClick = (period) => {
    setCurrentPeriod(period);
  };

  //  알람 시간 데이터 파싱(timestamp => 날짜로 바꿔서 보여줌)
  const convertTimestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

    // 컴포넌트가 마운트 시 localStorage에서 데이터를 불러옴
  useEffect(() => {
    let storedExist = JSON.parse(localStorage.getItem("exist")) || [];
    let storedFall = JSON.parse(localStorage.getItem("fall")) || [];
    setExist(storedExist);
    setFall(storedFall);

    // ... (나머지 useEffect 코드)
  }, []);

  // 재실 및 낙상정보 폴링 호출
  useEffect(() => {
    // Initial call to fetchStatusAndFallData
    if (props.deviceId.length > 0) {
      fetchTimeTotalData();
      fetchStatusAndFallData();
    }
    const intervalId = setInterval(() => {
      fetchStatusAndFallData();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [props.deviceId, token]);

  // 로그인 상태 API 호출
  useEffect(() => {
    fetchDeviceData();
  }, []);


  // 연구 대상
  // let Lexist = JSON.parse(localStorage.getItem("exist")) || [];
  // let Lfall = JSON.parse(localStorage.getItem("fall")) || [];
  // let existData = Lexist.slice(-60).reverse() 
  // let fallData = Lfall.slice(-60).reverse()
  // console.log(Lfall)
  // console.log(fallData)
  // let sumFallExistData = 0;
  // for(let i =0; i < existData.length; i++){
  //   sumFallExistData += exist[i] + fallData[i]
  // }



  useEffect(() => {
    if (dataArr.length > 0 && dataArr.every(Array.isArray)) {
      const timestamps = dataArr.flatMap((deviceData) =>
        deviceData.map((value) => value.timestamp)
      );

      dataArr.map((value) =>
        value.map((value) => {
          if (value.datas.length == 9) {
            if (value.datas[6].data_value == 1) {
              // console.log(
              //   value.datas[6].data_value,
              //   value.device_id,
              //   value.timestamp
              // );
            }
          } else if (value.datas.length == 13) {
            // console.log(
            //   value.datas[0].data_value,
            //   value.device_id,
            //   value.timestamp
            // );
          }
        })
      );
      const uniqueTimestamps = Array.from(new Set(timestamps));
      setTotalStatusData(uniqueTimestamps);
    } else {
      // console.error("데이터 배열이 유효하지 않습니다.");
    }
  }, [dataArr]);


  const totalHours = Math.floor(TotalStatusData.length / 60);
  const remainingMinutes = TotalStatusData.length % 60;

  function hoursToDaysAndHours(hours) {
    let days = Math.floor(hours / 24);
    let remainingHours = hours % 24;
    return { days: days, hours: remainingHours };
  }
  
  let result = hoursToDaysAndHours(TotalStatusData.length);

  useEffect(() => {
    fetchTimeTotalData();
  }, [currentPeriod, token]);
  

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [currentPeriod]);

  useEffect(() => {
    fetchRecentAlarmData();
  }, [timestamp]);

  let chartCurrent;

  if (currentPeriod === "day") {
    let chart_day = 1440;
    chartCurrent = chart_day;
  } else if (currentPeriod === "week") {
    let chart_week = 168;
    chartCurrent = chart_week;
  } else if (currentPeriod === "month") {
    let chart_month = 720;
    chartCurrent = chart_month;
  }
  // TotalStatusData.length
  function determineBackgroundColor(percentage) {
    if (percentage == false) {
      return ["#0041b9", "#ededed"]; // 50%보다 높을 때 빨간색
    } else {
      return ["#ededed"]; // 그 외에는 파란색
    }
  }

  
  // 재실 그래프 두 사이의 시간
  function convertToMinutes(timeString) {
    const hours = parseInt(timeString.substring(0, 2));
    const minutes = parseInt(timeString.substring(2, 4));
    return hours * 60 + minutes;
  }

  function convertToTimeString(minutes) {
    const adjustedTime = minutes - 3;
    const hours = Math.floor(adjustedTime / 60);
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = (adjustedTime % 60).toString().padStart(2, "0");
    return `${paddedHours}시${paddedMinutes}분`;
  }

  function generateTimeArray(startTime, endTime) {
    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);
    const timeArray = [];

    for (let minutes = startMinutes; minutes <= endMinutes; minutes++) {
      timeArray.push(convertToTimeString(minutes));
    }

    return timeArray.reverse();
  }

  useEffect(() => {
    if (StartDate && endDate) {
      const startTime = StartDate.slice(8, 14);
      const endTime = endDate.slice(8, 14);
      const updatedTimeArray = generateTimeArray(startTime, endTime);
      setTimeArray(updatedTimeArray);
    }
  }, [StartDate, endDate]);

  const currentPercentage = (TotalStatusData.length / chartCurrent) * 100;
  const remainingPercentage =
    ((chartCurrent - TotalStatusData.length) / chartCurrent) * 100;
  const statusData = {
    labels: [],
    datasets: [
      {
        label: "test",
        data: [currentPercentage.toFixed(1), remainingPercentage.toFixed(1)],
        backgroundColor: determineBackgroundColor(loading),
        borderWidth: 0,
      },
    ],
  };
  // 재실 패턴 감지 옵션
  const option = {
    cutout: "70%",
    rotation: 0,
    circumference: 360,
    tooltips: { enabled: false },
    hover: { mode: null },
    legend: { display: false },
    maintainAspectRatio: true,
    responsive: true,
    plugins: {},
    layout: {
      padding: 0,
    },
  };
  // 재실 그래프 및 낙상정보 데이터
  let data = {
    labels: timeArray,
    datasets: [
      {
        label: "   재실",
        data: exist.slice(0,60),
        fill: true,
        borderColor: "#00a2e6",
        backgroundColor: "#d2f3fa",
        borderWidth: 2,
        yAxisID: "y1",
        stepped: true,
        order: 2,
      },
      {
        label: "   낙상         ",
        data: fall.slice(0,60),
        fill: true,
        type: "bar",
        borderColor: "#f77d2b",
        backgroundColor: "#f77d2b",
        borderWidth: 2,
        yAxisID: "y1",
        order: 1,
        categoryPercentage: 0.4,
      },
    ],
  };
  // 재실 그래프 및 낙상정보 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        reverse: true,
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          maxTicksLimit: 1,
          maxRotation: 0, // 라벨 최대 회전 각도를 0으로 설정
          minRotation: 0, // 라벨 최소 회전 각도를 0으로 설정
        },
      },

      y1: {
        beginAtZero: false,
        display: false,
        min: 0,
        max: 1.2, // 수정: BRArr 데이터의 최대값을 고려하여 적절한 값으로 변경
        position: "left",
        ticks: {
          callback: function (value) {
            return value;
          },
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#191919",
          boxHeight: 1,
          boxWidth: 25,
          font: {
            weight: "bold",
            size: 13.5,
          },
        },
      },
    },
    layout: {
      padding: {
        left: 14,
        right: 14,
        top: 5,
      },
    },
    elements: {
      bar: {
        barPercentage: 0.8, // 막대의 너비 비율 설정
        categoryPercentage: 0.8, // 막대 간격 비율 설정
      },
      point: {
        radius: false,
      },
    },
  };
  return (
    <div className="content-container">
      <div className="content-box">
        {/* 재실 패턴 감지 */}
        <div className="content-main" style={{ width: "498px" }}>
          <div className="header-container">
            재실 패턴 감지
            <span className="header-Btn-mg">
              <button
                onClick={() => {
                  setCurrentPeriod("day");
                  handleButtonClick("day");
                }}
                className={`header-Btn ${
                  currentPeriod === "day" ? "selected" : ""
                }`}
              >
                일
              </button>
              <button
                onClick={() => {
                  setCurrentPeriod("week");
                  handleButtonClick("week");
                }}
                className={`header-Btn ${
                  currentPeriod === "week" ? "selected" : ""
                }`}
              >
                주
              </button>
              <button
                onClick={() => {
                  setCurrentPeriod("month");
                  handleButtonClick("month");
                }}
                className={`header-Btn ${
                  currentPeriod === "month" ? "selected" : ""
                }`}
              >
                월
              </button>
            </span>
          </div>
          <div className="main-content1">
            <>
              {loading ? (
                <div className="content-loading">
                  데이터를 불러오고 있습니다···
                </div>
              ) : (
                <div className="status-content">
                  <span className="Total-Time">
                    {" "}
                    {currentPeriod === "day" ? (
                      <span style={{ display: "inline-block" }}>
                        TOTAL : {totalHours}시간 {remainingMinutes}분 재실
                      </span>
                    ) : currentPeriod === "week" ? (
                      <span style={{ display: "inline-block" }}>
                        TOTAL : {result.days}일 {result.hours}시간 재실
                      </span>
                    ) : currentPeriod === "month" ? (
                      <span style={{ display: "inline-block" }}>
                        TOTAL : {result.days}일 {result.hours}시간 재실
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                  <div
                    className="status-scroll"
                    style={{ height: "100px", overflowX: "auto" }}
                  >
                    {status.map((deviceId, index) => (
                      <div key={index} style={{ lineHeight: "2" }}>
                        {deviceId} :{" "}
                        {currentPeriod === "day"
                          ? dataArr[index]?.length
                            ? `${Math.floor(dataArr[index].length / 60)}시간 ${
                                dataArr[index].length % 60
                              }분 재실`
                            : "데이터 없음"
                          : currentPeriod === "week"
                          ? dataArr[index]?.length
                            ? `${Math.floor(dataArr[index].length / 24)}일 ${
                                dataArr.length % 24
                              }시간 재실`
                            : "데이터 없음"
                          : currentPeriod === "month"
                          ? dataArr[index]?.length
                            ? `${Math.floor(dataArr[index].length / 24)}일 ${
                                dataArr.length % 24
                              }시간 재실`
                            : "데이터 없음"
                          : ""}
                        <span> </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="main-chart">
                <Doughnut data={statusData} options={option} />
              </div>
            </>
          </div>
         
          {dataArr.length > 0 ? (
            <div className="status-Footer">
              {currentPeriod === "day"
                ? `현재 시각 ${new Date().toLocaleTimeString()} 기준 데이터 입니다`
                : currentPeriod === "week"
                ? `현재 날짜 ${new Date().toLocaleDateString()} 기준 데이터 입니다`
                : currentPeriod === "month"
                ? `현재 날짜 ${new Date().toLocaleDateString()} 기준 데이터 입니다`
                : ""}
            </div>
          ) : (
            ""
          )}
        </div>









        {/* <StatusFallComponent deviceId={props.deviceId}/> */}




















      {/* 재실 그래프 및 낙상정보 */}
        <div className={`content-main`} style={{ width: "498px" }}>
          <div className="header-container">재실 그래프 및 낙상정보</div>
          <div style={{ width: "400px", height: "320px", margin: "0 auto" }}>
            {/* {sumFallExistData == 0 ? <div style={{fontSize:'19px', width:'250px',height:'200px',margin:'0 auto', lineHeight:'250px', fontWeight:'500'}}>감지된 데이터가 없습니다</div> : <Line data={data} options={chartOptions} /> } */}
            <Line data={data} options={chartOptions} />
          </div>
        </div>


























          {/* 최근 알람 */}
        <div className="content-main">
          <div className="header-container">최근 알람</div>
          {alarmInfo.length > 0 ? (
            <div className="main-recent-alarm">
              {alarmInfo
                .map((alarm, index) => (
                  <div className="main-alarm" key={index}>
                    <span
                      style={{
                        margin: "0px 10px 0px 30px",
                        display: "inline-block",
                        width: "170px",
                        fontSize: "13.5px",
                      }}
                    >
                      [{convertTimestampToFormattedDate(alarm.alarm_timestamp)}]
                    </span>
                    <span style={{ marginRight: "20px" }}>{alarm.message}</span>
                  </div>
                ))
                .reverse()
                .slice(0, 6)}
            </div>
          ) : (
            <div
              className="main-recent-alarm"
              style={{ fontSize: "18px", fontWeight: 500, lineHeight: "230px" }}
            >
              감지된 알람이 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainContents;
