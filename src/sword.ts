import { GameObj } from "kaboom";
import {leftOrRight} from "./input";
const Sword = (p: GameObj, whip: GameObj, PLAYER_HEIGHT: number) => {
  const s = add([
    "weapon",
    pos(),
    area(),
    rect(60, 10),
    color(150, 25, 25),
    { attacking: false, attackDir: p.facing, attack: () => {} },
  ]);

  s.hidden = true;

  s.attack = () => {
    if (whip.state === "attack" || whip.state === "hold" || s.attacking) return;
    if(whip.state !== "swing") p.play("idle");
    p.attacking = true;
    s.attacking = true;
    s.hidden = false;
    wait(0.3, () => {
      s.attacking = false;
      s.hidden = true;
      if (whip.state === "inactive") p.attacking = false;
      if(p.grounded() && leftOrRight()) p.play("walk");
    });
  };

  s.onUpdate(() => {
    if (s.attacking) {
      s.attackDir = p.facing;
      //@ts-ignore
      s.origin = s.attackDir < 0 ? "botright" : "botleft";
    }
    s.pos = p.pos.sub(s.attackDir * -20, PLAYER_HEIGHT / 2);
  });

  s.onCollide("enemy", (enemy) => {
    debug.log(s.attacking);
    if (s.attacking) destroy(enemy);
  });
  return s;
};

export default Sword;
