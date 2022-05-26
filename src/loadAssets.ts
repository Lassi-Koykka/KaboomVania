export const loadAssets = () => {
  loadSprite("whip_tail", "whip_tail.png");
  loadSprite("sword_attack", "sword_attack_sheet.png", {
    sliceX: 3,
    sliceY: 1,
    anims: {
      attack: {
        from: 0,
        to: 2,
      },
    },
  });
  loadSprite("bat", "bat.32x32.png", {
    sliceX: 6,
    sliceY: 2,
    anims: {
      idle: {
        from: 5,
        to: 5,
      },
      flying: {
        from: 0,
        to: 4,
        loop: true,
      },
    },
  });
  loadSpriteAtlas("simpleGraphics_tiles32x32.png", {
    brick_block_1: {
      x: 32 * 5,
      y: 0,
      width: 32,
      height: 32,
    },
    brick_block_2: {
      x: 32 * 6,
      y: 0,
      width: 32,
      height: 32,
    },
  });
  loadSprite("hook", "hook.png");
  loadSprite("skeleton", "skeleton-36x48.png", {
    sliceX: 5,
    sliceY: 4,
    anims: {
      idle: {
        from: 11,
        to: 14,
        loop: true,
      },
      walk: {
        from: 0,
        to: 9,
        loop: true,
      },
      death: {
        from: 15,
        to: 19,
      },
    },
  });
  loadSprite("player", "whip_man_v0.png", {
    sliceX: 15,
    sliceY: 1,
    anims: {
      idle: {
        from: 0,
        to: 0,
      },
      walk: {
        from: 1,
        to: 4,
        loop: true,
        speed: 6,
      },
      whip_up: {
        from: 6,
        to: 6,
      },
      whip_up_forward: {
        from: 8,
        to: 8,
      },
      whip_forward: {
        from: 10,
        to: 10,
      },
      whip_down_forward: {
        from: 12,
        to: 12,
      },
      whip_down: {
        from: 14,
        to: 14,
      },
    },
  });
};
