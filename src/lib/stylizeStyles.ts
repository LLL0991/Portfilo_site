export type StylizeStyle = {
  id: string;
  label: string;
  tint: string;
  secondary: string;
  background: string;
  mode:
    | "sticker"
    | "watercolor"
    | "felt"
    | "frame"
    | "paint"
    | "pixel"
    | "cartoon"
    | "pencil"
    | "emoji"
    | "crayon";
};

export const STYLIZE_STYLES: StylizeStyle[] = [
  {
    id: "IS001",
    label: "Warm Comic",
    tint: "#ff94b6",
    secondary: "#8cfffd",
    background: "#fff8ec",
    mode: "sticker",
  },
  {
    id: "IS005",
    label: "Soft Toy",
    tint: "#ff84b7",
    secondary: "#ffffff",
    background: "#fff0f7",
    mode: "emoji",
  },
  {
    id: "IS007",
    label: "Felt Doll",
    tint: "#ff9a3d",
    secondary: "#42c66d",
    background: "#fffaf0",
    mode: "felt",
  },
  {
    id: "IS082",
    label: "Peanuts",
    tint: "#ffe24b",
    secondary: "#4fb5ff",
    background: "#fff7d8",
    mode: "cartoon",
  },
  {
    id: "IS074",
    label: "90s Comic",
    tint: "#ff6f9c",
    secondary: "#8cfffd",
    background: "#fff1d8",
    mode: "frame",
  },
  {
    id: "IS065",
    label: "Charlie Lola",
    tint: "#ffcf4a",
    secondary: "#88d971",
    background: "#fff9e8",
    mode: "pencil",
  },
  {
    id: "IS064",
    label: "Water Sticker",
    tint: "#8cc7ff",
    secondary: "#ff8fc2",
    background: "#f2fbff",
    mode: "watercolor",
  },
  {
    id: "IS063",
    label: "Bright Flat",
    tint: "#2358ff",
    secondary: "#ff382e",
    background: "#f4f8ff",
    mode: "cartoon",
  },
  {
    id: "IS054",
    label: "Clean Line",
    tint: "#101010",
    secondary: "#8cfffd",
    background: "#ffffff",
    mode: "sticker",
  },
  {
    id: "IS043",
    label: "Dreamy",
    tint: "#d66cff",
    secondary: "#ff9bd3",
    background: "#f8ecff",
    mode: "paint",
  },
  {
    id: "IS042",
    label: "Chibi Pixel",
    tint: "#7b5cff",
    secondary: "#ffef3b",
    background: "#f1edff",
    mode: "pixel",
  },
  {
    id: "IS026",
    label: "Crayon Face",
    tint: "#ff382e",
    secondary: "#ffcf4a",
    background: "#fff4e4",
    mode: "crayon",
  },
  {
    id: "IS020",
    label: "Cute Scene",
    tint: "#7ee36a",
    secondary: "#ffdd53",
    background: "#f5f0de",
    mode: "paint",
  },
  {
    id: "IS015",
    label: "3D Emoji",
    tint: "#ff5b9f",
    secondary: "#ffffff",
    background: "#ffeefa",
    mode: "emoji",
  },
  {
    id: "IS010",
    label: "Home Paint",
    tint: "#7ee36a",
    secondary: "#ffdd53",
    background: "#f5f0de",
    mode: "paint",
  },
];

export const STYLIZE_STYLE_IDS = new Set(STYLIZE_STYLES.map((style) => style.id));
