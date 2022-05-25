import { GameObj } from "kaboom";
import {leftOrRight} from "./input";

export const SwordSwing = (p: GameObj, whip: GameObj, PLAYER_HEIGHT: number) => {
  if (whip.state === "attack" || whip.state === "hold" || p.swordActive) return;
  if (whip.state !== "swing") p.play("idle");
  p.attacking = true;
  p.swordActive = true;

  const s = add([
    "weapon",
    pos(),
    area(),
    rect(60, 10),
    color(150, 25, 25),
    lifespan(0.3)
  ]);


  //@ts-ignore
  s.onCollide("enemy", (enemy) => {
    destroy(enemy);
  });
  

  s.onUpdate(() => {
    //@ts-ignore
    s.pos = p.pos.sub(p.facing * -20, PLAYER_HEIGHT / 2);
    //@ts-ignore
    s.origin = p.facing < 0 ? "botright" : "botleft";
  })


  s.onDestroy(() => {
      if (whip.state === "inactive") p.attacking = false;
      if(p.grounded() && leftOrRight()) p.play("walk");
      p.swordActive = false;
  });

  return s;
};
