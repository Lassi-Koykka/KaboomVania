export const enemy = (x: number, y: number) => {

  const e = add([
    pos(x, y),
    color(200, 15, 15),
    rect(14, 28),
    outline(1),
    area(),
    body(),
    //@ts-ignore
    origin("center"),
    "enemy"
  ])

  return e
}
