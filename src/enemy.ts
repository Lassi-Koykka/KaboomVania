const AGGRO_DISTANCE = 300;
const ENEMY_SPEED = 75;

export const enemy = (x: number, y: number) => {
  const e = add([
    pos(x, y),
    color(200, 15, 15),
    rect(28, 56),
    outline(2),
    area(),
    body(),
    "enemy",
  ]);
  //@ts-ignore
  e.use(origin("bot"))

  e.onUpdate(() => {
    const p = get("player")[0];
    if (p.pos && p.pos.dist(e.pos) < AGGRO_DISTANCE) {
      const playerDir = p.pos.sub(e.pos).unit();
      e.move(vec2(playerDir.x * ENEMY_SPEED, 0));
    }
  });

  e.onCollide("player", (player) => {
    if(player.invulnerable) return;
    burp();
    player.invulnerable = true;

    if(player.hp) player.hurt()
    if(player.pos && player.jump) {
      const playerDirFromEnemy = player.pos.sub(e.pos).unit()
      player.dirX = playerDirFromEnemy.x > 0 ? 1 : -1
      player.jump()
    }

    debug.log(player.hp())
    wait(0.3, () => player.invulnerable = false);
  })

  return e;
};
