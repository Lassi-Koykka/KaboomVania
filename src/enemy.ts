import { GameObj, Comp } from "kaboom";
const DEFAULT_AGGRO_DISTANCE = 300;
const DEFAULT_ENEMY_SPEED = 75;

type enemyType = "default" | "flying";

interface IEnemyProperties {
  width: number;
  height: number;
  speed?: number;
  aggroDistance?: number;
  components?: any[];
  handleUpdate?: (e: GameObj) => void;
}

const getEnemyPropreties = (type: enemyType): IEnemyProperties => {
  if (type === "flying") {
    // FLYING ENEMY
    return {
      width: 28,
      height: 28,
      aggroDistance: 500,
      components: [{ dirX: -1, activated: false, ampMultiplier: 2 }],
      handleUpdate: (e) => {
        if (!e.activated) {
          const p = get("player")[0];
          // Check if player in trigger range
          if (!p.pos || p.pos.dist(e.pos) > e.aggroDistance) {
            return;
          }
          e.activated = true;
        }

        const newY = e.pos.y * Math.sin(time()) * e.ampMultiplier;
        // Move
        e.move(vec2(e.dirX * e.speed, newY));
      },
    };
  } else {
    // DEFAULT ENEMY
    return {
      width: 28,
      height: 56,
      components: [body()],
      handleUpdate: (e) => {
        const p = get("player")[0];
        if (p.pos && p.pos.dist(e.pos) < DEFAULT_AGGRO_DISTANCE) {
          const playerDir = p.pos.sub(e.pos).unit();
          e.move(vec2(playerDir.x * DEFAULT_ENEMY_SPEED, 0));
        }
      },
    };
  }
};

export const enemy = (x: number, y: number, type: enemyType = "default") => {
  const {
    width,
    height,
    speed = DEFAULT_ENEMY_SPEED,
    aggroDistance = DEFAULT_AGGRO_DISTANCE,
    components = [],
    handleUpdate,
  } = getEnemyPropreties(type);
  const e = add([
    "enemy",
    pos(x, y),
    color(200, 15, 15),
    rect(width, height),
    outline(2),
    area(),
    { aggroDistance, speed },
  ]);
  //@ts-ignore
  e.use(origin("bot"));
  components.forEach((comp) => e.use(comp));

  if (handleUpdate) e.onUpdate(() => handleUpdate(e));

  e.onCollide("player", (player) => {
    if (player.invulnerable) return;
    // Commented out for sanitys sake
    // burp();
    player.invulnerable = true;

    if (player.hp) player.hurt();
    if (player.pos && player.jump) {
      const playerDirFromEnemy = player.pos.sub(e.pos).unit();
      player.dirX = playerDirFromEnemy.x > 0 ? 1 : -1;
      player.jump();
    }

    debug.log("HP: " + player.hp());
    wait(0.3, () => (player.invulnerable = false));
  });

  return e;
};
