import { up, down, left, right } from "./input";
import { Whip } from "./whip"

const SPEED = 80;
const PLAYER_HEIGHT = 56;
const PLAYER_JUMP_FORCE = 390

export const player = (x: number = 190, y: number = 100) => {
  // Create player
  const p = add([
    "player",
    pos(x, y),
    rect(PLAYER_HEIGHT / 2, PLAYER_HEIGHT),
    outline(2),
    area(),
    body({ jumpForce: PLAYER_JUMP_FORCE }),
    color(150, 100, 50),
    //@ts-ignore
    origin("bot"),
    {
      defaultJumpForce: PLAYER_JUMP_FORCE,
      defaultHeight: PLAYER_HEIGHT,
      crouching: false,
      attacking: false,
      dirX: 0,
      facing: 1,
    },
  ]);

  const playerIsGrounded = () => p.isGrounded && p.isGrounded();

  p.onUpdate(() => {
    // Update camera
    camPos(vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2));

    //Crouch
    if (!p.attacking && playerIsGrounded() && down()) {
      p.crouching = true;
      p.height = p.defaultHeight / 2;
    } else if (!p.attacking) {
      p.crouching = false;
      p.height = p.defaultHeight;
    }

    // Move
    if (!p.crouching && (!p.attacking || !playerIsGrounded()))
      p.move(SPEED * p.dirX, 0);
    if (!left() && !right()) p.dirX = 0;
  });

  // --- WHIP ---
  const whip = Whip(p)


  // Destroy all
  p.onDestroy(() => {
    whip.segs.forEach((seg) => destroy(seg));
    destroy(whip);
  });

  // Controls
  onKeyDown("a", () => {
    if (!p.attacking && playerIsGrounded()) {
      p.dirX = -1;
      p.facing = -1;
    }
  });

  onKeyDown("d", () => {
    if (!p.attacking && playerIsGrounded()) {
      p.dirX = 1;
      p.facing = 1;
    }
  });

  onKeyPress("space", () => {
    if (!p.attacking && playerIsGrounded()) {
      p.jump();
    }
  });

  onKeyPress("j", () => {
    !p.attacking && whip.attack();
  });

  return p;
};
