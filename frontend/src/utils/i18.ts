import en from "../locales/en.json";

const resources = en;

export const t = (key: string, replacements?: { [key: string]: string | number }) => {
  const keys = key.split(".");
  let translation: any = resources;

  for (const k of keys) {
    if (translation[k]) {
      translation = translation[k];
    } else {
      return key;
    }
  }

  if (replacements) {
    Object.keys(replacements).forEach((placeholder) => {
      translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder].toString());
    });
  }

  return translation;
};
