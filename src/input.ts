export const up = () => isKeyDown("w");
export const right = () => isKeyDown("d");
export const down = () => isKeyDown("s");
export const left = () => isKeyDown("a");
export const leftOrRight = () => left() || right();

export const getInputDir = () => {
  const dir = vec2(0, 0);
  up() && dir.y--;
  down() && dir.y++;
  left() && dir.x--;
  right() && dir.x++;
  return dir;
};
