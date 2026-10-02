import fontUrl from "./fonts/unicons-line.ttf";
import { FONT_FAMILY } from "./createIcon";

const STYLE_ID = "unicons-line-font";

if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `@font-face{font-family:"${FONT_FAMILY}";src:url(${fontUrl}) format("truetype");font-display:block;}`;
  document.head.appendChild(style);
}
