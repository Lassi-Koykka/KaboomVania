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

loadSprite("whip_tail", "whip_tail.png");
loadSprite("player", "whip_man_v0.png", {
  sliceX: 15,
  sliceY: 1,
  anims: {
    idle: {
      from: 0,
      to: 0,
    },
    walk: {
      from: 1,
      to: 4,
      loop: true,
      speed: 6
    },
    whip_up: {
      from: 6,
      to: 6,
    },
    whip_up_forward: {
      from: 8,
      to: 8,
    },
    whip_forward: {
      from: 10,
      to: 10,
    },
    whip_down_forward: {
      from: 12,
      to: 12,
    },
    whip_down: {
      from: 14,
      to: 14,
    },
  }
})

gravity(GRAVITY);

const MAP_CELL_WIDTH = 32;
const MAP_CELL_HEIGHT = 30;
addLevel(
  // [
  //   "          o     ",
  //   "                ",
  //   "                ",
  //   "                ",
  //   "xxxxxx          ",
  //   "             xxx",
  //   "      xxx    xxx",
  //   "             xxx",
  //   "          x  xxx",
  //   "   s         xxx",
  //   "xxxxxxxxxxxxxxxx",
  // ],
  [
  "                                                   o    o       ",
  "          o        o                                        e   ",
  "  e                                 o                       xxx ",
  "xxxxxx                                      xxx             xxx ",
  "             xxx       e                                      x ",
  "      xxx    xxx     xxxx    xxx         xx    xx             x ",
  "             xxx                                              x ",
  "          x  xxx          xx           xx          xx         x ",
  "  s          xxx     e             e   xx                     x ",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
],
  {
    width: MAP_CELL_WIDTH,
    height: MAP_CELL_HEIGHT,
    s: () => ["spawnpoint"],
    e: () => ["enemySpawn", { enemyType: "default" }],
    //@ts-ignore
    x: () => [area(), solid(), rect(MAP_CELL_WIDTH, MAP_CELL_HEIGHT), origin("bot"), color(100, 100, 100), outline(2)],
    o: () => [
      "hook",
      area({ width: MAP_CELL_WIDTH, height: MAP_CELL_HEIGHT }),
      circle(MAP_CELL_HEIGHT / 2),
      color(25, 200, 25),
      outline(2),
      //@ts-ignore
      origin("bot")
    ],
  }
);

// Player spawnpoint
let spawnpoint = get("spawnpoint")[0]
let p = player(spawnpoint.pos.x, spawnpoint.pos.y);

// Enemy Spawns
let enemySpawnpoints = get("enemySpawn")
enemySpawnpoints.forEach((sp) => enemy(sp.pos.x, sp.pos.y))

onKeyPress("1", () => {
  destroy(p);
  const { x, y } = toWorld(mousePos());
  p = player(x, y);
});
onKeyPress("2", () => {
  const { x, y } = toWorld(mousePos());
  enemy(x, y);
});
