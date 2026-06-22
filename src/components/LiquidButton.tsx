import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type LiquidButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  fillColor?: string;
  hoverTextColor?: string;
  contentClassName?: string;
};

type LiquidButtonAsButton = LiquidButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    as?: 'button';
  };

type LiquidButtonAsAnchor = LiquidButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    as: 'a';
  };

type LiquidButtonProps = LiquidButtonAsButton | LiquidButtonAsAnchor;

export default function LiquidButton(props: LiquidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const {
    children,
    className = '',
    fillColor = '#FFFFFF',
    hoverTextColor,
    contentClassName = '',
    style,
    as = 'button',
    ...rest
  } = props as LiquidButtonProps & { style?: React.CSSProperties };

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const fill = el.querySelector<HTMLElement>('.liquid-fill');
    const wave = el.querySelector<HTMLElement>('.liquid-wave');
    const originalColor = window.getComputedStyle(el).color;

    if (!fill || !wave) return;

    gsap.set(fill, { yPercent: 112, rotate: -1, transformOrigin: 'center bottom' });
    gsap.set(wave, { xPercent: -12, rotate: 0, transformOrigin: 'center center' });

    const enter = () => {
      gsap.killTweensOf([el, fill, wave]);
      gsap.to(el, {
        y: -2,
        scale: 1.025,
        color: hoverTextColor || originalColor,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(fill, {
        yPercent: 0,
        rotate: 0.5,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto'
      });
      gsap.to(wave, {
        xPercent: 8,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        overwrite: 'auto'
      });
    };

    const leave = () => {
      gsap.killTweensOf([el, fill, wave]);
      gsap.to(el, {
        y: 0,
        scale: 1,
        color: originalColor,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(fill, {
        yPercent: 112,
        rotate: -1,
        duration: 0.42,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    };

    const press = () => {
      gsap.to(el, { scale: 0.97, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
    };

    const release = () => {
      gsap.to(el, { scale: 1.025, duration: 0.14, ease: 'back.out(2)', overwrite: 'auto' });
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    el.addEventListener('blur', leave);

    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      el.removeEventListener('mousedown', press);
      el.removeEventListener('mouseup', release);
      el.removeEventListener('blur', leave);
      gsap.killTweensOf([el, fill, wave]);
    };
  }, [fillColor, hoverTextColor]);

  const mergedStyle = {
    ...(style || {}),
    '--liquid-fill': fillColor,
  } as React.CSSProperties;

  const inner = (
    <>
      <span className="liquid-fill" aria-hidden="true">
        <span className="liquid-wave" aria-hidden="true" />
      </span>
      <span className={`liquid-content ${contentClassName}`}>{children}</span>
    </>
  );

  if (as === 'a') {
    const anchorProps = rest as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>;
    return (
      <a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        className={`gsap-liquid ${className}`}
        style={mergedStyle}
        {...anchorProps}
      >
        {inner}
      </a>
    );
  }

  const buttonProps = rest as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;
  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className={`gsap-liquid ${className}`}
      style={mergedStyle}
      {...buttonProps}
    >
      {inner}
    </button>
  );
}
