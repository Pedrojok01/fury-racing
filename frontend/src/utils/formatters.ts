export const getEllipsisTxt = (str: `0x${string}`, n: number = 6): string => {
  if (str) {
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
  }
  return "";
};

export const getLuckPercentage = (luck: number): string => {
  const luckPercentages: { [key: number]: string } = {
    1: "-4",
    2: "-3",
    3: "-2",
    4: "-1",
    5: "0",
    6: "+1",
    7: "+2",
    8: "+3",
    9: "+4",
    10: "+5",
  };

  return luckPercentages[luck] || "0";
};

// Example usage:
// const totalMilliseconds = 1234567;
// const readableTime = convertMillisecondsToReadableTime(totalMilliseconds);
// console.log(readableTime); // Output: "20m 34s 567ms"
export const convertMillisecondsToReadableTime = (milliseconds: number): string => {
  let seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  const ms = milliseconds % 1000;

  return `${minutes}m ${seconds}s ${ms}ms`;
};
