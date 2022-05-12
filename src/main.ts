import "./style.css";
import kaboom from "kaboom";
import { player } from "./player";
import { enemy } from "./enemy";

kaboom({
  width: 320,
  height: 200,
  stretch: true,
  letterbox: true,
  crisp: true,
  background: [25, 25, 25],
});

gravity(1000);

addLevel(
  [
    "          o     ",
    "                ",
    "                ",
    "                ",
    "xxxxxx          ",
    "             xxx",
    "      xxx    xxx",
    "         s   xxx",
    "          x  xxx",
    "           s xxx",
    "xsxxxxxxxxxxxxxx",
  ],
  {
    width: 16,
    height: 14,
    x: () => [area(), solid(), rect(16, 14), color(100, 100, 100), outline(1)],
    o: () => [
      "hook",
      area({ width: 16, height: 14 }),
      circle(8),
      color(25, 200, 25),
      outline(1),
      //@ts-ignore
      origin("center")
    ],
  }
);

let p = player();
onKeyPress("1", () => {
  destroy(p);
  const { x, y } = toWorld(mousePos());
  p = player(x, y);
});
onKeyPress("2", () => {
  const { x, y } = toWorld(mousePos());
  enemy(x, y);
});
enemy(100, 100);
