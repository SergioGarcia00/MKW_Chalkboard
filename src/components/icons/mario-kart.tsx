import type { SVGProps } from "react";

export function ItemBoxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="#FFDC00"
      stroke="#3D3D3D"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="#4A90E2" />
      <path d="M12 17v-1a2 2 0 0 0-2-2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="12" cy="14" r="1" fill="#FFFFFF" />
    </svg>
  );
}

export function BananaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="#FFDC00"
      stroke="#A0522D"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13.62,13.25a6.5,6.5,0,1,1,7.88-7.88" />
      <path d="M18,3a20.81,20.81,0,0,1-5.49,2.15" fill="none" />
    </svg>
  );
}

export function MushroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 12a8 8 0 1 0-16 0Z" fill="#FF4136" stroke="#FFFFFF" strokeWidth="1.5"></path>
      <circle cx="8" cy="12" r="1.5" fill="#FFFFFF"/>
      <circle cx="16" cy="12" r="1.5" fill="#FFFFFF"/>
      <rect x="9" y="16" width="6" height="6" rx="1" fill="#F0E68C" stroke="#A0522D" />
    </svg>
  );
}

export function ShellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="#2ECC40"
      stroke="#FFFFFF"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.63,14.5a8,8,0,1,1,14.74,0" />
      <path d="M12 16.5a4 4 0 0 1-4-4h8a4 4 0 0 1-4 4z" />
      <path d="M12 2v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
}
