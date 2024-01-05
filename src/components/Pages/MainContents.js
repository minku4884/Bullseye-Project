import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import "./MainContents.css";
import { Line } from "react-chartjs-2";

function MainContents() {
  const [loading, setLoading] = useState(false);
  const [alarmInfo, setAlarmInfo] = useState([]);
  const [timestamp, setTimestamp] = useState(0);
  const [timestampList, setTimestampList] = useState([]);
  const [deviceIdList, setDeviceIdList] = useState([1, 2, 17]);
  const [timeArr, setTimeArr] = useState([]);
  const [dataArr, setDataArr] = useState([]);
  const [status, setStatus] = useState([])
  const totalDeviceIdList = [1, 2,17];
  const [currentPeriod, setCurrentPeriod] = useState("day");
  const [TotalStatusData, setTotalStatusData] = useState([]);
  const [fall, setFall] = useState([])
  const [exist,setExist] = useState([])
  const token = sessionStorage.getItem("authorizeKey");

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const end_date = `${year}${month}${day}2359`;

  const handleButtonClick = (period) => {
    setCurrentPeriod(period);
  };

  const convertTimestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await axios.get(
          "http://api.hillntoe.com:7810/api/config/device/info",
          {
            headers: { Authorization: token },
          }
        );
        const deviceData = response.data;
        const enabledDevices = deviceData.filter(
          (device) => device.is_enabled === 1
        );
        setDeviceIdList(enabledDevices.map((device) => device.device_name));
      } catch (error) {
        console.error(error);
      }
    };

    fetchDeviceData();
  }, [token]);


  const fetchStatusAndFallData = async () => {
    try {
      const statusArrList = [];
      const fallArrList = [];

      for (const deviceId of totalDeviceIdList) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        const Shours = (today.getHours()-1).toString().padStart(2, "0");
        const hours = today.getHours().toString().padStart(2, "0");
        const Sminutes = today.getMinutes().toString().padStart(2, "0");
        const minutes = today.getMinutes().toString().padStart(2, "0");
      
        // 재실 그래프 및 낙상정보 time
        const Status_start_date = `${year}${month}${day}${Shours}${Sminutes}`;
        const Status_end_date = `${year}${month}${day}${hours}${minutes}`;
        const response = await axios.get(
          `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${Status_start_date}&end_date=${Status_end_date}`,
          { headers: { Authorization: token } }
        );

        const data = response.data;



        const FallArr = data.map((value) => {
          if (value.datas.length === 9) {
            return null;
          } else if (value.datas.length === 13) {
            return value.datas[4].max_value;
          }
          return null;
        });

        fallArrList.push(FallArr);

        const statusArr = data.map((value) => {
          if (value.datas.length === 9) {
            return value.datas[6].data_value;
          } else if (value.datas.length === 13) {
            return value.datas[0].data_value;
          }
          return null;
        });


        statusArrList.push(statusArr);

      }
      // 낙상 재실 Polling 디버깅 console
      
      setFall(fallArrList[2]);
      setExist(statusArrList[2]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Initial call to fetchStatusAndFallData
    fetchStatusAndFallData();

    // Setting up interval to call fetchStatusAndFallData every 5 seconds
    const intervalId = setInterval(() => {
      fetchStatusAndFallData();
    }, 5000);

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [token]);

  useEffect(() => {
    const fetchTimeTotalData = async () => {
      try {
        const arr = [];
        for (const deviceId of totalDeviceIdList) {
          let startDate, endDate;
          let acqType = "H";

          if (currentPeriod === "day") {
            endDate = end_date;
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate());
            const yesterdayYear = yesterday.getFullYear();
            const yesterdayMonth = (yesterday.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const yesterdayDay = yesterday
              .getDate()
              .toString()
              .padStart(2, "0");
            startDate = `${yesterdayYear}${yesterdayMonth}${yesterdayDay}0000`;
            acqType = "E";
          } else if (currentPeriod === "week") {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 6);
            const oneWeekAgoYear = oneWeekAgo.getFullYear();
            const oneWeekAgoMonth = (oneWeekAgo.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const oneWeekAgoDay = oneWeekAgo
              .getDate()
              .toString()
              .padStart(2, "0");
            startDate = `${oneWeekAgoYear}${oneWeekAgoMonth}${oneWeekAgoDay}0000`;
            const endDateYear = today.getFullYear();
            const endDateMonth = (today.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const endDateDay = today.getDate().toString().padStart(2, "0");
            endDate = `${endDateYear}${endDateMonth}${endDateDay}2359`;
          } else if (currentPeriod === "month") {
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            const oneMonthAgoYear = oneMonthAgo.getFullYear();
            const oneMonthAgoMonth = (oneMonthAgo.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const oneMonthAgoDay = oneMonthAgo
              .getDate()
              .toString()
              .padStart(2, "0");
            startDate = `${oneMonthAgoYear}${oneMonthAgoMonth}${oneMonthAgoDay}0000`;
            const endDateYear = today.getFullYear();
            const endDateMonth = (today.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const endDateDay = today.getDate().toString().padStart(2, "0");
            endDate = `${endDateYear}${endDateMonth}${endDateDay}2359`;
          }
          const response = await axios.get(
            `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=${acqType}&start_date=${startDate}&end_date=${endDate}`,
            {
              headers: { Authorization: token },
            }
          );
          const data = response.data;
          console.log(startDate,endDate,data)
          arr.push(data);


        }

        setDataArr(arr);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTimeTotalData();
  }, [currentPeriod, token]);

  useEffect(() => {
    if (dataArr.length > 0 && dataArr.every(Array.isArray)) {
      const timestamps = dataArr.flatMap((deviceData) =>
        deviceData.map((value) => value.timestamp)
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
    const fetchTimeData = async () => {
      const allTimeData = [];
      for (const timestamp of timestampList) {
        try {
          const response = await axios.get(
            `http://api.hillntoe.com:7810/api/timestamp/tostring?timestamp=${timestamp}`,
            {
              headers: { Authorization: token },
            }
          );
          const data = response.data;
          allTimeData.push(data);
        } catch (error) {
          console.error(error);
        }
      }

      setTimeArr(allTimeData);
    };

    fetchTimeData();
  }, [token, timestampList]);

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [currentPeriod]);

  // 최근 알람 함수
  const fetchData = async () => {
    try {
      const [timestampResponse, alarmInfoResponse] = await Promise.all([
        axios.get(
          `http://api.hillntoe.com:7810/api/timestamp/tostring?timestamp=${timestamp}`,
          {
            headers: { Authorization: token },
          }
        ),
        axios.get("http://api.hillntoe.com:7810/api/alarm/info", {
          headers: { Authorization: token },
        }),
      ]);

      if (timestampResponse?.status === 200) {
        // Handle timestamp data if needed
      } else {
        throw new Error(
          `Failed to fetch timestamp info (${timestampResponse?.status})`
        );
      }

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
  let data = {
    labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60],
    //,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60
    datasets: [
      {
        label: "재실",
        data: exist,
        fill: true,
        borderColor: "#2ab62c",
        backgroundColor: "lightgreen",
        borderWidth: 2,
        yAxisID: "y1",
        stepped: true,
        order:2,
      },
      {
        label: "낙상",
        data: fall,
        fill: true,
        type: "bar",
        borderColor: "#f77d2b",
        backgroundColor: "#f77d2b",
        borderWidth: 2,
        yAxisID: "y1",
        order: 1,
        categoryPercentage:0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, // x축 그리드 라인 숨기기
        },
        ticks: {
          display: false, // x축 레이블 숨기기
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
          boxWidth: 20,
          font: {
            weight: "bold",
            size: 13.5,
          },
        },
      },
    },
    elements: {
      bar: {
        barPercentage: 0.8, // 막대의 너비 비율 설정
        categoryPercentage: 0.8, // 막대 간격 비율 설정
      },
      point: {
        radius : false
      }
    },
  };
  return (
    <div className="content-container">
      <div className="content-box">
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
          <div>
            <div className="main-content1">
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
                        TOTAL : {totalHours}시간 {remainingMinutes}분 재실 중
                      </span>
                    ) : currentPeriod === "week" ? (
                      <span style={{ display: "inline-block" }}>
                        TOTAL : {result.days}일 {result.hours}시간
                      </span>
                    ) : currentPeriod === "month" ? (
                      <span style={{ display: "inline-block" }}>
                        TOTAL : {result.days}일 {result.hours}시간
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                  <div
                    className="status-scroll"
                    style={{ height: "100px", overflowX: "auto" }}
                  >
                    {deviceIdList.map((deviceId, index) => (
                      <div key={index} style={{ lineHeight: "2" }}>
                        {deviceId} :{" "}
                        {currentPeriod === "day"
                          ? `${Math.floor(dataArr[index]?.length / 60)}시간 ${
                              dataArr[index]?.length % 60
                            }분`
                          : currentPeriod === "week"
                          ? `${Math.floor(dataArr[index]?.length / 24)}일 ${
                              dataArr[index]?.length % 24
                            }시간`
                          : currentPeriod === "month"
                          ? `${Math.floor(dataArr[index]?.length / 24)}일 ${
                              dataArr[index]?.length % 24
                            }시간`
                          : ""}
                        <span> </span>재실
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="main-chart">
                <Doughnut data={statusData} options={option} />
              </div>
            </div>
          </div>
          <div className="status-Footer">
            {currentPeriod === "day"
              ? `현재 시각 ${new Date().toLocaleTimeString()} 기준 데이터 입니다`
              : currentPeriod === "week"
              ? `현재 날짜 ${new Date().toLocaleDateString()} 기준 데이터 입니다`
              : currentPeriod === "month"
              ? `현재 날짜 ${new Date().toLocaleDateString()} 기준 데이터 입니다`
              : ""}
          </div>
        </div>

        <div className={`content-main`} style={{ width: "498px" }}>
          <div className="header-container">재실 그래프 및 낙상정보</div>
          <div style={{ width: "400px", height: "250px", margin: "0 auto" }}>
            <Line data={data} options={chartOptions} />
          </div>
        </div>
        <div className="content-main">
          <div className="header-container">최근 알람</div>
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
        </div>
      </div>
    </div>
  );
}

export default MainContents;
