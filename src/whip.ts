import {GameObj, Vec2} from "kaboom";
import {getInputDir} from "./input";
import {GRAVITY} from "./main";

const DEFAULT_WHIP_LENGTH = 80;
const WHIP_SEGMENTS = 16;

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

export const Whip = (p: GameObj) => {
  const WHIP_OFFSET = vec2(0, p.defaultHeight / 2 + 3)

  const segs: GameObj[] = [];
  let sticks: {
    p1: GameObj;
    p2: GameObj;
    length: number;
  }[] = [];

  const w = add([
    "weapon",
    z(1),
    pos(),
    state("inactive", ["inactive", "attack", "hold", "swing"]),
    { 
      attack: () => {}, 
      prevPos: vec2(0), 
      length: DEFAULT_WHIP_LENGTH / 3, 
      attackDir: vec2(0),
      segs,
      sticks
    },
  ]);

  for (let i = 0; i < WHIP_SEGMENTS; i++) {
    const last = i === WHIP_SEGMENTS - 1;
    const segWidth = last ? 16 : 10;
    const seg = add([
      "weapon",
      pos(),
      area({ width: segWidth, height: segWidth }),
      last ? rect(segWidth, segWidth) : circle(segWidth / 2),
      outline(2),
      rotate(0),
      last ? color(250, 150, 0) : color(140, 140, 140),
      //@ts-ignore
      origin("center"),
      { locked: i === 0 },
    ]);
    seg.onCollide("enemy", (enemy: GameObj) => {
      if (w.state !== "inactive") destroy(enemy);
    });

    seg.onCollide("hook", (hook: GameObj) => {
      if (w.state === "swing" || w.state === "inactive") return;
      const lastSeg = segs[segs.length - 1];
      lastSeg.pos = hook.pos;
      w.enterState("swing");
    });
    w.segs.push(seg);
  }

  const updateWhipSticks = () => {
    for (let i = 0; i < 10; i++) {
      w.sticks.forEach((stick) => {
        const { p1, p2, length } = stick;
        const stickCenter = p1.pos.add(p2.pos).scale(0.5);
        const stickDir = p1.pos.sub(p2.pos).unit();
        if (!p1.locked) p1.pos = stickCenter.add(stickDir.scale(length / 2));
        if (!p2.locked) p2.pos = stickCenter.sub(stickDir.scale(length / 2));
      });
    }
  };

  w.onUpdate(() => {
    //Update segment angles
    w.segs.forEach((seg, i) => {
      if(i === 0) seg.angle = seg.pos.angle(w.pos)
      else seg.angle = seg.pos.angle(w.segs[i  - 1].pos)

      if(i === w.segs.length - 1) seg.angle += 45
    })

    if (w.state === "hold" || w.state === "swing") {
      if (!isKeyDown("j")) w.enterState("inactive");
      return;
    }

    // Update Whip pos
    w.pos = p.pos.sub(WHIP_OFFSET);
    // Interpolate whip segments to their correct places
    w.segs.forEach((seg, i) => {
      const scl = ((i + 1) / w.segs.length) * w.length + 10;
      const partPos =
        w.state !== "inactive" ? w.attackDir.scale(scl).add(w.pos) : w.pos;
      seg.prevPos = seg.pos;
      seg.pos = partPos;
      if(w.attackDir.y > 0) seg.pos.y += + 5
      else if(w.attackDir.y < 0) seg.pos.y += - 5
    });
    // Update prevPos
    w.prevPos = w.pos;
  });

  w.onStateEnter("inactive", () => {
    p.attacking = false;
    p.play("idle")
    w.hidden = true;
    w.segs.forEach((seg) => {
      seg.hidden = true;
    });
  });

  w.onStateLeave("inactive", () => {
    p.attacking = true;
    w.hidden = false;
    w.segs.forEach((seg) => (seg.hidden = false));
  });

  w.onStateEnter("hold", () => {
    w.sticks = [];
    w.segs.forEach((seg, i) => {
      if (i !== w.segs.length - 1) {
        const next = w.segs[i + 1];
        w.sticks.push({
          p1: seg,
          p2: next,
          length: seg.pos.dist(next.pos),
        });
      } else if (w.attackDir.eq(UP) || w.attackDir.eq(DOWN)) {
        seg.pos.x += 0.1;
      }
    });
  });

  w.onStateUpdate("hold", () => {
    w.pos =  p.pos.sub(WHIP_OFFSET);
    const newDir = getInputDir();
    w.attackDir = !newDir.eq(vec2(0, 0)) ? newDir.unit() : w.attackDir;
    // Play appropriate animation
    p.facing = w.attackDir.x > 0 ? 1 : - 1
    const anim = getAnimByDirection(w.attackDir)
    p.play(anim)
    p.frame += 1
    // Update whipSegments
    const scl = (1 / w.segs.length) * w.length + 10;
    const firstSeg = w.segs[0]
    firstSeg.pos = w.attackDir.scale(scl).add(w.pos);
    if(w.attackDir.y > 0) firstSeg.pos.y += + 5
    else if(w.attackDir.y < 0) firstSeg.pos.y += - 5


    w.segs.forEach((seg) => {
      if (!seg.locked) {
        const posBeforeUpdate = seg.pos.clone();
        seg.pos = seg.pos.add(seg.pos.sub(seg.prevPos));
        seg.pos = seg.pos.add(DOWN.scale(GRAVITY).scale(dt() ** 2));
        seg.prevPos = posBeforeUpdate;
      }
    });

    updateWhipSticks();
  }); 

  w.onStateEnter("swing", () => {
    p.play("idle")
    p.frame = 3
    p.crouching = false;
    const lastSeg = w.segs[w.segs.length - 1];
    lastSeg.locked = true;
    p.unuse("body");
    w.sticks = [];
    w.prevPos = w.pos;
    w.sticks.push({
      p1: w,
      p2: lastSeg,
      length: w.pos.dist(lastSeg.pos),
    });
  });

  w.onStateLeave("swing", () => {
    const lastSeg = w.segs[w.segs.length - 1];
    lastSeg.locked = false;
    p.use(body({ jumpForce: p.defaultJumpForce }));
    p.jump()
    p.move(w.pos.sub(w.prevPos).scale(10))
  });

  w.onStateUpdate("swing", () => {
    const moveDir = getInputDir()
    w.move(moveDir)
    p.pos = w.pos.add(WHIP_OFFSET).add(vec2(2, 14));

    const pts = [w, w.segs[w.segs.length - 1]];
    pts.forEach((pt) => {
      if (!pt.locked) {
        const newDirX = pt.pos.sub(pt.prevPos).x > 0 ? 1 : -1
        p.dirX = newDirX
        const posBeforeUpdate = pt.pos.clone();
        pt.pos = pt.pos.add(pt.pos.sub(pt.prevPos));
        pt.pos = pt.pos.add(DOWN.scale(GRAVITY).scale(dt() ** 2));
        pt.prevPos = posBeforeUpdate;
      }
    });

    updateWhipSticks();
    const lastSeg = w.segs[w.segs.length - 1];
    const whipDir = lastSeg.pos.sub(w.pos).unit()
    w.segs.forEach((seg, i) => {
      if(i === segs.length - 1) return;
      const scl = ((i + 1) / w.segs.length) * w.pos.dist(lastSeg.pos);
      const partPos =
        w.state !== "inactive" ? whipDir.scale(scl).add(w.pos) : w.pos;
      seg.prevPos = seg.pos;
      seg.pos = partPos;
    });
  });


  w.attack = async () => {
    w.length = DEFAULT_WHIP_LENGTH / 2;

    const inputDir = getInputDir();
    if (inputDir.eq(vec2(0))) inputDir.x = p.facing;
    inputDir.x < 0 ? p.facing = -1 : p.facing = 1
    w.attackDir = inputDir.unit();
    p.play(getAnimByDirection(w.attackDir))

    w.enterState("attack");

    wait(0.02, () => {
      w.length += DEFAULT_WHIP_LENGTH / 3;
      wait(0.02, () => {
        w.length += DEFAULT_WHIP_LENGTH / 3;
      });
    });

    wait(0.3, () => {
      if (w.state === "swing") return;
      if (isKeyDown("j")) {
        w.enterState("hold");
        return;
      }
      w.enterState("inactive");
    });
  };
  
  return w;
};
