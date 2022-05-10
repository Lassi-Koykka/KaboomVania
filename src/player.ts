import { GameObj } from "kaboom";
import { up, down, left, right } from "./input";

const SPEED = 60;
const PLAYER_HEIGHT = 28;
const WHIP_LENGTH = 60;
const WHIP_SEGMENTS = 8;

const getAngle = () => {
  if (up() && right()) return -45;
  if (down() && right()) return 45;
  if (down() && left()) return 135;
  if (up() && left()) return -135;
  else if (up()) return -90;
  else if (down()) return 90;
  else if (left()) return 180;
  else if (right()) return 0;
  else return null;
};

export const player = (x: number = 190, y: number = 100) => {
  // Create player
  const p = add([
    pos(x, y),
    rect(14, PLAYER_HEIGHT),
    outline(1),
    area(),
    body({ jumpForce: 240 }),
    color(150, 100, 50),
    //@ts-ignore
    origin("bot"),
    "player",
    {
      crouching: false,
      attacking: false,
      dirX: 0,
    },
  ]);

  p.onUpdate(() => {
    // Update camera
    camPos(vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2));

    //Crouch
    if (p.isGrounded() && down()) {
      p.crouching = true;
      p.height = PLAYER_HEIGHT / 2;
    } else {
      p.crouching = false;
      p.height = PLAYER_HEIGHT;
    }

    // Move
    if (!p.crouching && (!p.attacking || !p.isGrounded()))
      p.move(SPEED * p.dirX, 0);
    if (!left() && !right()) p.dirX = 0;
  });

  const useWhip = async () => {
    const angle = getAngle();

    if (p.attacking || angle === null) return;

    p.attacking = true;

    const whip = add([pos(), { length: WHIP_LENGTH / 3 }]);

    const whipSegs: GameObj[] = [];
    for (let i = 0; i < WHIP_SEGMENTS; i++) {
      const last = i === WHIP_SEGMENTS - 1;
      const seg = add([
        pos(),
        area(),
        last ? rect(14, 14) : rect(10, 10),
        outline(1),
        rotate(angle),
        last ? color(250, 150, 0) : color(140, 140, 140),
        //@ts-ignore
        origin("center"),
        "weapon",
      ]);
      whipSegs.push(seg);
    }

    whipSegs.forEach((seg) =>
      seg.onCollide("enemy", (enemy: GameObj) => {
        destroy(enemy);
      })
    );

    whip.onUpdate(() => {
      const newPos = vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2);
      if (Math.abs(angle) < 90) newPos.x += 7;
      else if (Math.abs(angle) > 90) newPos.x += -7;
      else if (angle === 90) newPos.y += 7;
      else if (angle === -90) newPos.y += -7;
      whip.pos = newPos;
      whipSegs.forEach((seg, i) => {
        const scl = ((i + 1) / whipSegs.length) * whip.length;
        console.log(scl);
        const partPos = Vec2.fromAngle(angle).scale(scl).add(newPos);
        seg.pos = partPos;
      });
    });

    wait(0.01, () => {
      whip.length += WHIP_LENGTH / 3;
      wait(0.02, () => {
        whip.length += WHIP_LENGTH / 3;
      });
    });

    wait(0.3, () => {
      p.attacking = false;
      whipSegs.forEach((seg) => destroy(seg));
      destroy(whip);
    });
  };

  onKeyDown("a", () => {
    if (!p.attacking && p.isGrounded()) p.dirX = -1;
  });

  onKeyDown("d", () => {
    if (!p.attacking && p.isGrounded()) p.dirX = 1;
  });

  onKeyPress("space", () => {
    if (p.isGrounded()) {
      p.jump();
    }
  });

  onKeyPress("j", () => {
    useWhip();
  });

  return p;
};
