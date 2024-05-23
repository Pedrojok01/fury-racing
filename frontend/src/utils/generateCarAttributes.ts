export const generateRandomAttributes = (): CarAttributes => {
  const min = 3;
  const max = 8;
  const totalPoints = 40;
  const numAttributes = 8;
  const attributes: CarAttributes = {
    reliability: 0,
    maniability: 0,
    speed: 0,
    breaks: 0,
    car_balance: 0,
    aerodynamics: 0,
    driver_skills: 0,
    luck: 0,
  };

  // Step 1: Generate random values within the range
  let remainingPoints = totalPoints;
  const attributeKeys = Object.keys(attributes) as (keyof CarAttributes)[];

  attributeKeys.forEach((key, index) => {
    // Ensure that we leave enough points for the remaining attributes
    const maxForThisAttribute = Math.min(max, remainingPoints - (numAttributes - index - 1) * min);
    const minForThisAttribute = Math.max(min, remainingPoints - (numAttributes - index - 1) * max);

    attributes[key] = Math.floor(Math.random() * (maxForThisAttribute - minForThisAttribute + 1)) + minForThisAttribute;
    remainingPoints -= attributes[key];
  });

  // Step 2: Adjust the values if the sum does not exactly match totalPoints
  while (remainingPoints !== 0) {
    const key = attributeKeys[Math.floor(Math.random() * numAttributes)];
    const adjustment = remainingPoints > 0 ? 1 : -1;

    if (attributes[key] + adjustment >= min && attributes[key] + adjustment <= max) {
      attributes[key] += adjustment;
      remainingPoints -= adjustment;
    }
  }

  return attributes;
};
