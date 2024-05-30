
class API_timestamp {
  // Timestamp 프로토타입
  constructor() {
    this.today = new Date();
    this.year = this.today.getFullYear();
    this.month = (this.today.getMonth() + 1).toString().padStart(2, "0");
    this.day = this.today.getDate().toString().padStart(2, "0");
    this.dayOfWeek = this.getDayOfWeek(this.today.getDay());
    this.hours = this.today.getHours().toString().padStart(2, "0");
    this.oneHours = (this.today.getHours()-1).toString().padStart(2, "0");
    this.minutes = this.today.getMinutes().toString().padStart(2, "0");
    this.seconds = this.today.getSeconds().toString();

    this.date = `${this.year}${this.month}${this.day}${this.hours}${this.minutes}`;
    this.oneHoursdate = `${this.year}${this.month}${this.day}${this.oneHours}${this.minutes}`;
    this.period = this.hours >= 12 ? "PM" : "AM";
    this.formattedHours = this.hours > 12 ? String(this.hours - 12).padStart(2, "0") : this.hours;
    this.timeForm = `${this.year}.${this.month}.${this.day}(${this.dayOfWeek}) ${this.period} ${this.formattedHours}:${this.minutes}`;
    this.timeForm1 = `${this.year}.${this.month}.${this.day}(${this.dayOfWeek}) ${this.period} ${this.formattedHours}:${this.minutes}:${this.seconds}`
    this.ymdForm = `${this.year}.${this.month}.${this.day}`
    this.startTime1 = `${this.year}${this.month}${this.day}0000`
    this.ChartTime1 = `${this.year}${this.month}${this.day}${this.hours}00`
    this.ChartTime2 = `${this.year}${this.month}${this.day}${this.hours}00`
    this.endTime = `${this.year}${this.month}${this.day}2359`
  }

  // 하루 전 Method
  getOneDayAgo() {
    let oneDayAgo = new Date(this.today);
    oneDayAgo.setDate(this.today.getDate() - 1);

    const year = oneDayAgo.getFullYear();
    const month = (oneDayAgo.getMonth() + 1).toString().padStart(2, "0");
    const day = oneDayAgo.getDate().toString().padStart(2, "0");
    const hours = oneDayAgo.getHours().toString().padStart(2, "0");
    const date = `${year}${month}${day}${hours}00`;

    return date;
  }
  // 일주일 전 Method
  getSevenDayAgo() {
    let SevenDayAgo = new Date(this.today);
    SevenDayAgo.setDate(this.today.getDate() - 6);

    const year = SevenDayAgo.getFullYear();
    const month = (SevenDayAgo.getMonth()+1) .toString().padStart(2, "0");
    const day = SevenDayAgo.getDate().toString().padStart(2, "0");
    const date = `${year}${month}${day}0000` 
    return date
  }
  // 한달 전 Method
  getOneMonthAgo() {
    let oneMonthAgo = new Date(this.today);
    oneMonthAgo.setMonth(this.today.getMonth() - 1);
    const year = oneMonthAgo.getFullYear();
    const month = (oneMonthAgo.getMonth()+1).toString().padStart(2, "0");
    const day = oneMonthAgo.getDate().toString().padStart(2, "0");
    const date = `${year}${month}${day}0000` 
    return date
  }
  getDayOfWeek(dayIndex) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayIndex];
  }

}

export default API_timestamp;
