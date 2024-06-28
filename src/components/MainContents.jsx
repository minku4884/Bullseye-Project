import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import "../styles/MainContents.css";
import StatusFallComponent from "./StatusFallComponent";
import ApiClient, { api_method } from "../utils/ApiClient";
import API_timestamp from "../store/timestamps";
import { useQuery } from "react-query";
import LoadingCircle from "../asset/img/LoadingCircle.gif"
function MainContents(props) {
  const client = new ApiClient();
  const api_timestamp = new API_timestamp();
  const [loading, setLoading] = useState(false);
  const [alarmInfo, setAlarmInfo] = useState([]);
  const [dataArr, setDataArr] = useState([]);
  const [status, setStatus] = useState([]);
  const [SGraphData, setSGraphData] = useState([]);
  const [FGraphData, setFGraphData] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("day");
  const [TotalStatusData, setTotalStatusData] = useState([]);
  let [fall, setFall] = useState([]);
  let [exist, setExist] = useState([]);
  let _ = require('lodash');
  const token = sessionStorage.getItem("authorizeKey");

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
      let today = new Date();
      let year = today.getFullYear();
      let month = (today.getMonth() + 1).toString().padStart(2, "0");
      let day = today.getDate().toString().padStart(2, "0");
      let hours = today.getHours().toString().padStart(2, "0");
      let oneHours = (today.getHours() - 1).toString().padStart(2, "0");
      let minutes = today.getMinutes().toString().padStart(2, "0");
      let timeform = `${year}${month}${day}${hours}${minutes}`;
      let oneAgotimeform = `${year}${month}${day}${oneHours}${minutes}`;

      // 모든 장치의 데이터를 병렬로 가져오기
      const statuspromises = props.deviceId.map((deviceId) =>
        axios
          .get(
            `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${oneAgotimeform}&end_date=${timeform}`,
            { headers: { Authorization: token } }
          )
          .then((response) =>
            response.data.map((value) =>
              value.datas.length == 9
                ? value.datas[6].max_value
                : value.datas.length == 13
                ? value.datas[0].max_value
                : 0
            )
          )
          .catch((error) => {
            console.error(`Error fetching data for device ${deviceId}:`, error);
            return [];
          })
      );

      const fallpromises = props.deviceId.map((deviceId) =>
        axios
          .get(
            `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${oneAgotimeform}&end_date=${timeform}`,
            { headers: { Authorization: token } }
          )
          .then((response) =>
            response.data.map((value) =>
              value.datas.length == 9
                ? value.datas[8].max_value
                : value.datas.length == 13
                ? value.datas[4].max_value
                : 0
            )
          )
          .catch((error) => {
            console.error(`Error fetching data for device ${deviceId}:`, error);
            return [];
          })
      );

      // 모든 요청이 완료될 때까지 기다림
      const statusresult = await Promise.all(statuspromises);
      const fallresult = await Promise.all(fallpromises);

      setSGraphData(statusresult);
      setFGraphData(fallresult);

      // 결과 배열로 설정
    } catch (error) {
      console.error("Error fetching status and fall data:", error);
    }
  };

  // const fetchStatusAndFallData2 = async () => {
  //   try {
  //     let today = new Date();
  //     let year = today.getFullYear();
  //     let month = (today.getMonth() + 1).toString().padStart(2, "0");
  //     let day = today.getDate().toString().padStart(2, "0");
  //     let hours = today.getHours().toString().padStart(2, "0");
  //     let oneHours = (today.getHours() - 1).toString().padStart(2, "0");
  //     let minutes = today.getMinutes().toString().padStart(2, "0");
  //     let timeform = `${year}${month}${day}${hours}${minutes}`;
  //     let oneAgotimeform = `${year}${month}${day}${oneHours}${minutes}`;

  //     // 모든 장치의 데이터를 병렬로 가져오기
  //     const statuspromises = props.deviceId.map((deviceId) =>
  //       axios
  //         .get(
  //           `http://api.hillntoe.com:7810/api/acqdata/count?device_id=${deviceId}&acq_type=E&count=1`,
  //           { headers: { Authorization: token } }
  //         )
  //         .then((response) =>
  //           response.data.map((value) =>
  //             value.datas.length == 9
  //               ? value.datas[6].max_value
  //               : value.datas.length == 13
  //               ? value.datas[0].max_value
  //               : 0
  //           )
  //         )
  //         .catch((error) => {
  //           console.error(`Error fetching data for device ${deviceId}:`, error);
  //           return [];
  //         })
  //     );

  //     const fallpromises = props.deviceId.map((deviceId) =>
  //       axios
  //         .get(
  //           `http://api.hillntoe.com:7810/api/acqdata/count?device_id=${deviceId}&acq_type=E&count=1`,
  //           { headers: { Authorization: token } }
  //         )
  //         .then((response) =>
  //           response.data.map((value) =>
  //             value.datas.length == 9
  //               ? value.datas[8].max_value
  //               : value.datas.length == 13
  //               ? value.datas[4].max_value
  //               : 0
  //           )
  //         )
  //         .catch((error) => {
  //           console.error(`Error fetching data for device ${deviceId}:`, error);
  //           return [];
  //         })
  //     );

  //     const statusresult = await Promise.all(statuspromises);
  //     const fallresult = await Promise.all(fallpromises);
      
      
  //     // 배열에 하나라도 1이 있는지 확인
  //     const checkForOne = (array) => array.some(subArray => subArray.includes(1));
      
  //     // 각각의 결과에서 하나라도 1이 있는지 확인 후 1 또는 0 반환
  //     const Sresult = checkForOne(statusresult) ? 1 : 0;
  //     const Fresult = checkForOne(fallresult) ? 1 : 0;
      
  //     console.log(statusresult)
  //     console.log(Sresult);
  //     console.log(Fresult);

  //     // 결과 배열로 설정
  //   } catch (error) {
  //     console.error("Error fetching status and fall data:", error);
  //   }
  // };

  useEffect(() => {
    // SGraphData 배열의 각 요소의 최대 길이를 찾습니다.
    const maxLengthSGraphData = Math.max(
      ...SGraphData.map((arr) => arr.length)
    );
    // FGraphData 배열의 각 요소의 최대 길이를 찾습니다.
    const maxLengthFGraphData = Math.max(
      ...FGraphData.map((arr) => arr.length)
    );

    // 배열을 최대 길이에 맞추어 0으로 채우는 함수를 정의합니다.
    const padArray = (arr, length) => [
      ...arr,
      ...Array(length - arr.length).fill(0),
    ];

    // SGraphData를 합치는 배열을 생성합니다.
    let combinedArrSGraphData = [];
    for (let i = 0; i < SGraphData.length; i++) {
      const paddedSGraphData = padArray(SGraphData[i], maxLengthSGraphData);
      for (let j = 0; j < paddedSGraphData.length; j++) {
        if (!combinedArrSGraphData[j]) {
          combinedArrSGraphData[j] = 0;
        }
        if (paddedSGraphData[j] === 1) {
          combinedArrSGraphData[j] = 1;
        }
      }
    }

    // FGraphData를 합치는 배열을 생성합니다.
    let combinedArrFGraphData = [];
    for (let i = 0; i < FGraphData.length; i++) {
      const paddedFGraphData = padArray(FGraphData[i], maxLengthFGraphData);
      for (let j = 0; j < paddedFGraphData.length; j++) {
        if (!combinedArrFGraphData[j]) {
          combinedArrFGraphData[j] = 0;
        }
        if (paddedFGraphData[j] === 1) {
          combinedArrFGraphData[j] = 1;
        }
      }
    }

    // console.log(combinedArrSGraphData); // SGraphData 합쳐진 배열 로그
    // console.log(combinedArrFGraphData); // FGraphData 합쳐진 배열 로그
    setExist(combinedArrSGraphData);
    setFall(combinedArrFGraphData);
    // 필요한 경우 combinedArr을 상태로 설정할 수 있습니다.
    // setState(combinedArr);
  }, [SGraphData, FGraphData]);

  // const result1 = SGraphData.map(arr => arr.includes(1) ? 1 : 0);
  // const result2 = FGraphData.map(arr => arr.includes(1) ? 1 : 0);
  // console.log(result1)
  // console.log(result2)

  // 재실 패턴 감지 일,주,월 버튼 요청 로직 API
  const fetchTimeTotalData = async () => {
    try {
      const arr = [];
      for (const deviceId of props.deviceId) {
        let startDate, endDate;
        let acqType = "H";
        if (currentPeriod === "day") {
          endDate = api_timestamp.endTime;
          startDate = api_timestamp.startTime1;
          acqType = "E";
        } else if (currentPeriod === "week") {
          startDate = api_timestamp.getSevenDayAgo();
          endDate = api_timestamp.endTime;
        } else if (currentPeriod === "month") {
          startDate = api_timestamp.getOneMonthAgo();
          endDate = api_timestamp.endTime;
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
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 최근 알람 함수 API
  const fetchRecentAlarmData = async () => {
    try {
      const response = await axios.get(
        "http://api.hillntoe.com:7810/api/alarm/info",
        {
          headers: { Authorization: token },
        }
      );

      if (response?.status === 200) {
        const alarmData = response.data;
        setAlarmInfo(alarmData.map((item) => item));
      } else {
        throw new Error(`Failed to fetch alarm info (${response?.status})`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //==============================================LOGIC============================================================================
  // 재실 패턴 일 주 월 버튼함수
  const handleButtonClick = (period) => {
    setCurrentPeriod(period);
    setTotalStatusData([]); // 기간이 변경될 때 TotalStatusData를 빈 배열로 재설정합니다.
  };

  //  알람 시간 데이터 파싱(timestamp => 날짜로 바꿔서 보여줌)
  const convertTimestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  // 재실 및 낙상정보 폴링 호출
  useEffect(() => {
    // Initial call to fetchStatusAndFallData
    if (props.deviceId.length > 0) {
      fetchTimeTotalData();
      fetchStatusAndFallData();
    }
    setInterval(() => {
      fetchStatusAndFallData()
    }, 60000);
  }, [props.deviceId, token]);

  // console.log(SGraphData);
  // 로그인 상태 API 호출
  useEffect(() => {
    fetchDeviceData();
  }, []);

  useEffect(() => {
    if (dataArr.length > 0 && dataArr.every(Array.isArray)) {
      const timestamps = dataArr.flatMap((deviceData) =>
        deviceData.map((value) => value.timestamp)
      );
      
      const uniqueTimestamps = Array.from(new Set(timestamps));
      setTotalStatusData(uniqueTimestamps);
        const interval = setInterval(function() {
          console.log("Interval");
        }, 1000);
        
        //인자로 함수 이름 넣어줍니다.
        clearInterval(interval);
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
    }, 8500);

    return () => clearTimeout(timeoutId);
  }, [currentPeriod]);

  useEffect(() => {
    fetchRecentAlarmData();
  }, []);

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

  function getTimeArray() {
    const now = new Date();
    const times = [];

    for (let i = 0; i < 60; i++) {
      const time = new Date(now.getTime() - i * 60000); // Subtract i minutes
      const hours = time.getHours();
      const minutes = time.getMinutes();

      const formattedHour = hours < 10 ? "0" + hours : hours;
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

      const formattedTime = formattedHour + "시" + formattedMinutes + "분";
      times.push(formattedTime);
    }

    return times;
  }

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
  const array = getTimeArray();

  // 재실 그래프 및 낙상정보 데이터
  let data = {
    labels: array,
    datasets: [
      {
        label: "   재실",
        data: exist,
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
        data: fall,
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
              {TotalStatusData.length > 0 ? (
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
                                dataArr[index].length % 24
                              }시간 재실`
                            : "데이터 없음"
                          : currentPeriod === "month"
                          ? dataArr[index]?.length
                            ? `${Math.floor(dataArr[index].length / 24)}일 ${
                                dataArr[index].length % 24
                              }시간 재실`
                            : "데이터 없음"
                          : ""}
                        <span> </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="content-loading">
                  <img src={LoadingCircle} style={{width:'25px'}}/> 데이터 불러오는 중···
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
