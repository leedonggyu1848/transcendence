export function getRoomNameByType(
  type: number,
  roomName: string,
  myName: string
) {
  if (type !== 3) {
    return roomName.slice(1);
  }
  const name = roomName.split(",").filter((name) => name !== myName)[0];
  return `${name}과의 DM`;
}
