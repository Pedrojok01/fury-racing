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

export const calculateBaseLuck = (randomNumber: bigint): number => {
  const modResult = randomNumber % 101n;
  const dividedResult = modResult / 10n;
  return Number(dividedResult) - 5;
};

export const raceModeToInt: { [key in RaceMode]: number } = {
  SOLO: 0,
  FREE: 1,
  TOURNAMENT: 2,
};

export const formatLuck = (luck: number): string => {
  if (luck > 0) return `+${luck}%`;
  if (luck < 0) return `${luck}%`;
  return "0%";
};
