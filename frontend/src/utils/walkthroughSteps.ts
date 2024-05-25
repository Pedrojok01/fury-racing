// walkthroughSteps.ts
import { type Step } from "react-joyride";

const homeSteps: Step[] = [
  {
    target: ".connect-wallet",
    content:
      "Connect your wallet to get started!\nPlenty of wallets are supported, mobile and desktop, thanks to the wonderful RainbowKit.",
  },
  {
    target: ".play",
    content: "Click here to start a new game, and simply follow the flow!",
  },
];

const modeSteps: Step[] = [
  {
    target: ".leaderboard",
    content: "Click here anytime to check the leaderboard and see your ranking.",
  },
  {
    target: ".select-mode",
    content:
      "Start in training mode to get a feel for the game. No entry fee. No pressure. Once you're ready, go climb the rank in the tournament mode!",
  },
];

const selectSteps: Step[] = [
  {
    target: ".select-car",
    content:
      "Choose your car wisely! Each car has different attribute's ranges that will impact your performance on the track.",
  },
  {
    target: ".select-attributes",
    content: "Adjust your car's attributes depending on the weather and the track to get the best possible time.",
  },
  {
    target: ".select-luck",
    content:
      "Luck doesn't directly impact your car performance. However, it will either increase or decrease all your other car's attributes by a small percent. Set to 1 will decrease all attributes by -4%, while 10 will increase them by +5%. Set to 5 won't impact the other attributes.",
  },
  {
    target: ".start-race",
    content: "When you are ready, click here to launch the race!",
  },
];

const raceSteps: Step[] = [];

export const stepsData = {
  home: homeSteps,
  mode: modeSteps,
  select: selectSteps,
  race: raceSteps,
};
