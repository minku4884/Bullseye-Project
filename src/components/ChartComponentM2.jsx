import { useEffect } from "react";
import axios from "axios";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Loading from "../asset/img/LoadingCircle.gif";
function ChartComponentM2(props) {
  
  const token = sessionStorage.getItem("authorizeKey");
  const [AvgHRData, setAvgHRDate] = useState([]);
  const [AvgBRData, setAvgBRData] = useState([]);
  const [timestamp, setTimestamp] = useState([]);
  const [chartdata, setChartData] = useState([]);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const maxDataValueWithPadding = Math.ceil(
    Math.max(...AvgHRData, ...AvgBRData) * 1.29
  );
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const end_date = `${year}${month}${day}2359`;

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 30);
  const fiveDaysAgoYear = fiveDaysAgo.getFullYear();
  const fiveDaysAgoMonth = (fiveDaysAgo.getMonth() + 1).toString().padStart(2, "0");
  const fiveDaysAgoDay = fiveDaysAgo.getDate().toString().padStart(2, "0");
  const start_date = `${fiveDaysAgoYear}${fiveDaysAgoMonth}${fiveDaysAgoDay}0000`;
  const HRBRData = async (deviceId) => {
    try {
      const response = await axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=D&start_date=${start_date}&end_date=${end_date}`,
        { headers: { Authorization: token } }
      );
      const response2 = await axios.get(`http://api.hillntoe.com:7810/api/config/device/radar/info?device_id=${deviceId}`,
      {headers:{Authorization : token}});
      const data2 = response2.data
      const devicedataType = data2[0].deviceType
      const data = response.data;
      data.reverse();
      setTimestamp(data.map((value, index) => value.timestamp));
      if (devicedataType === 14001) {
        const avgHRValues = data.map((value) => value.datas[3].max_value);
        const avgBRValues = data.map((value) => value.datas[2].max_value);
        setAvgHRDate(avgHRValues);
        setAvgBRData(avgBRValues);
      } else if (devicedataType === 14201) {
        const avgHRValues = data.map((value) => value.datas[12].max_value);
        const avgBRValues = data.map((value) => value.datas[10].max_value);
        setAvgHRDate(avgHRValues);
        setAvgBRData(avgBRValues);
      } else if (devicedataType === 14901) {
        const avgHRValues = data.map((value) => value.datas[18].max_value);
        const avgBRValues = data.map((value) => value.datas[17].max_value);
        setAvgHRDate(avgHRValues);
        setAvgBRData(avgBRValues);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // map 비동기 함수 동기화 시켜주는 함수
  const fetchData = async (timestamps) => {
    try {
      const results = await Promise.all(
        timestamps.map(async (timestamp) => {
          const response = await axios.get(
            `http://api.hillntoe.com:7810/api/timestamp/tostring?timestamp=${timestamp}`
          );
          return response.data;
        })
      );
      setChartData(results.filter((data) => data !== null));
    } catch (error) {
      console.error(error);
    }
  };



  // 차트 Label function
  useEffect(() => {
    // const fetchAllData = async () => {
    //   await Promise.all(deviceIds.map((value) => HRBRData(value)));
    // };

    // fetchAllData();
    HRBRData(props.dropDown)
  }, [props.dropDown]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData(timestamp);
  }, [timestamp]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10초 타이머 설정

    // 타이머 해제
    return () => clearTimeout(timer);
  }, []);
  
  const formattedLabels = chartdata.map((data) => {
    const dateObject = new Date(data);
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // 월을 두 자리로 만들기
    const day = dateObject.getDate().toString().padStart(2, '0'); // 일을 두 자리로 만들기
    const formattedDate = `${month}/${day}`;
    return formattedDate;
  });


  const data = {
    labels: formattedLabels,

    datasets: [
      {
        label: "  심박수   ",
        data: AvgHRData,
        fill: false,
        borderColor: "#d60225",
        tension: 0.01,
        yAxisID: "y1",
      },
      {
        label: "  호흡수",
        data: AvgBRData,
        fill: false,
        borderColor: "#0041b9",
        tension: 0.01,
        yAxisID: "y1",
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
      },

      y1: {
        beginAtZero: true,
        min: 0,
        max: maxDataValueWithPadding, // 수정: BRArr 데이터의 최대값을 고려하여 적절한 값으로 변경
        position: "left",
        ticks: {
          callback: function (value) {
            return value + "bpm";
          },
        },
        grid: {
          display: true,
          borderDash: [4, 4], // y2 축 그리드 라인 숨기기
        },
      },

      y2: {
        beginAtZero: true,
        min: 0,
        max: maxDataValueWithPadding, // 수정: BRArr 데이터의 최대값을 고려하여 적절한 값으로 변경
        position: "right",
        ticks: {
          callback: function (value) {
            return value + "bpm";
          },
        },
        grid: {
          display: false,
          borderDash: [4, 4], // y2 축 그리드 라인 숨기기
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
      line: {
        borderWidth: 1,
      },
      point: {
        radius: 2.5,
      },
    },
  };
  const HRArr = AvgHRData.map(Number)
  const BRArr = AvgBRData.map(Number)
  function checkAllZeros(arr1, arr2) {
    for (let idx in arr1) {
      if (arr1[idx] !== 0 && arr2[idx] !== 0) {
        return false;
      }
    }
    return true;
  }
  const allZeros = checkAllZeros(HRArr, BRArr);

  return (
    <div style={{ width: "694px", height: "240px", margin: "auto" }}>
    {allZeros ? (
      timeoutReached ? (
        <div style={{ fontSize: "18px", fontWeight: 500, lineHeight: "200px" }}>
          감지된 데이터가 없습니다
        </div>
      ) : (
        <div style={{ fontSize: "18px", fontWeight: 500, lineHeight: "200px" }}>
          <img src={Loading} alt="loading" /> 데이터 불러오는 중···
        </div>
      )
    ) : (
      <Line data={data} options={chartOptions} />
    )}
  </div>
  );
}

export default ChartComponentM2;