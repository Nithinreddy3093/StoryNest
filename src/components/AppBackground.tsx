import React from 'react';

interface AppBackgroundProps {
  isReadingPage?: boolean;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ isReadingPage = false }) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* 1. Base Deep Twilight Canvas */}
      <div className="absolute inset-0 bg-[#070b14]" />

      {/* 2. Panoramic Sunset Sky & Sea Gradient Backing */}
      <div
        className="absolute inset-0 opacity-90 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(circle at 75% 62%, rgba(245, 158, 11, 0.35) 0%, rgba(234, 88, 12, 0.25) 18%, rgba(124, 45, 18, 0.15) 35%, transparent 65%),
            radial-gradient(circle at 35% 65%, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.1) 25%, transparent 50%),
            linear-gradient(180deg, 
              #030712 0%, 
              #070d1d 25%, 
              #0f172a 45%, 
              #1e1b4b 55%, 
              #431407 68%, 
              #7c2d12 74%, 
              #b45309 79%, 
              #0b1329 83%, 
              #050811 100%
            )
          `,
        }}
      />

      {/* 3. Detailed SVG Scene: Sunset Horizon, Ocean Reflections, Open Book, Coffee Mug, Glowing Lantern & Stars */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Star Twinkle Filter */}
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>

          {/* Setting Sun Glow */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fde047" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="85%" stopColor="#ea580c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>

          {/* Lantern Flame Core Glow */}
          <radialGradient id="lanternFlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>

          {/* Wide Ambient Lantern Light Field */}
          <radialGradient id="lanternAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#d97706" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#b45309" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>

          {/* Water Surface Shimmer */}
          <linearGradient id="waterHorizon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#080e1a" stopOpacity="1" />
          </linearGradient>

          {/* Sun Reflection on Water */}
          <linearGradient id="waterSunReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#c2410c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
          </linearGradient>

          {/* Wooden Deck Linear Gradient */}
          <linearGradient id="woodPlankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a120c" />
            <stop offset="30%" stopColor="#130d08" />
            <stop offset="100%" stopColor="#080503" />
          </linearGradient>

          {/* Book Page Gradient */}
          <linearGradient id="bookPageGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3d2b1f" />
            <stop offset="25%" stopColor="#785338" />
            <stop offset="70%" stopColor="#d4a373" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#faedcd" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="bookPageGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2b1f" />
            <stop offset="20%" stopColor="#8c6239" />
            <stop offset="60%" stopColor="#e6ccb2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#faedcd" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 3a. Distant Twilight Stars */}
        <g opacity="0.85" className="animate-pulse" style={{ animationDuration: '4s' }}>
          <circle cx="120" cy="110" r="1.5" fill="url(#starGlow)" />
          <circle cx="280" cy="80" r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="450" cy="140" r="1.8" fill="url(#starGlow)" />
          <circle cx="620" cy="95" r="1.2" fill="#ffffff" opacity="0.8" />
          <circle cx="780" cy="160" r="1.5" fill="#fef08a" opacity="0.7" />
          <circle cx="950" cy="70" r="2" fill="url(#starGlow)" />
          <circle cx="1120" cy="120" r="1" fill="#ffffff" opacity="0.6" />
          <circle cx="1340" cy="85" r="1.6" fill="url(#starGlow)" />
          <circle cx="1520" cy="150" r="1.2" fill="#ffffff" opacity="0.7" />
          <circle cx="1710" cy="100" r="1.8" fill="url(#starGlow)" />
          <circle cx="1840" cy="130" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="340" cy="220" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="890" cy="240" r="1.2" fill="#fef08a" opacity="0.6" />
          <circle cx="1620" cy="210" r="1.5" fill="url(#starGlow)" />
        </g>

        {/* 3b. Atmospheric Sunset Clouds */}
        <g opacity="0.35">
          <path
            d="M0,420 Q300,380 600,410 T1200,390 T1800,430 L1920,440 L1920,560 L0,560 Z"
            fill="#581c87"
            opacity="0.25"
          />
          <path
            d="M0,460 Q400,430 850,450 T1600,440 L1920,470 L1920,620 L0,620 Z"
            fill="#9a3412"
            opacity="0.35"
          />
          <path
            d="M200,490 Q650,470 1100,500 T1920,480 L1920,640 L0,640 Z"
            fill="#c2410c"
            opacity="0.4"
          />
          <path
            d="M0,530 Q500,510 1000,540 T1920,520 L1920,650 L0,650 Z"
            fill="#ea580c"
            opacity="0.3"
          />
        </g>

        {/* 3c. Distant Mountain Silhouettes & Island Horizon */}
        <path
          d="M0,630 Q250,615 500,628 T1100,622 T1600,626 T1920,630 L1920,645 L0,645 Z"
          fill="#1e1026"
          opacity="0.8"
        />

        {/* 3d. Setting Sun at Horizon (Right of Center, aligning with lantern & view) */}
        <circle cx="1450" cy="625" r="45" fill="url(#sunGlow)" opacity="0.9" />
        <circle cx="1450" cy="625" r="14" fill="#fffbeb" />

        {/* 3e. Ocean / Calm Water Surface */}
        <rect x="0" y="635" width="1920" height="235" fill="url(#waterHorizon)" />

        {/* Sunset Sun Reflection on Water */}
        <polygon
          points="1430,635 1470,635 1520,870 1380,870"
          fill="url(#waterSunReflection)"
          opacity="0.6"
        />

        {/* Water Ripples / Shimmers */}
        <g opacity="0.3" stroke="#fed7aa" strokeWidth="1">
          <line x1="1410" y1="645" x2="1490" y2="645" />
          <line x1="1390" y1="660" x2="1510" y2="660" />
          <line x1="1370" y1="680" x2="1530" y2="680" strokeWidth="1.5" />
          <line x1="1350" y1="710" x2="1550" y2="710" strokeWidth="2" />
          <line x1="1320" y1="750" x2="1580" y2="750" strokeWidth="2.5" />
          <line x1="1280" y1="800" x2="1620" y2="800" strokeWidth="3" />
        </g>

        {/* 3f. Weathered Rustic Wooden Dock in Foreground */}
        <g id="wooden-dock">
          {/* Main Table / Dock Surface */}
          <polygon
            points="0,850 1920,830 1920,1080 0,1080"
            fill="url(#woodPlankGrad)"
          />

          {/* Wooden Plank Lines & Grain Texture */}
          <line x1="0" y1="890" x2="1920" y2="875" stroke="#000000" strokeWidth="3" opacity="0.7" />
          <line x1="0" y1="940" x2="1920" y2="925" stroke="#000000" strokeWidth="4" opacity="0.8" />
          <line x1="0" y1="1000" x2="1920" y2="985" stroke="#000000" strokeWidth="4" opacity="0.85" />
          <line x1="0" y1="1060" x2="1920" y2="1045" stroke="#000000" strokeWidth="5" opacity="0.9" />

          {/* Wood Planks Warm Highlight from Lantern & Sunset */}
          <polygon
            points="700,850 1920,830 1920,1080 850,1080"
            fill="url(#lanternAmbientGlow)"
            opacity="0.65"
          />
        </g>

        {/* 3g. Wide Ambient Lantern Glow on Scene */}
        <circle cx="1730" cy="740" r="450" fill="url(#lanternAmbientGlow)" />

        {/* 3h. Open Manuscript / Book on the Wooden Table */}
        <g id="open-book" transform="translate(720, 710) scale(1.15)">
          {/* Book Shadow */}
          <path
            d="M 50,225 C 180,240 380,240 520,225 C 480,265 100,265 50,225 Z"
            fill="#000000"
            opacity="0.7"
          />

          {/* Book Cover / Spine Underlay */}
          <path
            d="M 55,215 Q 285,230 515,215 L 518,222 Q 285,238 52,222 Z"
            fill="#29180d"
          />

          {/* Left Pages Block (Curved Pages) */}
          <path
            d="M 60,210 C 130,170 230,175 285,215 C 285,200 285,165 285,150 C 225,115 130,110 60,150 Z"
            fill="url(#bookPageGradLeft)"
          />

          {/* Right Pages Block (Curved Pages) */}
          <path
            d="M 285,215 C 340,175 440,170 510,210 L 510,150 C 440,110 345,115 285,150 Z"
            fill="url(#bookPageGradRight)"
          />

          {/* Top Page Left Leaf (Fanned Out) */}
          <path
            d="M 68,145 C 135,108 225,114 285,148 L 285,212 C 225,178 135,172 68,206 Z"
            fill="#fff8ed"
            opacity="0.9"
          />

          {/* Top Page Right Leaf (Fanned Out) */}
          <path
            d="M 285,148 C 345,114 435,108 502,145 L 502,206 C 435,172 345,178 285,212 Z"
            fill="#fffaf0"
            opacity="0.95"
          />

          {/* Center Spine Crease */}
          <line x1="285" y1="148" x2="285" y2="214" stroke="#451a03" strokeWidth="2.5" opacity="0.85" />

          {/* Text Lines on Left Page */}
          <g opacity="0.35" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round">
            <line x1="100" y1="135" x2="250" y2="138" />
            <line x1="95" y1="145" x2="255" y2="148" />
            <line x1="92" y1="155" x2="255" y2="158" />
            <line x1="90" y1="165" x2="255" y2="168" />
            <line x1="88" y1="175" x2="255" y2="178" />
            <line x1="86" y1="185" x2="255" y2="188" />
            <line x1="85" y1="195" x2="230" y2="197" />
          </g>

          {/* Text Lines on Right Page (Illuminated by Lantern) */}
          <g opacity="0.4" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round">
            <line x1="315" y1="138" x2="470" y2="135" />
            <line x1="315" y1="148" x2="475" y2="145" />
            <line x1="315" y1="158" x2="478" y2="155" />
            <line x1="315" y1="168" x2="480" y2="165" />
            <line x1="315" y1="178" x2="482" y2="175" />
            <line x1="315" y1="188" x2="482" y2="185" />
            <line x1="315" y1="197" x2="450" y2="195" />
          </g>

          {/* Page Edge Highlights */}
          <path
            d="M 68,145 C 135,108 225,114 285,148 C 345,114 435,108 502,145"
            fill="none"
            stroke="#fef3c7"
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* 3i. Coffee Mug beside the book */}
        <g id="coffee-mug" transform="translate(1380, 755) scale(0.95)">
          {/* Mug Shadow */}
          <ellipse cx="60" cy="135" rx="45" ry="14" fill="#000000" opacity="0.65" />

          {/* Mug Handle */}
          <path
            d="M 95,45 C 140,45 140,110 95,110 L 95,95 C 120,95 120,60 95,60 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Mug Body */}
          <path
            d="M 25,35 L 32,125 C 32,135 88,135 88,125 L 95,35 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Warm Highlight on Mug Side (Facing Lantern) */}
          <path
            d="M 75,35 L 72,125 C 80,123 88,120 88,120 L 95,35 Z"
            fill="#f59e0b"
            opacity="0.25"
          />

          {/* Mug Rim & Coffee Liquid Surface */}
          <ellipse cx="60" cy="35" rx="35" ry="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <ellipse cx="60" cy="36" rx="30" ry="9" fill="#1c120c" />
          <ellipse cx="68" cy="36" rx="14" ry="4" fill="#f59e0b" opacity="0.3" />

          {/* Subtle Steaming Vapor */}
          <path
            d="M 55,25 Q 50,10 60,0 T 55,-20"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.25"
            className="animate-pulse"
          />
          <path
            d="M 68,22 Q 75,8 65,-2 T 70,-22"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.2"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </g>

        {/* 3j. Vintage Kerosene Lantern (Right Foreground) */}
        <g id="vintage-lantern" transform="translate(1620, 500) scale(1.05)">
          {/* Lantern Cast Shadow */}
          <ellipse cx="110" cy="410" rx="90" ry="24" fill="#000000" opacity="0.8" />

          {/* Top Hanging Ring */}
          <circle
            cx="110"
            cy="35"
            r="20"
            fill="none"
            stroke="#1c1917"
            strokeWidth="6"
          />
          <circle
            cx="110"
            cy="35"
            r="20"
            fill="none"
            stroke="#d97706"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Lantern Top Cap / Ventilator Hood */}
          <path
            d="M 85,55 L 135,55 L 145,85 L 75,85 Z"
            fill="#1c1917"
            stroke="#0c0a09"
            strokeWidth="2"
          />
          <ellipse cx="110" cy="85" rx="35" ry="8" fill="#292524" />

          {/* Tiered Dome */}
          <path
            d="M 65,90 C 65,80 155,80 155,90 L 165,125 C 165,135 55,135 55,125 Z"
            fill="#1c1917"
            stroke="#0c0a09"
            strokeWidth="2"
          />

          {/* Lantern Side Metal Guard Tubes / Handles */}
          <path
            d="M 60,120 C 15,140 10,300 55,340"
            fill="none"
            stroke="#1c1917"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 160,120 C 205,140 210,300 165,340"
            fill="none"
            stroke="#1c1917"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Metal Wire Guards around Glass */}
          <path
            d="M 70,140 L 70,330 M 150,140 L 150,330 M 110,135 L 110,335"
            fill="none"
            stroke="#292524"
            strokeWidth="3"
            opacity="0.8"
          />

          {/* Glass Chimney (Outer Frame) */}
          <path
            d="M 75,135 C 50,220 50,260 70,330 L 150,330 C 170,260 170,220 145,135 Z"
            fill="rgba(254, 240, 138, 0.12)"
            stroke="rgba(254, 243, 199, 0.4)"
            strokeWidth="2"
          />

          {/* Kerosene Lantern Radiant Glow */}
          <circle cx="110" cy="245" r="95" fill="url(#lanternFlameGlow)" opacity="0.95" />

          {/* Lantern Flame Core (Tear-Drop) */}
          <path
            d="M 110,195 C 122,230 128,255 110,265 C 92,255 98,230 110,195 Z"
            fill="#ffffff"
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          <path
            d="M 110,205 C 118,232 122,252 110,260 C 98,252 102,232 110,205 Z"
            fill="#fef08a"
          />

          {/* Glass Specular Highlights */}
          <path
            d="M 85,150 C 65,220 65,250 80,315"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Lower Collar / Burner Assembly */}
          <ellipse cx="110" cy="335" rx="45" ry="10" fill="#292524" stroke="#1c1917" strokeWidth="2" />

          {/* Oil Font / Fuel Tank Base */}
          <path
            d="M 60,340 C 45,350 45,395 60,405 L 160,405 C 175,395 175,350 160,340 Z"
            fill="#1c1917"
            stroke="#0c0a09"
            strokeWidth="2"
          />
          <ellipse cx="110" cy="405" rx="55" ry="12" fill="#292524" />
        </g>
      </svg>

      {/* 4. Soft Ambient Lighting Shimmers & Vignette */}
      {/* Warm Golden Horizon Wash */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/80 via-[#070b14]/50 to-transparent" />

      {/* Global Vignette for High Content Contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: isReadingPage
            ? 'radial-gradient(ellipse at center, rgba(7, 11, 20, 0.85) 20%, rgba(3, 7, 18, 0.98) 100%)'
            : 'radial-gradient(ellipse at 50% 40%, rgba(7, 11, 20, 0.3) 0%, rgba(7, 11, 20, 0.75) 75%, rgba(3, 7, 18, 0.92) 100%)',
        }}
      />
    </div>
  );
};
