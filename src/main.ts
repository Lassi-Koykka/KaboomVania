import "./style.css";
import kaboom from "kaboom";
import { player } from "./player";
import { enemy } from "./enemy";

export const GRAVITY = 1200

kaboom({
  width: 640,
  height: 400,
  stretch: true,
  letterbox: true,
  crisp: true,
  background: [25, 25, 25],
});

gravity(GRAVITY);

const MAP_CELL_WIDTH = 32;
const MAP_CELL_HEIGHT = 30;
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
    width: MAP_CELL_WIDTH,
    height: MAP_CELL_HEIGHT,
    x: () => [area(), solid(), rect(MAP_CELL_WIDTH, MAP_CELL_HEIGHT), color(100, 100, 100), outline(2)],
    o: () => [
      "hook",
      area({ width: MAP_CELL_WIDTH, height: MAP_CELL_HEIGHT }),
      circle(MAP_CELL_HEIGHT / 2),
      color(25, 200, 25),
      outline(2),
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
