// 業務日付文字列変換
export const changeTodayToStr = (today: Date) => {
  const year = today.getFullYear().toString().padStart(4, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const hour = today.getHours().toString().padStart(2, "0");
  const min = today.getMinutes().toString().padStart(2, "0");
  const sec = today.getSeconds().toString().padStart(2, "0");
  const miliSec = today.getMilliseconds().toString().padStart(3, "0");
  return `${year}${month}${day}${hour}${min}${sec}${miliSec}`;
};
