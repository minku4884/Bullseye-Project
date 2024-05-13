import React, { useEffect, useState } from "react";
import DeviceList from "../components/DeviceList";
import axiosInstance, { FetchData } from '../utils/fetchData'; // axiosModule.js 파일에서 FetchData import
import ChartComponent from "../components/ChartComponent";
import ChartComponent2 from "../components/ChartComponent2";
import ChartComponentW1 from "../components/ChartComponentW1";
import ChartComponentW2 from "../components/ChartComponentW2";
import ChartComponentM1 from "../components/ChartComponentM1";
import ChartComponentM2 from "../components/ChartComponentM2";
import { Chart, registerables } from "chart.js";
import MainContents from "../components/MainContents";
import "../styles/Dashboard.css";
import { fetchData } from "../utils/fetchData";
import Practice from "../practice";

Chart.register(...registerables);

function Dashboard() {
  const [selectedInterval1, setSelectedInterval1] = useState("day");
  const [selectedInterval2, setSelectedInterval2] = useState("day");
  const [selectedDevice, setSelectedDevice] = useState(1);
  const [deviceType, setDeviceType] = useState([]);
  const [deviceName, setDeviceName] = useState([]);
  const token = sessionStorage.getItem("authorizeKey");
  const [deviceIdList, setDeviceIdList] = useState([]);

  useEffect(() => {
    const deviceTypeData = async () => {
      try {
        const response = await axiosInstance.get("/config/device/info", {
          headers: { Authorization: token },
        });
        const data = response.data;
        setDeviceIdList(data.map((value, index) => value.device_id));
        const deviceNameval = data.map((value, index) => value.device_name);
        setDeviceName(deviceNameval);
      } catch (error) {
        console.error(error);
      }
    };

    deviceTypeData();
  }, [token]);

  useEffect(() => {
  }, [deviceType]);

  useEffect(() => {
  }, [deviceName]);

  const handleIntervalChange1 = (interval) => {
    setSelectedInterval1(interval);
  };

  const handleIntervalChange2 = (interval) => {
    setSelectedInterval2(interval);
  };

  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
  };

  return (
    <div>
      <Practice />
      <DeviceList deviceType={deviceType} />
      <MainContents deviceId={deviceIdList} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "26px",
          gap: "30px",
        }}
      >
        <div
          style={{
            width: 782,
            height: 292,
            background: "#fcfcfc",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <div className="Chart-Title">
            <div className="Title">위험(경고) 누적 그래프</div>
            <div className="Chart-Btn1">
              <button
                className={`Chart-Btn-btn1 ${
                  selectedInterval1 === "day" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange1("day")}
              >
                일
              </button>
              <button
                className={`Chart-Btn-btn1 ${
                  selectedInterval1 === "week" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange1("week")}
              >
                주
              </button>
              <button
                className={`Chart-Btn-btn1 ${
                  selectedInterval1 === "month" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange1("month")}
              >
                월
              </button>
            </div>
          </div>
          {selectedInterval1 === "day" && (
            <ChartComponent deviceId={deviceIdList} deviceType={deviceType} />
          )}
          {selectedInterval1 === "week" && (
            <ChartComponentW1 deviceId={deviceIdList} deviceType={deviceType} />
          )}
          {selectedInterval1 === "month" && (
            <ChartComponentM1 deviceId={deviceIdList} deviceType={deviceType} />
          )}
        </div>
        <div
          style={{
            width: 782,
            height: 292,
            background: "#fcfcfc",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <div className="Chart-Title">
            <div className="Title">심박수ㆍ호흡수 추이 그래프</div>

            <div style={{ marginLeft: "51px" }}>
              <select
                className="chart-dropDown"
                value={selectedDevice}
                onChange={(e) => handleDeviceChange(Number(e.target.value))}
              >
                {deviceIdList.map((deviceId, index) => (
                  <option key={deviceId} value={deviceId}>
                    {deviceName[index]}
                  </option>
                ))}
              </select>
            </div>

            <div className="Chart-Btn2">
              <button
                className={`Chart-Btn-btn2 ${
                  selectedInterval2 === "day" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange2("day")}
              >
                일
              </button>
              <button
                className={`Chart-Btn-btn2 ${
                  selectedInterval2 === "week" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange2("week")}
              >
                주
              </button>
              <button
                className={`Chart-Btn-btn2 ${
                  selectedInterval2 === "month" ? "selected" : ""
                }`}
                onClick={() => handleIntervalChange2("month")}
              >
                월
              </button>
            </div>
          </div>
          {selectedInterval2 === "day" && (
            <ChartComponent2
              deviceId={deviceIdList}
              dropDown={selectedDevice}
            />
          )}
          {selectedInterval2 === "week" && (
            <ChartComponentW2
              deviceId={deviceIdList}
              dropDown={selectedDevice}
            />
          )}
          {selectedInterval2 === "month" && (
            <ChartComponentM2
              deviceId={deviceIdList}
              dropDown={selectedDevice}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
