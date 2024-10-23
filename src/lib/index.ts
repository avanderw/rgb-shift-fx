// shrink image to fit the max width or height
export function fitImg(
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }
    return { width: width, height: height };
  }
