import { useEffect } from 'react';
import { gsap } from 'gsap';

const ORANGE = '#FF7A30';
const OBSIDIAN = '#1C1E1C';
const WHITE = '#FFFFFF';

type LiquidButton = HTMLElement & {
  __madfatLiquidCleanup?: () => void;
};

type LiquidStyle = {
  fill: string;
  text: string;
};

function isDarkBackground(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return false;
  const [, r, g, b] = match.map(Number);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 96;
}

function resolveLiquidStyle(button: HTMLElement): LiquidStyle {
  const computed = window.getComputedStyle(button);
  const darkBase = isDarkBackground(computed.backgroundColor) || button.classList.contains('bg-obsidian');

  // Task utama: tombol orange berubah putih, tombol putih berubah hitam.
  if (button.classList.contains('btn-liquid-orange')) {
    return { fill: WHITE, text: OBSIDIAN };
  }

  if (button.classList.contains('btn-liquid-white')) {
    return darkBase ? { fill: ORANGE, text: WHITE } : { fill: OBSIDIAN, text: WHITE };
  }

  if (button.classList.contains('btn-liquid-obsidian')) {
    return { fill: WHITE, text: OBSIDIAN };
  }

  return { fill: ORANGE, text: WHITE };
}

function ensureLiquidLayer(button: HTMLElement) {
  let liquid = button.querySelector<HTMLElement>(':scope > .gsap-liquid-fill');

  if (!liquid) {
    liquid = document.createElement('span');
    liquid.className = 'gsap-liquid-fill';
    liquid.setAttribute('aria-hidden', 'true');

    button.prepend(liquid);
  }

  return {
    liquid,
    wave: null
  };
}

function getTextTargets(button: HTMLElement) {
  return gsap.utils.toArray<HTMLElement>(
    button.querySelectorAll(':scope > *:not(.gsap-liquid-fill), :scope > *:not(.gsap-liquid-fill) *')
  );
}

function bindLiquidButton(button: LiquidButton) {
  if (button.__madfatLiquidCleanup) return;

  const { liquid } = ensureLiquidLayer(button);

  gsap.set(liquid, {
    xPercent: -50,
    yPercent: -50,
    scale: 0,
    force3D: true,
    transformOrigin: '50% 50%'
  });

  const enter = () => {
    const { fill, text } = resolveLiquidStyle(button);
    const textTargets = getTextTargets(button);

    // Store original computed colors of elements to safely animate back to them
    if (!button.dataset.origColor) {
      button.dataset.origColor = window.getComputedStyle(button).color || '';
    }
    textTargets.forEach((target) => {
      if (!target.dataset.origColor) {
        target.dataset.origColor = window.getComputedStyle(target).color || '';
      }
    });

    button.classList.add('is-liquid-hover');
    gsap.set(liquid, { backgroundColor: fill });

    gsap.to(liquid, {
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.08,
      overwrite: 'auto'
    });

    gsap.to([button, ...textTargets], {
      color: text,
      duration: 0.55,
      ease: 'power2.out',
      delay: 0.08,
      overwrite: 'auto'
    });

    gsap.to(button, {
      y: 1,
      scale: 1.04,
      duration: 0.2,
      ease: 'power2.out',
      delay: 0.08,
      overwrite: 'auto'
    });
  };

  const leave = () => {
    const textTargets = getTextTargets(button);
    button.classList.remove('is-liquid-hover');

    gsap.to(liquid, {
      scale: 0,
      duration: 0.28,
      ease: 'power2.out',
      delay: 0.08,
      overwrite: 'auto'
    });

    gsap.to(button, {
      y: 0,
      scale: 1,
      duration: 0.18,
      ease: 'power2.out',
      delay: 0.08,
      overwrite: 'auto'
    });

    // Animate each text target back to its original color, then clear inline style
    [button, ...textTargets].forEach((target) => {
      const origColor = target.dataset.origColor || '';
      gsap.to(target, {
        color: origColor,
        duration: 0.18,
        ease: 'power2.out',
        delay: 0.08,
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(target, { clearProps: 'color' });
        }
      });
    });
  };

  const down = () => {
    gsap.to(button, {
      scale: 0.985,
      duration: 0.1,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const up = () => {
    gsap.to(button, {
      scale: 1,
      duration: 0.16,
      ease: 'back.out(2)',
      overwrite: 'auto'
    });
  };

  button.addEventListener('mouseenter', enter);
  button.addEventListener('mouseleave', leave);
  button.addEventListener('mousedown', down);
  button.addEventListener('mouseup', up);
  button.addEventListener('blur', leave);

  button.__madfatLiquidCleanup = () => {
    button.removeEventListener('mouseenter', enter);
    button.removeEventListener('mouseleave', leave);
    button.removeEventListener('mousedown', down);
    button.removeEventListener('mouseup', up);
    button.removeEventListener('blur', leave);
    const textTargets = getTextTargets(button);
    gsap.killTweensOf([button, liquid, ...textTargets]);
    delete button.__madfatLiquidCleanup;
  };
}

export function useGsapLiquidButtons(dependencyKey: string) {
  useEffect(() => {
    const mountedButtons = new Set<LiquidButton>();

    const scan = () => {
      document.querySelectorAll<LiquidButton>('.btn-liquid').forEach((button) => {
        bindLiquidButton(button);
        mountedButtons.add(button);
      });
    };

    scan();
    const delayedScan = window.setTimeout(scan, 80);

    const observer = new MutationObserver(scan);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.clearTimeout(delayedScan);
      observer.disconnect();
      mountedButtons.forEach((button) => button.__madfatLiquidCleanup?.());
    };
  }, [dependencyKey]);
}
