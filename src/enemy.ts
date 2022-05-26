import { GameObj } from "kaboom";
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
      components: [
        sprite("bat", {anim: "flying"}),
        { dirX: -1, activated: false, ampMultiplier: 10 }],
      handleUpdate: (e) => {
        if (!e.activated) {
          const p = get("player")[0];
          // Check if player in trigger range
          if (!p?.pos || p.pos.dist(e.pos) > e.aggroDistance) {
            return;
          }
          e.activated = true;
        }

        const y = Math.sin(time() * 3) * 100;
        // Move
        e.move(vec2(e.dirX * e.speed, y));
      },
    };
  } else {
    // DEFAULT ENEMY
    return {
      width: 28,
      height: 56,
      components: [body(), sprite("skeleton", {anim: "idle"}), {prevPos:  vec2()}],
      handleUpdate: (e) => {
        const p = get("player")[0];
        if(!p || e.dead) return;
        if (p.pos && p.pos.dist(e.pos) < DEFAULT_AGGRO_DISTANCE) {
          const playerDir = p.pos.sub(e.pos).unit();

          if(playerDir.x > 0 ) e.flipX(false);
          else if(playerDir.x < 0 ) e.flipX(true); 

          e.move(vec2(playerDir.x * DEFAULT_ENEMY_SPEED, 0));
        }

        if(e.curAnim() === "idle" && e.pos.dist(e.prevPos) > 0.2) e.play("walk");
        else if(e.curAnim() === "walk" && e.pos.dist(e.prevPos) <= 0.05) e.play("idle");
        e.prevPos = e.pos
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

  const e: GameObj = add([
    "enemy",
    pos(x, y),
    area({width, height}),
    outline(2),
    { aggroDistance, speed, kill: () => {}, dead: false },
  ]);

  //@ts-ignore
  e.use(origin("bot"));

  components.forEach((comp) => e.use(comp));

  if(e.prevPos) e.prevPos = e.pos

  // Use enemy specific update function
  if (handleUpdate) e.onUpdate(() => handleUpdate(e));

  
  e.kill = () => {
    if(e.dead) return;
    e.dead = true;
    if(e.solid) e.solid = false;
    try {
      e.play("death");
      wait(1, () => destroy(e));
    } catch (error) {
      destroy(e);
    }
  }

  e.onCollide("player", (player: GameObj) => {
    if ( e.dead || player.invulnerable) return;
    // Commented out for sanitys sake
    burp({ volume: 0.1});
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
