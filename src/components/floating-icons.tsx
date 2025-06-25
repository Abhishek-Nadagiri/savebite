'use client';

import { Apple, Carrot } from 'lucide-react';
import React from 'react';

const PizzaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 11h.01" />
    <path d="M11 15h.01" />
    <path d="M16 16h.01" />
    <path d="m2 16 2.24 1.26a4 4 0 0 0 4.12-1.26L19 5" />
    <path d="m22 14-5.24-1.26a4 4 0 0 0-4.12 1.26L2 21" />
  </svg>
);

const SandwichIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 11h18a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
    <path d="M12 11V8" />
    <path d="M7 11V8" />
    <path d="M17 11V8" />
    <path d="M3 11a7.8 7.8 0 0 1 9-7 7.8 7.8 0 0 1 9 7" />
  </svg>
);

const SaladIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 20h20" />
        <path d="M10 4v2" />
        <path d="M14 4v2" />
        <path d="M12 14a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z" />
        <path d="M12 20a8 8 0 0 0 8-8H4a8 8 0 0 0 8 8z" />
    </svg>
);


const icons = [
  { Icon: Apple, style: { top: '10%', left: '10%', animationDelay: '0s' } },
  { Icon: Carrot, style: { top: '20%', left: '80%', animationDelay: '1s' } },
  { Icon: PizzaIcon, style: { top: '70%', left: '15%', animationDelay: '2s' } },
  { Icon: SandwichIcon, style: { top: '80%', left: '70%', animationDelay: '3s' } },
  { Icon: SaladIcon, style: { top: '40%', left: '50%', animationDelay: '4s' } },
  { Icon: Apple, style: { top: '90%', left: '5%', animationDelay: '5s' } },
  { Icon: Carrot, style: { top: '5%', left: '40%', animationDelay: '6s' } },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {icons.map(({ Icon, style }, index) => (
        <Icon
          key={index}
          className="absolute text-primary/10 animate-float"
          style={{
            ...style,
            width: 'clamp(40px, 8vw, 80px)',
            height: 'auto',
            animationDuration: `${10 + index * 2}s`
          }}
        />
      ))}
    </div>
  );
}
