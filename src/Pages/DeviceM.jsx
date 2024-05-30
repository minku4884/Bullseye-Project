import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/DeviceM.css";

function DeviceM(props) {
  const token = sessionStorage.getItem("authorizeKey");
  const [deviceId, setDeviceId] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [alarmInfo, setAlarmInfo] = useState([]);

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
  deviceData.find((value) => {
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
      DetectRadarNum();
      const intervalId = setInterval(() => {
        fetchDeviceData();
        DetectRadarNum();
      }, 60000);
      return () => clearInterval(intervalId); // Cleanup on unmount or deviceId change
    }
  }, [deviceId]);
  // 3. call(Device Data)
  useEffect(() => {
    fetchRecentAlarmData();
  }, []);

  // 임시 카운터
  const DetectRadarNum = () => {
    let cnt = 0;
    const nnn = deviceData.map((value) => {
      if (value[0] != undefined) {
        if (value[0].datas.length == 9) {
          if (value[0].datas[6].max_value == 1) {
            cnt += 1;
          }
        } else if (value[0].datas.length == 13) {
          if (value[0].datas[0].max_value == 1) {
            cnt += 1;
          }
        }
      }
    });

    return cnt;
  };

  function DeviceNum(deviceNumber) {
    const devices = [];
    for (let i = 0; i < deviceNumber; i++) {
      devices.push(
        <div className="Device-Num-List" key={i}>
          <div className="Device-Num" key={i}>
            <div className="Device-Content-main">
              <div>{deviceId[i].device_id}</div>
              <div>
                {deviceId[i].device_type == 14201
                  ? "(침상형)"
                  : deviceId[i].device_type == 14001
                  ? "(천장형)"
                  : deviceId[i].device_type == 14901
                  ? "(에그형)"
                  : null}
              </div>
              <div>{deviceId[i].device_name}</div>
              <div>
                {deviceData[i] && deviceData[i][0]
                  ? deviceId[i]?.device_type === 14001
                    ? deviceData[i][0]?.datas[6]
                      ? deviceData[i][0]?.datas[6].max_value
                      : "NaN"
                    : deviceId[i]?.device_type === 14201
                    ? deviceData[i][0]?.datas[0]
                      ? deviceData[i][0]?.datas[0].max_value
                      : "NaN"
                    : "NaN"
                  : "NaN"}
                ,
                {deviceData[i] && deviceData[i][0]
                  ? deviceId[i]?.device_type === 14001
                    ? deviceData[i][0]?.datas[8]
                      ? deviceData[i][0]?.datas[8].max_value
                      : "NaN"
                    : deviceId[i]?.device_type === 14201
                    ? deviceData[i][0]?.datas[4]
                      ? deviceData[i][0]?.datas[4].max_value
                      : "NaN"
                    : "NaN"
                  : "NaN"}
                ,
                {deviceId[i]?.device_type === 14901 &&
                deviceData[i] &&
                deviceData[i][0]
                  ? ` egg${deviceData[i][0].datas[4].data_value}`
                  : null}
              </div>
            </div>

            <div className="Device-Content-submain">
              <div className="Device-Content-submain-P1">
                <div className="Device-DataValue">
                  <span>심박</span>
                  {console.log(deviceData[i])}
                  <p>(bpm)</p>
                </div>
                <div className="Device-DataHRValue">
                  {deviceData[i] && deviceData[i][0]
                    ? deviceId[i].device_type === 14001
                      ? deviceData[i][0].datas[3]
                        ? deviceData[i][0].datas[3].data_value
                        : "NaN"
                      : deviceId[i].device_type === 14201
                      ? deviceData[i][0].datas[12]
                        ? deviceData[i][0].datas[12].data_value
                        : "NaN"
                      : deviceId[i].device_type === 14901
                      ? deviceData[i][0].datas[4]
                        ? deviceData[i][0].datas[3].data_value
                        : "NaN"
                      : "NaN"
                    : "NaN"}
                </div>
              </div>
              <div className="Device-Content-submain-P2">
                <div className="Device-DataValue">
                  <span>호흡</span>
                  <p>(bpm)</p>
                </div>
                <div className="Device-DataHRValue">
                  {deviceData[i] && deviceData[i][0]
                    ? deviceId[i].device_type === 14001
                      ? deviceData[i][0].datas[2]
                        ? deviceData[i][0].datas[2].data_value
                        : "NaN"
                      : deviceId[i].device_type === 14201
                      ? deviceData[i][0].datas[10]
                        ? deviceData[i][0].datas[10].data_value
                        : "NaN"
                      : deviceId[i].device_type === 14901
                      ? deviceData[i][0].datas[4]
                        ? deviceData[i][0].datas[4].data_value
                        : "NaN"
                      : "NaN"
                    : "NaN"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return devices;
  }

  function DeviceAlarm(Alarm) {
    const devices = [];
    for (let i = 1; i < Alarm + 1; i++) {
      devices.push(
        <div key={i}>
          <div className="Device-aside-main-content" key={i}>
            {alarmInfo.length > 0 ? (
              <>
                <div>{alarmInfo[alarmInfo.length - i].alarm_id}</div>
                <div>{alarmInfo[alarmInfo.length - i].alarm_timestamp}</div>
                <div>{alarmInfo[alarmInfo.length - i].alarm_type}</div>
                <div>{alarmInfo[alarmInfo.length - i].message}</div>
              </>
            ) : null}
          </div>
        </div>
      );
    }
    return devices;
  }

  // =========================================================LOGIC(useEffect)=========================================================

  // console.log(alarmInfo)
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
            <div className="Device-Header-list-title"> Disconnected Device</div>
            <div className="Device-Header-list-num">{deviceId.length - ConnectedCount}</div>
            </div>
          </div>

          {/* <div className="Device-Header-list">
            <div className="Device-Header-list-icon">●</div>
            <div>
            <div className="Device-Header-list-title">Number of radars detected</div>
            <div className="Device-Header-list-num">{DetectRadarNum()}</div>
            </div>
          </div> */}
          



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
