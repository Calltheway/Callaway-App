'use client';

import { useEffect, useRef } from 'react';

export interface ForceFieldBackgroundProps {
  hue?:             number;
  saturation?:      number;
  spacing?:         number;
  minStroke?:       number;
  maxStroke?:       number;
  forceStrength?:   number;
  magnifierRadius?: number;
  friction?:        number;
  restoreSpeed?:    number;
  className?:       string;
}

export function ForceFieldBackground({
  hue             = 151,
  saturation      = 80,
  spacing         = 12,
  minStroke       = 1,
  maxStroke       = 4,
  forceStrength   = 15,
  magnifierRadius = 180,
  friction        = 0.88,
  restoreSpeed    = 0.04,
  className       = '',
}: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p5Ref = useRef<any>(null);

  const propsRef = useRef({ hue, saturation, spacing, minStroke, maxStroke, forceStrength, magnifierRadius, friction, restoreSpeed });
  useEffect(() => {
    propsRef.current = { hue, saturation, spacing, minStroke, maxStroke, forceStrength, magnifierRadius, friction, restoreSpeed };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    import('p5').then(({ default: p5 }) => {
      if (!containerRef.current) return;
      if (p5Ref.current) { p5Ref.current.remove(); p5Ref.current = null; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        let palette: any[] = [];
        let points: { pos: any; orig: any; vel: any; brightness: number }[] = [];
        let mx = 0;
        let my = 0;

        p.setup = () => {
          const { clientWidth, clientHeight } = containerRef.current!;
          p.createCanvas(clientWidth, clientHeight);
          mx = p.width / 2;
          my = p.height / 2;
          buildPalette();
          buildPoints();
        };

        p.windowResized = () => {
          if (!containerRef.current) return;
          p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight);
          buildPoints();
        };

        function buildPalette() {
          palette = [];
          p.push();
          p.colorMode(p.HSL);
          const { hue: h, saturation: s } = propsRef.current;
          for (let i = 0; i < 12; i++) {
            palette.push(p.color(h, s, p.map(i, 0, 11, 85, 20)));
          }
          p.pop();
        }

        function buildPoints() {
          points = [];
          const sp = Math.max(4, propsRef.current.spacing);
          for (let y = 0; y <= p.height; y += sp) {
            for (let x = 0; x <= p.width; x += sp) {
              // Perlin noise offset for organic placement
              const nx = (p.noise(x * 0.004, y * 0.004) - 0.5) * sp * 2;
              const ny = (p.noise(x * 0.004 + 500, y * 0.004 + 500) - 0.5) * sp * 2;
              points.push({
                pos:        p.createVector(x + nx, y + ny),
                orig:       p.createVector(x + nx, y + ny),
                vel:        p.createVector(0, 0),
                brightness: p.random(50, 255),
              });
            }
          }
        }

        p.draw = () => {
          p.background(4, 8, 15); // #04080F keeper-void

          // Smooth mouse tracking
          mx = p.lerp(mx, p.mouseX, 0.12);
          my = p.lerp(my, p.mouseY, 0.12);

          buildPalette();
          p.noFill();
          const pr = propsRef.current;

          for (const pt of points) {
            // Force field repulsion
            const dir = p5.Vector.sub(pt.pos, p.createVector(mx, my));
            const d   = dir.mag();

            if (d < pr.magnifierRadius) {
              dir.normalize();
              pt.vel.add(dir.mult(pr.forceStrength / Math.max(1, d * 0.4)));
            }

            pt.vel.mult(pr.friction);

            // Spring back to origin
            const restore = p5.Vector.sub(pt.pos, pt.orig).mult(-pr.restoreSpeed);
            pt.vel.add(restore);
            pt.pos.add(pt.vel);

            // Color & size
            const br       = pt.brightness;
            const shadeIdx = p.constrain(Math.floor(p.map(br, 0, 255, 0, palette.length - 1)), 0, palette.length - 1);
            let sw         = p.map(br, 0, 255, pr.minStroke, pr.maxStroke);

            // Enlarge near cursor
            if (d < pr.magnifierRadius) sw *= p.map(d, 0, pr.magnifierRadius, 2.8, 1);

            if (palette[shadeIdx]) {
              p.stroke(palette[shadeIdx]);
              p.strokeWeight(sw);
              p.point(pt.pos.x, pt.pos.y);
            }
          }
        };
      };

      p5Ref.current = new p5(sketch, containerRef.current!);
    }).catch(console.error);

    return () => { p5Ref.current?.remove(); p5Ref.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={`w-full h-full bg-[#04080F] ${className}`} />;
}

export default ForceFieldBackground;
