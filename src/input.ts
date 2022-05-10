
export const up = () => isKeyDown("w");
export const right = () => isKeyDown("d");
export const down = () => isKeyDown("s");
export const left = () => isKeyDown("a");
export const leftOrRight = () => left() || right();
