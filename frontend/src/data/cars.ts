import { t } from "@/utils/i18";

export const carMetadata: CarMetadata[] = [
  {
    path: "car1",
    scale: 1.0,
    offset: {
      x: 0,
      y: 0,
      z: 0,
    },
    attributes: {
      reliability: 8, // High reliability
      maniability: 3, // Low maniability
      speed: 5, // Moderate speed
      breaks: 6, // Good brakes
      car_balance: 7, // High balance
      aerodynamics: 5, // Moderate aerodynamics
      driver_skills: 3, // Low driver skills
      luck: 3, // Low luck
    },
    description: t("cars.car_1"),
  },
  {
    path: "car2",
    scale: 1.25,
    offset: {
      x: 0,
      y: -0.1,
      z: 0.5,
    },
    attributes: {
      reliability: 5, // Moderate reliability
      maniability: 8, // High maniability
      speed: 5, // Moderate speed
      breaks: 4, // Lower brakes
      car_balance: 4, // Lower balance
      aerodynamics: 7, // High aerodynamics
      driver_skills: 3, // Low driver skills
      luck: 4, // Moderate luck
    },
    description: t("cars.car_2"),
  },
  {
    path: "car3",
    scale: 0.0145,
    offset: {
      x: 0,
      y: 0,
      z: -1,
    },
    attributes: {
      reliability: 3, // Low reliability
      maniability: 3, // Low maniability
      speed: 8, // High speed
      breaks: 5, // Moderate brakes
      car_balance: 5, // Moderate balance
      aerodynamics: 5, // Moderate aerodynamics
      driver_skills: 5, // Moderate driver skills
      luck: 6, // Higher luck
    },
    description: t("cars.car_3"),
  },
];
