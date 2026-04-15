'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ForceFieldBackgroundProps {
  imageUrl?:        string;
  hue?:             number;
  saturation?:      number;
  threshold?:       number;
  minStroke?:       number;
  maxStroke?:       number;
  spacing?:         number;
  noiseScale?:      number;
  density?:         number;
  invertImage?:     boolean;
  invertWireframe?: boolean;
  magnifierEnabled?: boolean;
  magnifierRadius?: number;
  forceStrength?:   number;
  friction?:        number;
  restoreSpeed?:    number;
  className?:       string;
}

export function ForceFieldBackground({
  imageUrl        = 'https://cdn.pixabay.com/photo/2024/12/13/20/29/alps-9266131_1280.jpg',
  hue             = 210,
  saturation      = 100,
  threshold       = 255,
  minStroke       = 2,
  maxStroke       = 6,
  spacing         = 10,
  noiseScale      = 0,
  density         = 2.0,
  invertImage     = true,
  invertWireframe = true,
  magnifierEnabled = true,
  magnifierRadius = 150,
  forceStrength   = 10,
  friction        = 0.9,
  restoreSpeed    = 0.05,
  className       = '',
}: ForceFieldBackgroundProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p5InstanceRef  = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const propsRef = useRef({
    hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
    density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
    forceStrength, friction, restoreSpeed,
  });

  useEffect(() => {
    propsRef.current = {
      hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed,
    };
  }, [hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (p5InstanceRef.current) { p5InstanceRef.current.remove(); }

    // p5 requires the browser — load it dynamically so SSR is safe
    import('p5').then(({ default: p5 }) => {
      if (!containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        let originalImg: any;
        let img: any;
        let palette: any[] = [];
        let points: { pos: any; originalPos: any; vel: any }[] = [];

        let lastHue         = -1;
        let lastSaturation  = -1;
        let lastSpacing     = -1;
        let lastNoiseScale  = -1;
        let lastDensity     = -1;
        let lastInvertImage: boolean | null = null;
        let magnifierX      = 0;
        let magnifierY      = 0;
        const magnifierInertia = 0.1;

        p.preload = () => {
          p.loadImage(
            imageUrl,
            (loaded: any) => { originalImg = loaded; setIsLoading(false); },
            () => { setError('Failed to load image'); setIsLoading(false); },
          );
        };

        p.setup = () => {
          if (!originalImg) return;
          const { clientWidth, clientHeight } = containerRef.current!;
          p.createCanvas(clientWidth, clientHeight);
          magnifierX = p.width / 2;
          magnifierY = p.height / 2;
          processImage();
          generatePalette(propsRef.current.hue, propsRef.current.saturation);
          generatePoints();
        };

        p.windowResized = () => {
          if (!containerRef.current || !originalImg) return;
          const { clientWidth, clientHeight } = containerRef.current;
          p.resizeCanvas(clientWidth, clientHeight);
          processImage();
          generatePoints();
        };

        function processImage() {
          if (!originalImg) return;
          img = originalImg.get();
          if (p.width > 0 && p.height > 0) img.resize(p.width, p.height);
          img.filter(p.GRAY);
          if (propsRef.current.invertImage) {
            img.loadPixels();
            for (let i = 0; i < img.pixels.length; i += 4) {
              img.pixels[i]     = 255 - img.pixels[i];
              img.pixels[i + 1] = 255 - img.pixels[i + 1];
              img.pixels[i + 2] = 255 - img.pixels[i + 2];
            }
            img.updatePixels();
          }
          lastInvertImage = propsRef.current.invertImage;
        }

        function generatePalette(h: number, s: number) {
          palette = [];
          p.push();
          p.colorMode(p.HSL);
          for (let i = 0; i < 12; i++) {
            const l = p.map(i, 0, 11, 95, 5);
            palette.push(p.color(h, s, l));
          }
          p.pop();
        }

        function generatePoints() {
          if (!img) return;
          points = [];
          const { spacing: sp, density: dn, noiseScale: ns } = propsRef.current;
          const safeSpacing = Math.max(2, sp);
          for (let y = 0; y < img.height; y += safeSpacing) {
            for (let x = 0; x < img.width; x += safeSpacing) {
              if (p.random() > dn) continue;
              const nx = p.noise(x * ns, y * ns) - 0.5;
              const ny = p.noise((x + 500) * ns, (y + 500) * ns) - 0.5;
              const px = x + nx * safeSpacing;
              const py = y + ny * safeSpacing;
              points.push({
                pos:         p.createVector(px, py),
                originalPos: p.createVector(px, py),
                vel:         p.createVector(0, 0),
              });
            }
          }
          lastSpacing    = sp;
          lastNoiseScale = ns;
          lastDensity    = dn;
        }

        function applyForceField(mx: number, my: number) {
          const pr = propsRef.current;
          if (!pr.magnifierEnabled) return;
          for (const pt of points) {
            const dir = p5.Vector.sub(pt.pos, p.createVector(mx, my));
            const d   = dir.mag();
            if (d < pr.magnifierRadius) {
              dir.normalize();
              const force = dir.mult(pr.forceStrength / Math.max(1, d));
              pt.vel.add(force);
            }
            pt.vel.mult(pr.friction);
            const restore = p5.Vector.sub(pt.pos, pt.originalPos).mult(-pr.restoreSpeed);
            pt.vel.add(restore);
            pt.pos.add(pt.vel);
          }
        }

        p.draw = () => {
          if (!img) return;
          p.background(4, 8, 15); // #04080F — keeper-void

          const pr = propsRef.current;

          if (pr.hue !== lastHue || pr.saturation !== lastSaturation) {
            generatePalette(pr.hue, pr.saturation);
            lastHue = pr.hue; lastSaturation = pr.saturation;
          }
          if (pr.invertImage !== lastInvertImage) processImage();
          if (pr.spacing !== lastSpacing || pr.noiseScale !== lastNoiseScale || pr.density !== lastDensity) {
            generatePoints();
          }

          magnifierX = p.lerp(magnifierX, p.mouseX, magnifierInertia);
          magnifierY = p.lerp(magnifierY, p.mouseY, magnifierInertia);
          applyForceField(magnifierX, magnifierY);

          img.loadPixels();
          p.noFill();

          for (const pt of points) {
            const x  = pt.pos.x;
            const y  = pt.pos.y;
            const d  = p.dist(x, y, magnifierX, magnifierY);
            const px = p.constrain(p.floor(x), 0, img.width  - 1);
            const py = p.constrain(p.floor(y), 0, img.height - 1);
            const bi = (px + py * img.width) * 4;
            const br = img.pixels[bi];
            if (br === undefined) continue;

            const condition = pr.invertWireframe ? br < pr.threshold : br > pr.threshold;
            if (!condition) continue;

            let shadeIdx = p.constrain(Math.floor(p.map(br, 0, 255, 0, palette.length - 1)), 0, palette.length - 1);
            let sw       = p.map(br, 0, 255, pr.minStroke, pr.maxStroke);
            if (pr.magnifierEnabled && d < pr.magnifierRadius) {
              sw *= p.map(d, 0, pr.magnifierRadius, 2.2, 1);
            }
            if (palette[shadeIdx]) {
              p.stroke(palette[shadeIdx]);
              p.strokeWeight(sw);
              p.point(x, y);
            }
          }
        };
      };

      const instance = new p5(sketch, containerRef.current!);
      p5InstanceRef.current = instance;
    });

    return () => { p5InstanceRef.current?.remove(); };
  }, [imageUrl]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-keeper-void">
          <div className="flex items-center gap-2 text-keeper-muted text-xs font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />
            Initializing Force Field…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-keeper-void" />
      )}
    </div>
  );
}

export default ForceFieldBackground;
