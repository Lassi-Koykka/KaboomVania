import { GameObj } from "kaboom";
import { up, down, left, right } from "./input";

const SPEED = 60;
const PLAYER_HEIGHT = 28;
const WHIP_LENGTH = 60;
const WHIP_SEGMENTS = 8;

const getInputDir = () => {
  const dir = vec2(0,0);
  up() && dir.y--;
  down() && dir.y++;
  left() && dir.x--;
  right() && dir.x++;
  return dir;
};

export const player = (x: number = 190, y: number = 100) => {
  // Create player
  const p = add([
    "player",
    pos(x, y),
    rect(14, PLAYER_HEIGHT),
    outline(1),
    area(),
    body({ jumpForce: 240 }),
    color(150, 100, 50),
    //@ts-ignore
    origin("bot"),
    {
      crouching: false,
      attacking: false,
      dirX: 0,
      facing: 1
    },
  ]);

  p.onUpdate(() => {
    // Update camera
    camPos(vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2));

    //Crouch
    if (!p.attacking && p.isGrounded() && down()) {
      p.crouching = true;
      p.height = PLAYER_HEIGHT / 2;
    } else if(!p.attacking) {
      p.crouching = false;
      p.height = PLAYER_HEIGHT;
    }

    // Move
    if (!p.crouching && (!p.attacking || !p.isGrounded()))
      p.move(SPEED * p.dirX, 0);
    if (!left() && !right()) p.dirX = 0;
  }); 

  const useWhip = async () => {
    const inputDir = getInputDir();
    if(inputDir.eq(vec2(0))) inputDir.x = p.facing;
    const angle = inputDir.angle(vec2(0));

    if (p.attacking) return;

    p.attacking = true;

    const whip = add([pos(), { length: WHIP_LENGTH / 3 }, state("initial", ["initial", "holding"]), "weapon"]);

    const whipSegs: GameObj[] = [];
    // const whipSticks: { p1: typeof Vec2, p2: typeof Vec2, length: number }[] = [];
    for (let i = 0; i < WHIP_SEGMENTS; i++) {
      const last = i === WHIP_SEGMENTS - 1;
      const segWidth = last ? 14 : 10;
      const seg = add([
        "weapon",
        pos(),
        area({width: segWidth, height: segWidth}),
        circle(segWidth / 2),
        outline(1),
        rotate(angle),
        last ? color(250, 150, 0) : color(140, 140, 140),
        //@ts-ignore
        origin("center"),
        {prevPos: vec2(0,0)},
      ]);
      whipSegs.push(seg);
    }

    whipSegs.forEach((seg) =>
      seg.onCollide("enemy", (enemy: GameObj) => {
        destroy(enemy);
      })
    );

    const updateWhipPos = () => {
      const newPos = vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2);
      if (Math.abs(angle) < 90) newPos.x += 7;
      else if (Math.abs(angle) > 90) newPos.x += -7;
      else if (angle === 90) newPos.y += 7;
      else if (angle === -90) newPos.y += -7;
      whip.pos = newPos;
      whipSegs.forEach((seg, i) => {
        const scl = ((i + 1) / whipSegs.length) * whip.length;
        const partPos = Vec2.fromAngle(angle).scale(scl).add(newPos);
        seg.prevPos = seg.pos
        seg.pos = partPos;
      });
    }

    whip.onStateUpdate("initial", () => {
      updateWhipPos();
    });

    whip.onStateUpdate("holding", () => {
      updateWhipPos();
      if(isKeyReleased("j")) destroyWhip();
    })

    p.onDestroy(() => {
      destroyWhip();
    })

    wait(0.02, () => {
      whip.length += WHIP_LENGTH / 3;
      wait(0.02, () => {
        whip.length += WHIP_LENGTH / 3;
      });
    });

    const destroyWhip = () => {
      p.attacking = false;
      whipSegs.forEach((seg) => destroy(seg));
      destroy(whip);
    }

    wait(0.3, () => {
      if(isKeyDown("j")) {
        whip.enterState("holding");
      } else destroyWhip();
    });
  };

  onKeyDown("a", () => {
    if (!p.attacking && p.isGrounded()) {
      p.dirX = -1;
      p.facing = -1;
    }
  });

  onKeyDown("d", () => {
    if (!p.attacking && p.isGrounded()){
      p.dirX = 1;
      p.facing = 1;
    } 
  });

  onKeyPress("space", () => {
    if (!p.attacking && p.isGrounded()) {
      p.jump();
    }
  });

  onKeyPress("j", () => {
    useWhip();
  });

  return p;
};
