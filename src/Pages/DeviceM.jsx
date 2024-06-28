import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/DeviceM.css";

function DeviceM(props) {
  const token = sessionStorage.getItem("authorizeKey");
  const [deviceId, setDeviceId] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [alarmInfo, setAlarmInfo] = useState([]);
  const [lastFetchData, setLastFetchData] = useState([]);
  // =========================================================Data fetch=========================================================
  // 1. Device Data
  const fetchDeviceid = () => {
    axios
      .get("http://api.hillntoe.com:7810/api/config/device/info", {
        headers: { Authorization: token },
      })
      .then((response) => {
        setDeviceId(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // 2. Device Data
  const fetchDeviceData = () => {
    let today = new Date();
    let year = today.getFullYear();
    let month = (today.getMonth() + 1).toString().padStart(2, "0");
    let day = today.getDate().toString().padStart(2, "0");
    let hours = today.getHours().toString().padStart(2, "0");
    let minutes = today.getMinutes();
    let ago2minutes;
    let ago3minutes;

    if (minutes < 2) {
      let newHours = (today.getHours() - 1).toString().padStart(2, "0");
      ago2minutes = (60 + minutes - 2).toString().padStart(2, "0");
      ago3minutes = (60 + minutes - 3).toString().padStart(2, "0");
      hours = newHours; // Adjust hours for both time formats
    } else if (minutes < 3) {
      let newHours = (today.getHours() - 1).toString().padStart(2, "0");
      ago3minutes = (60 + minutes - 3).toString().padStart(2, "0");
      ago2minutes = (minutes - 2).toString().padStart(2, "0");
      hours = newHours; // Adjust hours for both time formats
    } else {
      ago2minutes = (minutes - 2).toString().padStart(2, "0");
      ago3minutes = (minutes - 3).toString().padStart(2, "0");
    }

    let ago2timeform = `${year}${month}${day}${hours}${ago2minutes}`;
    let ago3timeform = `${year}${month}${day}${hours}${ago3minutes}`;

    let promises = deviceId.map((device) =>
      axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${device.device_id}&acq_type=E&start_date=${ago3timeform}&end_date=${ago2timeform}`,
        {
          headers: { Authorization: token },
        }
      )
    );

    Promise.all(promises)
      .then((responses) => {
        const allDeviceData = responses.map((response) => response.data);
        setDeviceData(allDeviceData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const convertTimestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  const fetchDevicelastData = () => {
    let promises = deviceId.map((device) =>
      axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/lastest?device_id=${device.device_id}`,
        {
          headers: { Authorization: token },
        }
      )
    );

    Promise.all(promises)
      .then((responses) => {
        const allDeviceData = responses.map((response) => response.data);
        setLastFetchData(allDeviceData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchDevicelastData();
  }, [token, deviceId]);

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

  // Connected Device Logic
  let ConnectedCount = 0;

  lastFetchData.find((value) => {
    value.length == 1 ? ConnectedCount++ : (ConnectedCount += 0);
  });

  // =========================================================call(useEffect)=========================================================
  // 1. call(Device Data)
  useEffect(() => {
    fetchDeviceid();
  }, []);

  // 2. call(Device Data)
  useEffect(() => {
    if (deviceId.length > 0) {
      fetchDeviceData();
      fetchDevicelastData();
      const intervalId = setInterval(() => {
        fetchDeviceData();
        fetchDevicelastData();
      }, 5000);
      return () => clearInterval(intervalId); // Cleanup on unmount or deviceId change
    }
  }, [deviceId]);
  // 3. call(Device Data)
  useEffect(() => {
    fetchRecentAlarmData();
  }, []);

  function DeviceNum(deviceNumber) {
    // deviceId와 lastFetchData를 device_type 기준으로 내림차순 정렬
    const sortedData = deviceId
      .map((device, index) => ({
        device,
        lastFetchData: lastFetchData[index],
        deviceData: deviceData[index],
      }))
      .sort((a, b) => b.device.device_type - a.device.device_type);

    // console.log(sortedData)
    const devices = [];
    for (let i = 0; i < deviceNumber; i++) {
      const { device, lastFetchData, deviceData } = sortedData[i];
      devices.push(
        <div className="Device-Num-List" key={i}>
          <div
            className="Device-Num"
            key={i}
            style={{
              pointerEvents:
                lastFetchData && lastFetchData[0] ? "auto" : "none",
              opacity: lastFetchData && lastFetchData[0] ? 1 : 0.5,
            }}
          >
            <div className="Device-Content-main">
              <div>
                <span>{device.device_id}</span>
                <span style={{ display: "inline-block", paddingLeft: "5px" }}>
                  {device.device_type == 14201
                    ? "침상형"
                    : device.device_type == 14001
                    ? "천장형"
                    : device.device_type == 14901
                    ? "탁상형"
                    : null}
                </span>
                <div
                  style={{
                    float: "right",
                    paddingRight: "7px",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ color: "red" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("DROP")
                        ? "●"
                        : ""
                      : ""}
                  </span>
                  <span style={{ color: "red" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("FALL")
                        ? "●"
                        : ""
                      : ""}
                  </span>
                  <span>
                    {lastFetchData && lastFetchData[0] == undefined ? "" : ""}
                  </span>
                  <span style={{ color: "gray" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("NONE___")
                        ? "●"
                        : ""
                      : ""}
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("NOBODY")
                        ? "●"
                        : ""
                      : ""}
                  </span>
                  <span style={{ color: "springgreen" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("VITAL")
                        ? "●"
                        : ""
                      : ""}
                  </span>

                  <span style={{ color: "springgreen" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("READY")
                        ? "●"
                        : ""
                      : ""}
                  </span>

                  <span style={{ color: "blue" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("MEASURE")
                        ? "●"
                        : ""
                      : ""}
                  </span>
                  <span style={{ color: "blue" }}>
                    {lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? lastFetchData[0].datas[4].data_value.includes("MOVING")
                        ? "●"
                        : ""
                      : ""}
                  </span>

                  <span>
                    {device.device_type === 14901 &&
                    deviceData &&
                    deviceData[0] &&
                    lastFetchData &&
                    lastFetchData[0] &&
                    lastFetchData[0].datas[4]
                      ? (() => {
                          const value =
                            lastFetchData[0].datas[4].data_value.split(",")[13];
                          if (value == 3) {
                            return (
                              <span style={{ color: "springgreen" }}>●</span>
                            );
                          }
                          if (value == 1 || value == 2) {
                            return <span style={{ color: "blue" }}>●</span>;
                          }
                          if (value == 0) {
                            return <span style={{ color: "gray" }}>●</span>;
                          }
                          return null;
                        })()
                      : null}
                  </span>
                </div>
              </div>
              <div>{device.device_name}</div>
              {lastFetchData && lastFetchData[0] ? (
                convertTimestampToFormattedDate(lastFetchData[0].timestamp) ||
                null
              ) : (
                <span>연결끊김</span>
              )}
            </div>
            <div className="Device-Content-submain">
              {/* 조건문 간소화 및 데이터 체크 */}
              {device.device_type === 14901 && deviceData && deviceData[0] ? (
                <>
                  <div className="Device-Content-submain-P01">
                    <div className="Device-DataValue">
                      <span>체온</span>
                      <p>(°C)</p>
                    </div>
                    <div className="Device-DataHRValue">
                      {lastFetchData && lastFetchData[0]
                        ? lastFetchData[0].datas[4].data_value.split(",")[7]
                        : ""}
                    </div>
                  </div>
                  <div className="Device-Content-submain-P02">
                    <div className="Device-DataValue">
                      <span>심박</span>
                      <p>(bpm)</p>
                    </div>
                    <div className="Device-DataHRValue">
                      {console.log(
                        lastFetchData[0].datas[4].data_value.split(",")[13] !=3 && lastFetchData[0].datas[4].data_value.split(",")[18] ==0
                        ? "--" 
                        : lastFetchData[0].datas[4].data_value.split(",")[18]
                      )}
                    {lastFetchData[0].datas[4].data_value.split(",")[13] !=3 && lastFetchData[0].datas[4].data_value.split(",")[18] ==0
                        ? "--" 
                        : lastFetchData[0].datas[4].data_value.split(",")[18]}
                    </div>
                  </div>
                  <div className="Device-Content-submain-P03">
                    <div className="Device-DataValue">
                      <span>호흡</span>
                      <p>(bpm)</p>
                    </div>
                    <div className="Device-DataHRValue">
                      {lastFetchData[0].datas[4].data_value.split(",")[13] !=3 && lastFetchData[0].datas[4].data_value.split(",")[17] ==0
                        ? "--" 
                        : lastFetchData[0].datas[4].data_value.split(",")[17]}

               
                
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="Device-Content-submain-P1">
                    <div className="Device-DataValue">
                      <span>심박</span>
                      <p>(bpm)</p>
                    </div>
                    <div className="Device-DataHRValue">
                      {lastFetchData &&
                        lastFetchData[0] &&
                        lastFetchData[0].datas &&
                        (lastFetchData[0].datas[4].data_value.includes(
                          "VITAL"
                        ) ||
                        lastFetchData[0].datas[4].data_value.includes("READY")
                          ? lastFetchData[0].datas[4].data_value
                              .split(",")
                              [
                                lastFetchData[0].datas[4].data_value.split(",")
                                  .length - 1
                              ]?.replace("+", "")
                          : "--")}
                    </div>
                  </div>
                  <div className="Device-Content-submain-P2">
                    <div className="Device-DataValue">
                      <span>호흡</span>
                      <p>(bpm)</p>
                    </div>
                    <div className="Device-DataHRValue">
                      {lastFetchData &&
                        lastFetchData[0] &&
                        lastFetchData[0].datas &&
                        (lastFetchData[0].datas[4].data_value.includes(
                          "VITAL"
                        ) ||
                        lastFetchData[0].datas[4].data_value.includes("READY")
                          ? lastFetchData[0].datas[4].data_value
                              .split(",")
                              [
                                lastFetchData[0].datas[4].data_value.split(",")
                                  .length - 3
                              ]?.replace("+", "")
                          : "--")}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
    return devices;
  }

  function DeviceAlarm(Alarm, deviceid) {
    return Array.from({ length: Alarm }, (_, index) => {
      const i = index + 1;
      const alarm = alarmInfo[alarmInfo.length - i];
      const regex = /'(.*?)'/;
      return (
        <div className="Device-aside-main-content" key={i}>
          <div key={i}>
            {alarmInfo.length > 0 ? (
              <>
                <div
                  className="Device-aside-main-content-Title"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>{alarm.alarm_id}</div>
                  <div>{alarm.message.split("'")[1]}</div>
                </div>

                <div style={{ fontWeight: "500" }}>
                  {alarm.alarm_type === 9001
                    ? "공지사항"
                    : alarm.alarm_type === 9002
                    ? "시스템 알람"
                    : alarm.alarm_type === 9011
                    ? "조건 알람"
                    : alarm.alarm_type === 9021
                    ? "장치 소유 권한 요청 알림"
                    : alarm.alarm_type === 9901
                    ? "데이터 알림"
                    : alarm.alarm_type === 9902
                    ? "시간 알림"
                    : null}
                </div>
                <div style={{ textDecoration: "underline ", color: "gray" }}>
                  {convertTimestampToFormattedDate(alarm.alarm_timestamp)}
                </div>
                <div style={{ fontWeight: "500" }}>
                  {alarm.message.substr(15)}
                </div>
              </>
            ) : null}
          </div>
        </div>
      );
    });
  }

  // =========================================================LOGIC(useEffect)=========================================================

  return (
    <div className="DeviceM-Container">
      <div className="DeviceM-Container-a">
        <div className="Device-Header">
          <div className="Device-Header-list">
            <div className="Device-Header-list-icon">●</div>
            <div>
              <div className="Device-Header-list-title">Total Device</div>
              <div className="Device-Header-list-num">{deviceId.length}</div>
            </div>
          </div>

          <div className="Device-Header-list">
            <div className="Device-Header-list-icon">●</div>
            <div>
              <div className="Device-Header-list-title">Connected Device</div>
              <div className="Device-Header-list-num">{ConnectedCount}</div>
            </div>
          </div>

          <div className="Device-Header-list">
            <div className="Device-Header-list-icon">●</div>
            <div>
              <div className="Device-Header-list-title">
                {" "}
                Disconnected Device
              </div>
              <div className="Device-Header-list-num">
                {deviceId.length - ConnectedCount}
              </div>
            </div>
          </div>
        </div>

        <div className="Device-MainContent">{DeviceNum(deviceId.length)}</div>
      </div>
      <div className="Device-aside">
        <div className="Device-aside-header">Current Alerts</div>
        <div className="Device-aside-main">{DeviceAlarm(15)}</div>
      </div>
    </div>
  );
}

export default DeviceM;