export const convertTimeForChat = (date: Date) => {
  const time = new Date(date);
  const h = time.getHours() % 12,
    m = time.getMinutes();
  return `${time.getHours() < 12 ? "AM" : "PM"} ${
    h === 0 ? 12 : h < 10 ? "0" + h : h
  }:${m < 10 ? "0" + m : m}`;
};
