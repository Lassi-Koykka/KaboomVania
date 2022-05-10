export const setCanvasScale = (canvas: HTMLCanvasElement) => {
  const aspectRatio = canvas.width / canvas.height;

  if (window.innerWidth < window.innerHeight * aspectRatio) {
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  } else {
    canvas.style.width = "auto";
    canvas.style.height = "95vh";
  }
};

