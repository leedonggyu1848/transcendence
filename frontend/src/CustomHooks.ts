export const convertTimeForChat = (date: Date) => {
  const h = date.getHours() % 12,
    m = date.getMinutes();
  return `${date.getHours() < 12 ? "AM" : "PM"} ${
    h === 0 ? 12 : h < 10 ? "0" + h : h
  }:${m < 10 ? "0" + m : m}`;
};
