import { useState, useEffect } from "react";
import "../styles/DateTimer.css"
import API_timestamp from "../store/timestamps";

function DateTimer() {
  const api_timestamp = new API_timestamp();
  const [dateInfo, setDateInfo] = useState(api_timestamp.timeForm);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimestamp = new API_timestamp();
      setDateInfo(newTimestamp.timeForm);
    }, 1000);

    // clean-up function
    return () => clearInterval(intervalId);
  }, []); 
  
  return (
    <div className="Header-container" style={{ borderBottom: 'none' }}>
      <div className="day_time">
        <div className="date-info">{dateInfo}</div>
      </div>
    </div>
  );
}

export default DateTimer;
