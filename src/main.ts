import "./style.css";
import kaboom from "kaboom";
import { Player } from "./player";
import { enemy } from "./enemy";
import {loadAssets} from "./loadAssets";

export const GRAVITY = 1200;
export const SOLID_RADIUS = 330;

kaboom({
  width: 640,
  height: 400,
  stretch: true,
  letterbox: true,
  crisp: true,
  background: [25, 25, 25],
});

loadAssets();

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
    "                                                   o       o    ",
    "                   o                                            ",
    "          o                                      f           e  ",
    "  e              f                  o                        xxx",
    "xxxxxx                                      xxx              xxx",
    "             xxx       e                                       x",
    "      xxx    xxx     xxxx    xxx         xx    xxx             x",
    "             xxx                                        f      x",
    "          x  xxx          xx           xx          xx          x",
    "  s          xxx                   e   xx                      x",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  ],
  {
    width: MAP_CELL_WIDTH,
    height: MAP_CELL_HEIGHT,
    s: () => ["spawnpoint", {active: true}],
    e: () => ["enemySpawn", { enemyType: "default" }],
    f: () => ["enemySpawn", { enemyType: "flying" }],
    //@ts-ignore
    x: () => [
      "levelblock",
      "environment",
      area(),
      solid(),
      sprite("brick_block_2"),
      area({ width: MAP_CELL_WIDTH, height: MAP_CELL_HEIGHT }),
      //@ts-ignore
      origin("bot"),
      // color(100, 100, 100),
      // outline(2),
    ],
    o: () => [
      "hook",
      "environment",
      area({ width: MAP_CELL_WIDTH, height: MAP_CELL_HEIGHT }),
      // circle(MAP_CELL_HEIGHT / 2),
      // color(25, 200, 25),
      sprite("hook"),
      outline(2),
      //@ts-ignore
      origin("center"),
    ],
  }
);

// Enemy Spawns
let enemySpawnpoints = get("enemySpawn");
enemySpawnpoints.forEach((sp) => enemy(sp.pos.x, sp.pos.y, sp.enemyType));

// Player spawnpoint
let spawnpoint = get("spawnpoint")[0];
Player(spawnpoint.pos.x, spawnpoint.pos.y);

const levelBlocks = get("levelblock");

levelBlocks.forEach((block) => {
  block.onUpdate(() => {
    let pl = get("player")[0];
    if (pl && block.pos.dist(pl.pos) > SOLID_RADIUS && block.solid) {
      block.unuse("solid");
      // block.solid = false;
    } else if (!block.solid) {
      block.use(solid());
      // block.solid = true;
    }
  });
});

onUpdate("environment", (obj) => {
    if(!obj.screenPos) return;
    const scPos = obj.screenPos()
    const offset = MAP_CELL_WIDTH / 2;
    if(scPos.x < 0 - offset || scPos.x > width() + offset || scPos.y < 0 - offset || scPos.y > height() + offset) {
      obj.hidden = true
    } else {
      obj.hidden = false;
    }
})

onKeyPress("1", () => {
  destroy(get("player")[0]);
  const { x, y } = toWorld(mousePos());
  Player(x, y);
});
onKeyPress("2", () => {
  const { x, y } = toWorld(mousePos());
  enemy(x, y);
});
