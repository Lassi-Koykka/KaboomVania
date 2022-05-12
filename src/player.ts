import { GameObj } from "kaboom";
import { up, down, left, right } from "./input";

const SPEED = 60;
const PLAYER_HEIGHT = 28;
const DEFAULT_WHIP_LENGTH = 60;
const WHIP_SEGMENTS = 8;

const getInputDir = () => {
  const dir = vec2(0, 0);
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
      facing: 1,
    },
  ]);

  const playerIsGrounded = () => p.isGrounded && p.isGrounded()

  p.onUpdate(() => {
    // Update camera
    camPos(vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2));

    //Crouch
    if (!p.attacking && playerIsGrounded() && down()) {
      p.crouching = true;
      p.height = PLAYER_HEIGHT / 2;
    } else if (!p.attacking) {
      p.crouching = false;
      p.height = PLAYER_HEIGHT;
    }

    // Move
    if (!p.crouching && (!p.attacking || !playerIsGrounded()))
      p.move(SPEED * p.dirX, 0);
    if (!left() && !right()) p.dirX = 0;
  });

  // --- WHIP ---

  const whip = add([
    "weapon",
    z(1),
    pos(),
    state("inactive", ["inactive", "attack", "hold", "swing"]),
    { length: DEFAULT_WHIP_LENGTH / 3, attackDir: vec2(0) },
  ]);

  const whipSegs: GameObj[] = [];
  let whipSticks: {
    p1: GameObj;
    p2: GameObj;
    length: number;
  }[] = [];

  for (let i = 0; i < WHIP_SEGMENTS; i++) {
    const last = i === WHIP_SEGMENTS - 1;
    const segWidth = last ? 14 : 10;
    const seg = add([
      "weapon",
      pos(),
      z(5),
      area({ width: segWidth, height: segWidth }),
      circle(segWidth / 2),
      outline(1),
      rotate(0),
      last ? color(250, 150, 0) : color(140, 140, 140),
      //@ts-ignore
      origin("center"),
      { locked: i === 0 },
    ]);
    seg.onCollide("enemy", (enemy: GameObj) => {
      if (whip.state !== "inactive") destroy(enemy);
    });

    seg.onCollide("hook", (hook: GameObj) => {
      const lastSeg = whipSegs[whipSegs.length - 1]
      lastSeg.pos = hook.pos
      whip.enterState("swing")
    })
    whipSegs.push(seg);
  }

  whip.onUpdate(() => updateWhipPos());

  whip.onStateEnter("inactive", () => {
    p.attacking = false;
    whip.hidden = true;
    whipSegs.forEach((seg) => {
      seg.hidden = true;
    });
  });

  whip.onStateLeave("inactive", () => {
    p.attacking = true;
    whip.hidden = false;
    whipSegs.forEach((seg) => (seg.hidden = false));
  });

  whip.onStateEnter("hold", () => {
    whipSticks = [];
    whipSegs.forEach((seg, i) => {
      if (i !== whipSegs.length - 1) {
        const next = whipSegs[i + 1];
        whipSticks.push({
          p1: seg,
          p2: next,
          length: seg.pos.dist(next.pos),
        });
      } else if (whip.attackDir.eq(UP) || whip.attackDir.eq(DOWN)) {
        seg.pos.x += 0.1
      }
    });
  });

  whip.onStateEnter("swing", () => {
    const lastSeg = whipSegs[whipSegs.length - 1];
    lastSeg.locked = true;
    p.unuse("body")
    whipSticks = [];
    whipSticks.push({
      p1: p,
      p2: lastSeg,
      length: whip.pos.dist(lastSeg.pos)
    })
  })

  whip.onStateLeave("swing", () => {
    const lastSeg = whipSegs[whipSegs.length - 1]
    lastSeg.locked = false;
    p.use(
      body({ jumpForce: 240 })
    )

  })

  whip.onStateUpdate("hold", () => {
    if (!isKeyDown("j")) whip.enterState("inactive");
  });

  const updateWhipPos = () => {
    const newPos = vec2(p.pos.x, p.pos.y - PLAYER_HEIGHT / 2);
    whip.pos = newPos;

    if (whip.state !== "hold" && whip.state !== "swing") {
      whipSegs.forEach((seg, i) => {
        const scl = ((i + 1) / whipSegs.length) * whip.length;
        const partPos =
          whip.state !== "inactive"
            ? whip.attackDir.scale(scl).add(newPos)
            : whip.pos;
        seg.prevPos = seg.pos;
        seg.pos = partPos;
      });
    } else {

      if (!isKeyDown("j")) {
        whip.enterState("inactive");
        return;
      }

      if(whip.state === "hold") {
        const newDir = getInputDir()
        whip.attackDir = !newDir.eq(vec2(0,0)) ? newDir.unit() : whip.attackDir
        // Set locked
        const scl = 1 / whipSegs.length * whip.length;
        whipSegs[0].pos = whip.attackDir.scale(scl).add(newPos)

        whipSegs.forEach(seg => {
          if(!seg.locked) {
            const posBeforeUpdate = seg.pos.clone()
            seg.pos = seg.pos.add(seg.pos.sub(seg.prevPos))
            //@ts-ignore
            seg.pos = seg.pos.add(DOWN.scale(1000).scale(dt()**2))
            seg.prevPos = posBeforeUpdate
          }
        })
      } else {
        [p, whipSegs[whipSegs.length - 1]].forEach(seg => {
          if(!seg.locked) {
            const posBeforeUpdate = seg.pos.clone()
            seg.pos = seg.pos.add(seg.pos.sub(seg.prevPos))
            //@ts-ignore
            seg.pos = seg.pos.add(DOWN.scale(1000).scale(dt()**2))
            seg.prevPos = posBeforeUpdate
          }
        })

      }
      

      for (let i = 0; i < 10; i++) {
        whipSticks.forEach((stick) => {
          const {p1, p2, length} = stick
          const stickCenter = p1.pos.add(p2.pos).scale(0.5);
          const stickDir = p1.pos.sub(p2.pos).unit();
          if(!p1.locked)
            p1.pos = stickCenter.add(stickDir.scale(length / 2))
          if(!p2.locked)
            p2.pos = stickCenter.sub(stickDir.scale(length / 2))
        });
      }
    }
  };

  const useWhip = async () => {
    whip.length = DEFAULT_WHIP_LENGTH / 2;

    const inputDir = getInputDir();
    if (inputDir.eq(vec2(0))) inputDir.x = p.facing;
    whip.attackDir = inputDir.unit();

    whip.enterState("attack");

    wait(0.02, () => {
      whip.length += DEFAULT_WHIP_LENGTH / 3;
      wait(0.02, () => {
        whip.length += DEFAULT_WHIP_LENGTH / 3;
      });
    });

    wait(0.3, () => {
      if(whip.state === "swing") return;
      if (isKeyDown("j")) {
        whip.enterState("hold");
        return;
      }
      whip.enterState("inactive");
    });
  };

  // Destroy all
  p.onDestroy(() => {
    whipSegs.forEach((seg) => destroy(seg));
    destroy(whip);
  });

  // Controls
  onKeyDown("a", () => {
    if ( !p.attacking && playerIsGrounded()) {
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
    !p.attacking && useWhip();
  });

  return p;
};
