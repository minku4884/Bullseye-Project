import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

function ChartComponent(props) {
  const token = sessionStorage.getItem("authorizeKey");
  const [HRArr, setHRArr] = useState([]);
  const [BRArr, setBRArr] = useState([]);
  const [chartLabel, setChartLabel] = useState([]);


  const maxDataValue = Math.max(...[...HRArr, ...BRArr]);
  const maxDataValueWithPadding = Math.ceil(maxDataValue * 1.29);

  // SEARCH YYYYMMDDHHmm

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const hours = today.getHours().toString().padStart(2, "0");
  const end_date = `${year}${month}${day}${hours}00`;

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 1);

  const fiveDaysAgoYear = fiveDaysAgo.getFullYear();
  const fiveDaysAgoMonth = (fiveDaysAgo.getMonth() + 1).toString().padStart(2, "0");
  const fiveDaysAgoDay = fiveDaysAgo.getDate().toString().padStart(2, "0");

  const start_date = `${fiveDaysAgoYear}${fiveDaysAgoMonth}${fiveDaysAgoDay}${hours}00`;


  const fetchDataForDevice = (deviceId) => {
    return axios.get(
      `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${start_date}&end_date=${end_date}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  };
  
  let response = [];

  const searchData = async () => {
    const deviceIds = props.deviceId;
    const promises = [];
    const dateCounts = {
      hrCount: {},
      brCount: {},
    };
  
    for (const deviceId of deviceIds) {
      try {
         const response1 =await axios.get(
          `http://api.hillntoe.com:7810/api/config/device/info?device_id=${deviceId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        // 데이터 처리 작업 추가
          response.push(response1)
        promises.push(fetchDataForDevice(deviceId));
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    }
  
    try {

      const responses = await Promise.all(promises);
      const combinedData = responses.flatMap((response) => response.data);
  
      // const deviceType = response.map((value)=>value.data[0].device_type)
      
      combinedData.reverse();
      combinedData.forEach((value,index) => {
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
        let BR, HR
         if(value.datas.length == 9) {
          BR = value.datas[2].max_value;
          HR = value.datas[3].max_value;
         } else if(value.datas.length == 13) {
          BR = value.datas[10].max_value;
          HR = value.datas[12].max_value;
         }
  
        //  console.log(value.device_id, value.timestamp,HR,BR)

        dateCounts[timeString].hrCount += HR !== 0 && (HR > 95 || HR < 40) ? 1 : 0;
        dateCounts[timeString].brCount += BR !== 0 && (BR > 15 || BR < 5) ? 1 : 0;

      });
  
      const chartDataArray = Object.entries(dateCounts).map(([time, counts]) => ({
        time,
        hrCount: counts.hrCount,
        brCount: counts.brCount,
      }));
  
      
      // console.log(chartDataArray)
      const targetTimes = [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
        "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
      ];
  
      const filteredData = chartDataArray.filter((data) =>
        targetTimes.some((time) => data.time.startsWith(time))
      );
  
      const mergedData = targetTimes.reduce((result, targetTime) => {
        const filteredByTime = filteredData.filter((data) => data.time.startsWith(targetTime));
        const totalHrCount = filteredByTime.reduce((total, data) => total + data.hrCount, 0);
        const totalBrCount = filteredByTime.reduce((total, data) => total + data.brCount, 0);
  
        result.push({
          time: targetTime,
          hrCount: totalHrCount,
          brCount: totalBrCount,
        });
  
        return result;
      }, []);
      // console.log(mergedData)
  
      setChartLabel(mergedData.map((value) => value.time + ":00"));
      setHRArr(mergedData.map((value) => value.hrCount));
      setBRArr(mergedData.map((value) => value.brCount));
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  
  useEffect(() => {
    searchData();
  }, [props.deviceId]);


  // console.log(HRArr, BRArr, chartLabel)

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
      <Line type="line" data={data} options={chartOptions} />
    </div>
  );
}

export default ChartComponent;
