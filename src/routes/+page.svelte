<script lang="ts">
  import { fitImg } from "$lib/index";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import hljs from "highlight.js/lib/core";
  import javascript from "highlight.js/lib/languages/javascript";
  import "highlight.js/styles/obsidian.css";
  hljs.registerLanguage("javascript", javascript);

  let origCanvas: HTMLCanvasElement,
    rCanvas: HTMLCanvasElement,
    gCanvas: HTMLCanvasElement,
    bCanvas: HTMLCanvasElement,
    blendedCanvas: HTMLCanvasElement,
    animatedCanvas: HTMLCanvasElement;
  let animationId: number;
  let time = 0;
  let animationSpeed = 0.05;
  let displacement = 7;
  let imgIdx = 0;
  const images = ['image-01.jpeg', 'image-02.png', 'image-03.png', 'image-04.jpeg'];

  onMount(() => {
    hljs.highlightAll();
    origCanvas = document.createElement("canvas");
    
    const img = new Image();
    img.onload = () => processImg(img);
    img.src = images[imgIdx];
  });

  function nextImg() {
    imgIdx = (imgIdx+1)%images.length; 
    
    const img = new Image();
    img.onload = () => processImg(img);
    img.src = images[imgIdx];
  }

  function changeImg(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImg(img);
      img.src = event.target!.result! as string;
    };
    reader.readAsDataURL(e.target!.files[0]);
  }

  function processImg(img: HTMLImageElement) {
    const { width, height } = fitImg(img, 270, 550);
    [origCanvas, rCanvas, gCanvas, bCanvas, blendedCanvas].forEach((canvas) => {
      canvas.width = width;
      canvas.height = height;
    });

    // Draw original image
    const origCtx = origCanvas.getContext("2d")!;
    origCtx.drawImage(img, 0, 0, width, height);

    // Create separate color channels
    const rData = new ImageData(width, height);
    const gData = new ImageData(width, height);
    const bData = new ImageData(width, height);

    // Copy image data
    const imgData = origCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      rData.data[i + 0] = data[i + 0];
      rData.data[i + 3] = 255;
      gData.data[i + 1] = data[i + 1];
      gData.data[i + 3] = 255;
      bData.data[i + 2] = data[i + 2];
      bData.data[i + 3] = 255;
    }

    rCanvas.getContext("2d")?.putImageData(rData, 0, 0);
    gCanvas.getContext("2d")?.putImageData(gData, 0, 0);
    bCanvas.getContext("2d")?.putImageData(bData, 0, 0);

    const blendedCtx = blendedCanvas.getContext("2d")!;
    blendedCtx.globalCompositeOperation = "source-over";
    blendedCtx.drawImage(rCanvas, 0, 0);
    blendedCtx.globalCompositeOperation = "screen";
    blendedCtx.drawImage(gCanvas, 0, 0);
    blendedCtx.drawImage(bCanvas, 0, 0);

    // Start animation
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    animate(width, height);
  }

  function animate(width: number, height: number) {
    animatedCanvas.width = width - 2 * displacement;
    animatedCanvas.height = height - 2 * displacement;

    const ctx = animatedCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    time += animationSpeed;

    // Calculate offsets for each channel
    const rOffset = {
      x: Math.sin(time * 0.5) * displacement,
      y: Math.cos(time * 0.7) * displacement,
    };
    const gOffset = {
      x: Math.sin(time * 0.8) * displacement,
      y: Math.cos(time * 0.6) * displacement,
    };
    const bOffset = {
      x: Math.sin(time * 0.9) * displacement,
      y: Math.cos(time * 0.5) * displacement,
    };

    // Draw each channel
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(rCanvas, rOffset.x - displacement, rOffset.y - displacement);
    ctx.drawImage(gCanvas, gOffset.x - displacement, gOffset.y - displacement);
    ctx.drawImage(bCanvas, bOffset.x - displacement, bOffset.y - displacement);

    animationId = requestAnimationFrame(() => animate(width, height));
  }
</script>

<Header />

<main>
  <h1>Chromatic Aberration Effect</h1>
  <p>
    This code demonstrates how to create a dynamic chromatic aberration effect -
    an image distortion technique often seen in glitch art and modern digital
    design. By manipulating individual color channels and applying animation, we
    can create a mesmerizing visual effect that makes images appear to shift and
    separate in a psychedelic way.
  </p>
  <div class="main">
    <div class="effect container">
      <h2>RGB Shift</h2>
      <canvas bind:this={animatedCanvas} />
    </div>

    <div class="controls">
      <h2>Controls</h2>
      <button on:click={nextImg} style="margin-bottom: 1rem;">Next Image</button>
      <input type="file" accept="image/*" on:change={changeImg} />
      <h3>Timestep (speed)</h3>
      <input
        type="range"
        bind:value={animationSpeed}
        min="0"
        max="0.2"
        step="0.01"
        list="tick"
      />
      <datalist id="tick">
        <option value="0" label="0" />
        <option value="0.05" label="0.05" />
        <option value="0.1" label="0.1" />
        <option value="0.15" label="0.15" />
        <option value="0.2" label="0.2" />
      </datalist>
      <h3>Displacement (pixels)</h3>
      <input
        type="range"
        bind:value={displacement}
        min="0"
        max="20"
        step="1"
        list="pixels"
      />
      <datalist id="pixels">
        <option value="0" label="0" />
        <option value="5" label="5" />
        <option value="10" label="10" />
        <option value="15" label="15" />
        <option value="20" label="20" />
      </datalist>
    </div>
    <div class="container">
      <h2>Screen Blend</h2>
      <canvas bind:this={blendedCanvas} />
    </div>
  </div>
  <p>
    At its core, the chromatic aberration effect relies on separating an image
    into its fundamental color components. Our code starts by taking an input
    image, either pre-loaded or uploaded by the user, and splitting it into its
    three primary color channels: Red, Green, and Blue. Each color channel is
    isolated and stored in its own canvas element, giving us complete control
    over how we manipulate each color layer independently.
  </p>

  <div class="layers" style="margin: 2rem 0rem;">
    <div class="container">
      <h2>Red layer</h2>
      <canvas bind:this={rCanvas} />
    </div>
    <div class="container">
      <h2>Green layer</h2>
      <canvas bind:this={gCanvas} />
    </div>
    <div class="container">
      <h2>Blue layer</h2>
      <canvas bind:this={bCanvas} />
    </div>
  </div>

  <p>
    The heart of our effect lies in two primary functions. First, <span
      >processImg()</span
    > handles all the initial image processing tasks. It takes care of resizing the
    image to fit within specified dimensions, methodically separates the image into
    individual R, G, B channels, and creates a blended version of all channels as
    a base state.
  </p>

  <pre class="container">
    <h2>javascript</h2>
    <code>
{`// Create separate color channels
const rData = new ImageData(width, height);
const gData = new ImageData(width, height);
const bData = new ImageData(width, height);

// Copy image data
const imgData = origCtx.getImageData(0, 0, width, height);
const data = imgData.data;
for (let i = 0; i < data.length; i += 4) {
  rData.data[i + 0] = data[i + 0];
  rData.data[i + 3] = 255;
  gData.data[i + 1] = data[i + 1];
  gData.data[i + 3] = 255;
  bData.data[i + 2] = data[i + 2];
  bData.data[i + 3] = 255;
}`}
    </code>
  </pre>

  <p>
    The heart of our effect lies in two primary functions. First, <span
      >processImg()</span
    > handles all the initial image processing tasks. It takes care of resizing the
    image to fit within specified dimensions, methodically separates the image into
    individual R, G, B channels, and creates a blended version of all channels as
    a base state.
  </p>
  <p>
    The real magic happens in the <span>animate()</span> function. Here, each color
    channel is set into motion, moving independently along carefully calculated paths.
    The movement follows smooth sine and cosine patterns, creating an organic flowing
    effect. These separated channels are then blended back together using the "screen"
    composition mode, resulting in a dynamic chromatic aberration effect where colors
    appear to drift apart and reunite in a continuous dance.
  </p>

  <pre class="container">
    <h2>javascript</h2>
      <code>
{`const ctx = animatedCanvas.getContext("2d")!;
ctx.clearRect(0, 0, width, height);
time += animationSpeed;

// Calculate offsets for each channel
const rOffset = {
  x: Math.sin(time * 0.5) * displacement,
  y: Math.cos(time * 0.7) * displacement,
};
const gOffset = {
  x: Math.sin(time * 0.8) * displacement,
  y: Math.cos(time * 0.6) * displacement,
};
const bOffset = {
  x: Math.sin(time * 0.9) * displacement,
  y: Math.cos(time * 0.5) * displacement,
};

// Draw each channel
ctx.globalCompositeOperation = "screen";
ctx.drawImage(rCanvas, rOffset.x - displacement, rOffset.y - displacement);
ctx.drawImage(gCanvas, gOffset.x - displacement, gOffset.y - displacement);
ctx.drawImage(bCanvas, bOffset.x - displacement, bOffset.y - displacement);
`}
      </code>
    </pre>

  <p>
    By combining these elements, we create a captivating visual effect that can
    add a unique dynamic element to any web project. Whether you're creating an
    artistic portfolio, a modern web application, or just experimenting with
    creative coding, this chromatic aberration effect offers an interesting way
    to manipulate and present images.
  </p>
</main>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;
  }
  .container {
    position: relative;
  }
  .container > h2 {
    position: absolute;
    top: -1.2rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1rem;
    color: #f8f9fa;
    background: #39625D;
    border-image: url('/border.png') 8 11 11 8 fill / 8px 11px 11px 8px;
    border-radius: 5px;
    padding: 0.4rem 1rem;
  }
  pre.container > h2 {
    top: 1.2rem;
  }
  pre {
    margin: 0;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .main {
    flex-direction: row;
  }
  .controls {
    gap: 0.25rem;
    margin: 2rem;
  }
  .layers {
    flex-direction: row;
    gap: 1rem;
  }
  canvas,
  code {
    margin: 10px auto;
    color: #f8f9fa;
    background: #39625D;
    border-image: url('/border.png') 8 11 11 8 fill / 8px 11px 11px 8px;
    border-radius: 5px;
    padding: 5px;
    font-family: 'Courier New', Courier, monospace;
  }
  code {
    padding: 15px 30px;
  }
  span {
    font-family: monospace;
    color: var(--secondary-5);
  }
  @media (orientation: portrait) {
    div {
      width: 100%;
      display: flex;
    }
    .main .controls {
      width: 100%;
    }
  }
  datalist {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    writing-mode: vertical-lr;
    width: 256px;
  }
  option {
    padding: 0;
    rotate: 270deg;
  }
  input[type="range"] {
    width: 256px;
    margin: 0;
  }
</style>
