import {  GameObj } from "kaboom";
import { leftOrRight } from "./input";

export const Sword = (p: GameObj, whip: GameObj, PLAYER_HEIGHT: number) => {

  const s: GameObj<any> = add([
    "weapon",
    pos(p.pos.sub(p.facing * -10, PLAYER_HEIGHT / 2)),
    state("inactive", ["inactive", "attack"]),
    area({width: 60, height: 30}),
    sprite("sword_attack"),
    // rect(60, 30),
    // color(150, 25, 25),
    {attack: () => {}}
  ]);

  s.hidden = true;

  const updateOrigin = () =>{
    s.origin = p.facing < 0 ? "botright" : "botleft";

    s.flipX(p.facing < 0)
  } 
  updateOrigin()

  s.onUpdate(() => {
    if(s.state === "attack") s.pos = p.pos.sub(p.facing * -10, PLAYER_HEIGHT / 2);
    else s.pos = vec2(0);
    updateOrigin();
  })

  s.onCollide("enemy", (enemy: GameObj) => {
    if(s.state === "attack") enemy.kill();
  });

  s.onStateEnter("attack", () => {
    s.hidden = false;
    s.play("attack");
  })

  s.onStateLeave("attack", () => {
    if (whip.state === "inactive") p.attacking = false;
    if (p.grounded() && leftOrRight()) p.play("walk");
    s.hidden = true;
  })

  const SwordSwing = () => {
    if (whip.state === "attack" || whip.state === "hold" || s.state === "attack")
      return;

    s.enterState("attack");
    if (whip.state !== "swing") p.play("whip_forward");
    p.attacking = true;

    wait(0.3, () => {
      s.enterState("inactive")
    })
    
  };
  
  s.attack = SwordSwing;

  return s
};
