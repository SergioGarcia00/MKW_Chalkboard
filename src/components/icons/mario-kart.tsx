import type { SVGProps } from "react";

export function ItemBoxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48"
      height="48"
      {...props}
    >
      <defs>
        <linearGradient id="itemBoxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6e9cff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4a6dff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M40,4H8C5.79,4,4,5.79,4,8v32c0,2.21,1.79,4,4,4h32c2.21,0,4-1.79,4-4V8C44,5.79,42.21,4,40,4z" fill="url(#itemBoxGradient)" />
      <path d="M24,34c-4.42,0-8-3.58-8-8s3.58-8,8-8c1.5,0,2.89,0.42,4.12,1.15C29.98,15.8,27.2,14,24,14 c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10c0-1.1-0.18-2.15-0.5-3.12" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10"/>
      <circle cx="28" cy="22" r="3" fill="#ffffff" />
    </svg>
  );
}

export function BananaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M16.9,13.22a5.5,5.5,0,0,1-7.78-7.78L16.9,13.22Z" fill="#ffd60a"/>
      <path d="M9.12,5.45a5.5,5.5,0,0,1,7.78,7.77" stroke="#3c2f2f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" fill="none"/>
      <path d="M12.9,9.22a1.5,1.5,0,0,1-2.12,0L7.12,5.55a1.5,1.5,0,0,1,0-2.12l.71-.71a1.5,1.5,0,0,1,2.12,0l4.24,4.24a1.5,1.5,0,0,1,0,2.12l-.7.7Z" fill="#3c2f2f"/>
    </svg>
  );
}

export function MushroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M21.1,12.3A9,9,0,0,0,3,12.3Z" fill="#d32f2f"/>
      <circle cx="15.5" cy="8.5" r="2.5" fill="#fafafa"/>
      <circle cx="8.5" cy="8.5" r="2.5" fill="#fafafa"/>
      <rect x="8.5" y="11.5" width="7" height="8" rx="2" fill="#fff3e0"/>
      <circle cx="10.5" cy="15.5" r="1" fill="#4e342e"/>
      <circle cx="13.5" cy="15.5" r="1" fill="#4e342e"/>
    </svg>
  );
}

export function ShellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.06,6.31L4,18a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1l-.06-.69A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Z" fill="#4caf50"/>
      <path d="M5.07,18.3A9,9,0,0,1,4,12a9,9,0,0,1,14.6-6.35" fill="#81c784"/>
      <path d="M5,17l-1,1H20l-1-1Z" fill="#fffde7"/>
    </svg>
  );
}

export function GoldenMushroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M21.1,12.3A9,9,0,0,0,3,12.3Z" fill="#ffc107"/>
      <path d="M17.1,7.3a9,9,0,0,0-10.2,0L12,12Z" fill="#fff8e1"/>
      <rect x="8.5" y="11.5" width="7" height="8" rx="2" fill="#fffde7"/>
      <circle cx="10.5" cy="15.5" r="1" fill="#4e342e"/>
      <circle cx="13.5" cy="15.5" r="1" fill="#4e342e"/>
    </svg>
  );
}

export function MegaMushroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M21.1,12.3A9,9,0,0,0,3,12.3Z" fill="#ff7043"/>
      <circle cx="15.5" cy="8.5" r="2.5" fill="#ffe0b2"/>
      <circle cx="8.5" cy="8.5" r="2.5" fill="#ffe0b2"/>
      <rect x="8.5" y="11.5" width="7" height="8" rx="2" fill="#fff3e0"/>
      <circle cx="10.5" cy="15.5" r="1.5" fill="#4e342e"/>
      <circle cx="13.5" cy="15.5" r="1.5" fill="#4e342e"/>
    </svg>
  );
}

export function RedShellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.06,6.31L4,18a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1l-.06-.69A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Z" fill="#f44336"/>
      <path d="M5.07,18.3A9,9,0,0,1,4,12a9,9,0,0,1,14.6-6.35" fill="#ef9a9a"/>
      <path d="M5,17l-1,1H20l-1-1Z" fill="#fffde7"/>
    </svg>
  );
}

export function BlueShellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.06,6.31L4,18a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1l-.06-.69A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Z" fill="#2196f3"/>
      <path d="M5.07,18.3A9,9,0,0,1,4,12a9,9,0,0,1,14.6-6.35" fill="#90caf9"/>
      <path d="M5,17l-1,1H20l-1-1Z" fill="#fffde7"/>
      <path d="M3.5,9.5l-2-1.5,2-1.5m17,3,2-1.5-2-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FireFlowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="6" fill="#f57c00"/>
      <circle cx="12" cy="12" r="3" fill="#ffb74d"/>
      <path d="M12,2a10,10,0,0,0-3.7,19.2,10,10,0,0,0,7.4,0A10,10,0,0,0,12,2Z" fill="#d84315"/>
      <path d="M12,4a8,8,0,0,0-4.9,14.7,8,8,0,0,0,9.8,0A8,8,0,0,0,12,4Z" fill="#f57c00"/>
      <circle cx="12" cy="12" r="2.5" fill="#fff3e0"/>
    </svg>
  );
}

export function IceFlowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="6" fill="#4fc3f7"/>
      <circle cx="12" cy="12" r="3" fill="#b3e5fc"/>
      <path d="M12,2a10,10,0,0,0-3.7,19.2,10,10,0,0,0,7.4,0A10,10,0,0,0,12,2Z" fill="#03a9f4"/>
      <path d="M12,4a8,8,0,0,0-4.9,14.7,8,8,0,0,0,9.8,0A8,8,0,0,0,12,4Z" fill="#4fc3f7"/>
      <circle cx="12" cy="12" r="2.5" fill="#e1f5fe"/>
    </svg>
  );
}

export function BoomerangFlowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm5,13h-4v4h-2v-4H7v-2h4V7h2v4h4v2Z" fill="#2196F3"/>
      <path d="M14.5,12a2.5,2.5,0,0,1-5,0,2.5,2.5,0,0,1,5,0Z" fill="#fff"/>
    </svg>
  );
}

export function BulletBillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M21.5,12a9.5,9.5,0,1,1-19,0,9.5,9.5,0,0,1,19,0Z" fill="#212121" stroke="#fff" strokeWidth="1"/>
      <path d="M18,12a6,6,0,0,1-6,6,6,6,0,0,1-6-6" fill="none" stroke="#e0e0e0" strokeWidth="1.5"/>
      <path d="M15,9.5a1.5,1.5,0,0,1-3,0,1.5,1.5,0,0,1,3,0Z" fill="#f44336"/>
      <path d="m19.5 15.5-3-3m0-7-3 3" stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function BobOmbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="14" r="8" fill="#212121" stroke="#bdbdbd" strokeWidth="1"/>
      <path d="M12,2V6m-2-1.5H14" stroke="#757575" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="m16 4 2-2" stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="18" width="8" height="4" rx="1.5" fill="#ffc107"/>
    </svg>
  );
}

export function SuperHornIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M18,8a6,6,0,0,0-12,0v8h12Z" fill="#ffc107"/>
      <path d="M6,16v-2h12v2a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2Z" fill="#f44336"/>
      <path d="M10,8a2,2,0,0,1,4,0" fill="#212121"/>
    </svg>
  );
}

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" fill="#ffd700" stroke="#b8860b" strokeWidth="1.5"/>
      <text x="12" y="16" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#b8860b">M</text>
    </svg>
  );
}

export function BooIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2A10,10,0,0,0,3.5,17.4a10,10,0,0,0,17,0A10,10,0,0,0,12,2Zm3.5,11a1.5,1.5,0,0,1-3,0V11a1.5,1.5,0,0,1,3,0Zm-7,0a1.5,1.5,0,0,1-3,0V11a1.5,1.5,0,0,1,3,0Z" fill="#fafafa" stroke="#9e9e9e" strokeWidth="1"/>
      <path d="M12,15.5a4.5,4.5,0,0,1,4.5-4.5h0a4.5,4.5,0,0,1,4.5,4.5" fill="none" stroke="#f48fb1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BlooperIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2A10,10,0,0,0,2,12v6a2,2,0,0,0,2,2H8v-2H4V12a8,8,0,0,1,16,0v4H16v2h4a2,2,0,0,0,2-2V12A10,10,0,0,0,12,2Z" fill="#fafafa" stroke="#424242" strokeWidth="1"/>
      <circle cx="9" cy="11" r="1.5" fill="#212121"/>
      <circle cx="15" cy="11" r="1.5" fill="#212121"/>
    </svg>
  );
}

export function FeatherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M20,12c0-4.42-3.58-8-8-8S4,7.58,4,12a8,8,0,0,0,4,6.92V22h8v-3.08A8,8,0,0,0,20,12Z" fill="#ffc107"/>
      <path d="M12,4a6,6,0,0,1,6,6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SuperStarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,1.5l3.09,6.26L22,9.27l-5,4.87L18.18,21,12,17.77,5.82,21,7,14.14,2,9.27l6.91-1.01Z" fill="#ffeb3b" stroke="#3e2723" strokeWidth="1"/>
      <circle cx="9" cy="10" r="1" fill="#212121"/>
      <circle cx="15" cy="10" r="1" fill="#212121"/>
    </svg>
  );
}

export function LightningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M13,2,3,14h9l-1,8L21,10H12Z" fill="#ffeb3b" stroke="#212121" strokeWidth="1"/>
    </svg>
  );
}

export function HammerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M2,14l8,8,12-12-8-8-12,12" fill="#795548"/>
      <path d="M9.5,13.5l-3-3m11,3-3-3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function KamekIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,2,2,22H22Z" fill="#4a148c"/>
      <path d="M12,5.5,5,19h14Z" fill="#9c27b0"/>
      <circle cx="12" cy="18" r="2.5" fill="#fdd835"/>
    </svg>
  );
}

export function DashFoodIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5A5.47,5.47,0,0,1,7.5,3,5.47,5.47,0,0,1,12,5.09,5.47,5.47,0,0,1,16.5,3,5.47,5.47,0,0,1,22,8.5c0,3.78-3.4,6.86-8.55,11.54Z" fill="#e91e63" stroke="#fff" strokeWidth="1"/>
    </svg>
  );
}
