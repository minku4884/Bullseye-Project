import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import ApiClient, { api_method } from "../utils/ApiClient";
import API_timestamp from "../store/timestamps"
import Loading from "../asset/img/LoadingCircle.gif"


function ChartComponent(props) {

  const client = new ApiClient();
  const api_timestamp = new API_timestamp();
  const token = sessionStorage.getItem("authorizeKey");
  const [HRArr, setHRArr] = useState([]);
  const [BRArr, setBRArr] = useState([]);
  const [chartLabel, setChartLabel] = useState([]);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const maxDataValue = Math.max(...[...HRArr, ...BRArr]);
  const maxDataValueWithPadding = Math.ceil(maxDataValue * 1.29);
  let response = [];
  let _ = require('lodash');



  // CHART API(하루전, 현재) 요청
  const fetchDataForDevice = (deviceId) => {
    const response = client.RequestAsync(
      api_method.get,
      `/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${api_timestamp.getOneDayAgo()}&end_date=${api_timestamp.date}`,
      null,
      null,
      token
    );
    return response
  };


  // 특정 이벤트 이상 감지 count 로직(HR,BR 이상 파라미터 설정)
  const searchData = async () => {
    const deviceIds = props.deviceId;
    const promises = [];
    const dateCounts = {
      hrCount: {},
      brCount: {},
    };
    for (const deviceId of deviceIds) {
      try {
        const response1 = client.RequestAsync(
          api_method.get,
          `/api/config/device/info?device_id=${deviceId}`,
          null,
          null,
          token
        );
        // 데이터 처리 작업 추가
        response.push(response1);
        promises.push(fetchDataForDevice(deviceId));
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    }
    try {
      const responses = await Promise.all(promises);
      const combinedData = responses.flatMap((response) => response.data);

      combinedData.reverse();
      combinedData.forEach((value, index) => {
        const date = new Date(value.timestamp * 1000);
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        const timeString = `${hour}:${minute}`;


        if (!dateCounts[timeString]) {
          dateCounts[timeString] = {
            hrCount: 0,
            brCount: 0,
          };
        }
        let BR, HR;
        if (value.datas.length == 9) {
          BR = value.datas[2].max_value;
          HR = value.datas[3].max_value;
        } else if (value.datas.length == 13) {
          BR = value.datas[10].max_value;
          HR = value.datas[12].max_value;
        } else if (value.datas.length == 37) {
          BR = value.datas[17].max_value;
          HR = value.datas[18].max_value;
        }
        dateCounts[timeString].hrCount +=
          HR !== 0 && (HR > 120 || HR < 40) ? 1 : 0;
        dateCounts[timeString].brCount +=
          BR !== 0 && (BR > 20 || BR < 5) ? 1 : 0;
      });
      // 해당 시간의 이벤트 ex)13:00~13:59분까지의 카운트 측정 후 sum하여 13시를 대표하는 카운트
      const chartDataArray = Object.entries(dateCounts).map(
        ([time, counts]) => ({
          time,
          hrCount: counts.hrCount,
          brCount: counts.brCount,
        })
      );
      const targetTimes = [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ];

      const filteredData = chartDataArray.filter((data) =>
        targetTimes.some((time) => data.time.startsWith(time))
      );
      const mergedData = targetTimes.reduce((result, targetTime) => {
        const filteredByTime = filteredData.filter((data) =>
          data.time.startsWith(targetTime)
        );
        const totalHrCount = filteredByTime.reduce(
          (total, data) => total + data.hrCount,
          0
        );
        const totalBrCount = filteredByTime.reduce(
          (total, data) => total + data.brCount,
          0
        );



        result.push({
          time: targetTime,
          hrCount: totalHrCount,
          brCount: totalBrCount,
        });

        return result;
      }, []);

      setChartLabel(mergedData.map((value) => value.time + ":00"));
      setHRArr(mergedData.map((value) => value.hrCount));
      setBRArr(mergedData.map((value) => value.brCount));
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  // 특정 이벤트 이상 감지 count 로직 비동기 호출
  useEffect(() => {
    searchData();
  }, [props.deviceId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10초 타이머 설정

    // 타이머 해제
    return () => clearTimeout(timer);
    }, []);
    const allZeros = checkAllZeros(HRArr, BRArr);
    
  // HRArr, BRArr 카운트 0일 시 감지된 데이터 없음
  function checkAllZeros(arr1, arr2) {
    for (let idx in arr1) {
      if (arr1[idx] !== 0 && arr2[idx] !== 0) {
        return false;
      }
    }
    return true;
  }

  const data = {
    labels: chartLabel,
    datasets: [
      {
        label: "  심박수   ",
        data: HRArr,
        fill: false,
        borderColor: "#d60225",
        tension: 0.01,
      },
      {
        label: "  호흡수",
        data: BRArr,
        fill: false,
        borderColor: "#0041b9",
        tension: 0.01,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        max: maxDataValueWithPadding,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "회";
          },
        },
        grid: {
          borderDash: [4, 4],
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

export default ChartComponent;
