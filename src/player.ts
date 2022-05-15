import { Vec2 } from "kaboom";
import {  leftOrRight } from "./input";
import { Whip } from "./whip"

const SPEED = 80;
const PLAYER_HEIGHT = 46;
const PLAYER_JUMP_FORCE = 390

const getAnimByDirection = (dir: Vec2) => {
  if(dir.x !== 0) {
    if(dir.y > 0) return "whip_down_forward"
    else if(dir.y < 0) return "whip_up_forward"
    else return "whip_forward"
  } else {
    if(dir.y > 0) return "whip_down"
    else return "whip_up"
  }
}

export const player = (x: number = 190, y: number = 100) => {
  // Create player
  const p = add([
    "player",
    pos(x, y),
    sprite("player"),
    state("idle", ["idle", "walk", "attack", "swing"]),
    area({width: 28, height: PLAYER_HEIGHT}),
    body({ jumpForce: PLAYER_JUMP_FORCE }),
    color(150, 100, 50),
    //@ts-ignore
    origin("bot"),
    {
      defaultJumpForce: PLAYER_JUMP_FORCE,
      defaultHeight: PLAYER_HEIGHT,
      attacking: false,
      dirX: 0,
      facing: 1,
      grounded: () => {}
    },
  ]);

  p.grounded = () => p.isGrounded && p.isGrounded();

  const whip = Whip(p)

  p.onUpdate(() => {
    // Update camera and sprite
    camPos(vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2));
    p.flipX(p.facing === -1)

    // Move if walking or in air
    if ((p.dirX && !p.attacking) || !p.grounded()) {
      p.move(SPEED * p.dirX, 0);
    }
    if(!p.grounded()) {
      !p.attacking && p.enterState("idle")
      return;
    } 

    // Stop if on ground and no inputdir
    if (!leftOrRight()) {
      p.dirX = 0;
      !p.attacking && p.enterState("idle")
    } else if(leftOrRight() && !p.attacking) {
      p.state !== "walk" && p.enterState("walk")
    }
  });

  p.onStateEnter("walk", () => {
    p.play("walk")
  })
  
  p.onStateEnter("idle", () => {
    p.play("idle")
  })

  p.onStateUpdate("attack", () => {
    const anim = getAnimByDirection(whip.attackDir)
    p.play(anim)
    // if(whip.state === "hold")
    //   p.frame += 1
  })

  p.onStateEnter("swing", () => {
    p.play("idle")
    p.frame =  7
  })

  // --- WHIP ---

  // Destroy all
  p.onDestroy(() => {
    whip.segs.forEach((seg) => destroy(seg));
    destroy(whip);
  });

  // Controls
  onKeyDown("a", () => {
    if (!p.attacking && p.grounded()) {
      p.dirX = -1;
      p.facing = -1;
    }
  });

  onKeyDown("d", () => {
    if (!p.attacking && p.grounded()) {
      p.dirX = 1;
      p.facing = 1;
    }
  });

  onKeyPress("space", () => {
    if (!p.attacking && p.grounded()) {
      p.jump();
    }
  });

  onKeyPress("j", () => {
    !p.attacking && whip.attack();
  });

  return p;
};
