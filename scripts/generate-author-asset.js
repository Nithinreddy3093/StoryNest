import fs from 'fs';
import path from 'path';

// Ensure public directories exist
const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate high-resolution SVG matching the exact uploaded katana & suit image
const authorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <!-- Background Radial Gradients for Smoke & Backlight -->
    <radialGradient id="backlightGlow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#fff8ed" stop-opacity="0.95" />
      <stop offset="25%" stop-color="#f5d6a0" stop-opacity="0.75" />
      <stop offset="55%" stop-color="#8a6338" stop-opacity="0.4" />
      <stop offset="80%" stop-color="#241b12" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0a0806" stop-opacity="1" />
    </radialGradient>

    <radialGradient id="smokeCenter" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#d4b483" stop-opacity="0.3" />
      <stop offset="40%" stop-color="#8c6c48" stop-opacity="0.2" />
      <stop offset="85%" stop-color="#000000" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#050505" stop-opacity="1" />
    </radialGradient>

    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1c1f" />
      <stop offset="30%" stop-color="#141416" />
      <stop offset="70%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#030304" />
    </linearGradient>

    <linearGradient id="suitHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4a3e30" stop-opacity="0.8" />
      <stop offset="15%" stop-color="#1a1816" stop-opacity="0.2" />
      <stop offset="85%" stop-color="#1a1816" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#4a3e30" stop-opacity="0.8" />
    </linearGradient>

    <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#222226" />
      <stop offset="100%" stop-color="#0f0f12" />
    </linearGradient>

    <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1a1e" />
      <stop offset="100%" stop-color="#0a0a0d" />
    </linearGradient>

    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b07854" />
      <stop offset="50%" stop-color="#915b39" />
      <stop offset="100%" stop-color="#6e4227" />
    </linearGradient>

    <linearGradient id="skinHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e8b990" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#915b39" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#e8b990" stop-opacity="0.6" />
    </linearGradient>

    <linearGradient id="glassesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#151518" />
      <stop offset="40%" stop-color="#050508" />
      <stop offset="70%" stop-color="#1e1e24" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </linearGradient>

    <linearGradient id="katanaGuardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e63946" />
      <stop offset="40%" stop-color="#d62828" />
      <stop offset="70%" stop-color="#9d0208" />
      <stop offset="100%" stop-color="#370617" />
    </linearGradient>

    <linearGradient id="katanaBladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1a1a1a" />
      <stop offset="50%" stop-color="#4a4a4a" />
      <stop offset="100%" stop-color="#111111" />
    </linearGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="smokeBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="1200" fill="#080706" />

  <!-- Center Backlight Spotlight -->
  <circle cx="600" cy="520" r="500" fill="url(#backlightGlow)" />
  
  <!-- Smoky Atmosphere Layers -->
  <ellipse cx="600" cy="500" rx="550" ry="420" fill="url(#smokeCenter)" filter="url(#smokeBlur)" />
  <circle cx="350" cy="400" r="280" fill="#c49a6c" opacity="0.15" filter="url(#smokeBlur)" />
  <circle cx="850" cy="400" r="280" fill="#c49a6c" opacity="0.15" filter="url(#smokeBlur)" />
  <circle cx="600" cy="700" r="350" fill="#7a5432" opacity="0.2" filter="url(#smokeBlur)" />

  <!-- Back Rim Light on Silhouette -->
  <ellipse cx="600" cy="620" rx="280" ry="450" fill="#ffdfba" opacity="0.25" filter="url(#smokeBlur)" />

  <!-- Main Figure Group (Nithin Reddy) -->
  <g id="figure">
    <!-- Suit Body / Torso -->
    <path d="M 410 440 L 330 680 L 350 960 L 450 1200 L 750 1200 L 850 960 L 870 680 L 790 440 Z" fill="url(#suitGrad)" />
    <!-- Suit Outer Rim Light Strokes -->
    <path d="M 410 440 L 330 680 L 350 960 L 370 1200" stroke="#f0c28a" stroke-width="5" stroke-opacity="0.7" fill="none" filter="url(#softGlow)" />
    <path d="M 790 440 L 870 680 L 850 960 L 830 1200" stroke="#f0c28a" stroke-width="5" stroke-opacity="0.7" fill="none" filter="url(#softGlow)" />

    <!-- Suit Texture and Folds -->
    <path d="M 430 450 L 360 690 L 375 950 L 460 1200" fill="url(#suitHighlight)" />
    <path d="M 770 450 L 840 690 L 825 950 L 740 1200" fill="url(#suitHighlight)" />

    <!-- Inner Shirt (Open V-Neck) -->
    <path d="M 520 420 L 600 660 L 680 420 Z" fill="url(#shirtGrad)" />
    <!-- Exposed Chest & Neck Skin -->
    <path d="M 545 350 L 545 430 L 600 530 L 655 430 L 655 350 Z" fill="url(#skinGrad)" />
    <path d="M 545 350 L 545 430 L 600 530 L 655 430 L 655 350 Z" fill="url(#skinHighlight)" />

    <!-- Silver Chain Necklace -->
    <path d="M 565 390 Q 600 480 635 390" stroke="#dcdde1" stroke-width="3.5" fill="none" stroke-linecap="round" filter="url(#softGlow)" />
    <circle cx="600" cy="460" r="4.5" fill="#f5f6fa" filter="url(#softGlow)" />

    <!-- Open Shirt Collars -->
    <path d="M 520 400 L 565 520 L 540 525 L 495 430 Z" fill="#18181c" stroke="#000" stroke-width="1.5" />
    <path d="M 680 400 L 635 520 L 660 525 L 705 430 Z" fill="#18181c" stroke="#000" stroke-width="1.5" />

    <!-- Suit Lapels (Left & Right) -->
    <path d="M 440 440 L 540 680 L 590 850 L 520 850 L 410 580 Z" fill="url(#lapelGrad)" stroke="#2f2f35" stroke-width="1.5" />
    <path d="M 760 440 L 660 680 L 610 850 L 680 850 L 790 580 Z" fill="url(#lapelGrad)" stroke="#2f2f35" stroke-width="1.5" />

    <!-- Left Suit Button & Center Crease -->
    <circle cx="600" cy="740" r="6" fill="#1e1e24" stroke="#444" stroke-width="1" />
    <line x1="600" y1="740" x2="600" y2="860" stroke="#08080a" stroke-width="3" />

    <!-- Belt & Silver Buckle -->
    <rect x="520" y="860" width="160" height="28" rx="4" fill="#0c0c0e" stroke="#1c1c20" stroke-width="1.5" />
    <rect x="580" y="856" width="40" height="36" rx="4" fill="none" stroke="#dcdde1" stroke-width="4.5" filter="url(#softGlow)" />
    <line x1="600" y1="860" x2="600" y2="888" stroke="#dcdde1" stroke-width="4" />

    <!-- Suit Trousers -->
    <path d="M 470 888 L 440 1200 L 580 1200 L 590 980 L 600 980 L 610 980 L 620 1200 L 760 1200 L 730 888 Z" fill="#09090c" />
    <line x1="535" y1="910" x2="515" y2="1200" stroke="#1a1a22" stroke-width="2" />
    <line x1="665" y1="910" x2="685" y2="1200" stroke="#1a1a22" stroke-width="2" />

    <!-- Left Arm & Hand Holding Katana -->
    <!-- Left Forearm angled downwards holding tsuka -->
    <path d="M 680 720 L 740 920 L 690 970 L 640 850 Z" fill="#121215" stroke="#2a2a30" stroke-width="1" />
    <!-- Left Hand / Fingers Wrapped Around Tsuka -->
    <ellipse cx="680" cy="980" rx="36" ry="26" fill="url(#skinGrad)" />
    <path d="M 650 960 Q 675 950 705 965 Q 710 990 680 1005 Q 655 1000 650 960 Z" fill="url(#skinGrad)" stroke="#422513" stroke-width="2" />
    <!-- Knuckles & Finger Segments -->
    <path d="M 660 965 L 685 970" stroke="#422513" stroke-width="2" />
    <path d="M 660 978 L 690 982" stroke="#422513" stroke-width="2" />
    <path d="M 662 990 L 688 995" stroke="#422513" stroke-width="2" />

    <!-- KATANA SWORD (Held Across Waist / Thigh) -->
    <g id="katana" transform="rotate(-18 680 980)">
      <!-- Blade / Scabbard (Saya extending downward left) -->
      <path d="M 680 985 L 1050 1010 L 1045 1032 L 680 1007 Z" fill="url(#katanaBladeGrad)" stroke="#050505" stroke-width="1.5" />
      <path d="M 680 990 L 1040 1014" stroke="#333338" stroke-width="2" />

      <!-- Tsuba (Decorative Japanese Red & Gold Guard) -->
      <ellipse cx="678" cy="996" rx="14" ry="34" fill="url(#katanaGuardGrad)" stroke="#ffd166" stroke-width="3" filter="url(#softGlow)" />
      <!-- Inner Tsuba Details -->
      <ellipse cx="678" cy="996" rx="8" ry="20" fill="#780000" />
      <circle cx="678" cy="982" r="3" fill="#ffd166" />
      <circle cx="678" cy="1010" r="3" fill="#ffd166" />

      <!-- Tsuka (Hilt / Handle with White-Silver Diamond Wrap) -->
      <rect x="520" y="984" width="155" height="24" rx="5" fill="#0d0d0f" stroke="#1a1a1d" stroke-width="1" />
      <!-- Diamond Menuki Pattern Wrap -->
      <polygon points="535,984 545,996 535,1008 525,996" fill="#f8f9fa" />
      <polygon points="560,984 570,996 560,1008 550,996" fill="#f8f9fa" />
      <polygon points="585,984 595,996 585,1008 575,996" fill="#f8f9fa" />
      <polygon points="610,984 620,996 610,1008 600,996" fill="#f8f9fa" />
      <polygon points="635,984 645,996 635,1008 625,996" fill="#f8f9fa" />
      <polygon points="660,984 670,996 660,1008 650,996" fill="#f8f9fa" />

      <!-- Kashira (Pommel / End Cap in Silver Chrome) -->
      <path d="M 520 980 L 500 983 L 500 1009 L 520 1012 Z" fill="#e4e7eb" stroke="#a0a4a8" stroke-width="2" filter="url(#softGlow)" />
    </g>

    <!-- Head, Neck, Beard, Hair & Sunglasses -->
    <!-- Neck -->
    <path d="M 560 300 L 545 400 L 655 400 L 640 300 Z" fill="url(#skinGrad)" />
    <!-- Neck Rim Lights -->
    <path d="M 558 300 L 545 390" stroke="#f0c28a" stroke-width="4" stroke-opacity="0.8" filter="url(#softGlow)" />
    <path d="M 642 300 L 655 390" stroke="#f0c28a" stroke-width="4" stroke-opacity="0.8" filter="url(#softGlow)" />

    <!-- Face Base -->
    <path d="M 530 220 C 530 160 670 160 670 220 C 670 290 640 360 600 365 C 560 360 530 290 530 220 Z" fill="url(#skinGrad)" />
    <path d="M 530 220 C 530 160 670 160 670 220 C 670 290 640 360 600 365 C 560 360 530 290 530 220 Z" fill="url(#skinHighlight)" />

    <!-- Ears -->
    <ellipse cx="522" cy="245" rx="14" ry="24" fill="url(#skinGrad)" stroke="#f0c28a" stroke-width="1.5" />
    <ellipse cx="678" cy="245" rx="14" ry="24" fill="url(#skinGrad)" stroke="#f0c28a" stroke-width="1.5" />

    <!-- Nose -->
    <path d="M 596 220 L 592 270 L 608 270 L 604 220 Z" fill="#754528" opacity="0.7" />
    <path d="M 590 270 Q 600 278 610 270" stroke="#5c341b" stroke-width="2" fill="none" />

    <!-- Groomed Dark Beard & Mustache -->
    <path d="M 536 240 C 540 330 560 370 600 375 C 640 370 660 330 664 240 C 655 255 645 285 635 295 C 625 302 575 302 565 295 C 555 285 545 255 536 240 Z" fill="#0f0e11" />
    <!-- Mustache -->
    <path d="M 570 286 Q 600 274 630 286 Q 600 304 570 286 Z" fill="#0a090b" />
    <!-- Soul Patch -->
    <polygon points="594,312 606,312 600,332" fill="#0f0e11" />

    <!-- Dark Sunglasses (Stylish Aviator / Wayfarer Look) -->
    <!-- Left Lens Frame -->
    <path d="M 540 205 L 590 205 Q 595 242 570 252 Q 538 245 540 205 Z" fill="url(#glassesGrad)" stroke="#1f2024" stroke-width="4" />
    <!-- Right Lens Frame -->
    <path d="M 610 205 L 660 205 Q 662 245 630 252 Q 605 242 610 205 Z" fill="url(#glassesGrad)" stroke="#1f2024" stroke-width="4" />
    <!-- Bridge & Temples -->
    <line x1="590" y1="210" x2="610" y2="210" stroke="#dcdde1" stroke-width="4" filter="url(#softGlow)" />
    <line x1="588" y1="204" x2="612" y2="204" stroke="#1f2024" stroke-width="2" />
    <path d="M 540 208 L 522 216" stroke="#1f2024" stroke-width="3.5" />
    <path d="M 660 208 L 678 216" stroke="#1f2024" stroke-width="3.5" />
    <!-- Lens Specular Glare / Reflection -->
    <path d="M 548 212 L 575 212 L 560 240 L 545 235 Z" fill="#ffffff" opacity="0.18" />
    <path d="M 618 212 L 645 212 L 630 240 L 615 235 Z" fill="#ffffff" opacity="0.18" />

    <!-- Signature Curly Voluminous Black Hair with Golden Rim Light -->
    <!-- Curly Hair Base Silhouette -->
    <path d="M 525 210 C 500 190 495 140 520 105 C 550 70 650 70 680 105 C 705 140 700 190 675 210 C 665 180 650 160 600 155 C 550 160 535 180 525 210 Z" fill="#0d0c10" />

    <!-- Stylized Hair Curls & Textured Clusters -->
    <circle cx="530" cy="115" r="28" fill="#121116" />
    <circle cx="565" cy="88" r="32" fill="#16151a" />
    <circle cx="600" cy="80" r="34" fill="#141318" />
    <circle cx="635" cy="88" r="32" fill="#16151a" />
    <circle cx="670" cy="115" r="28" fill="#121116" />
    <circle cx="510" cy="155" r="24" fill="#0d0c10" />
    <circle cx="690" cy="155" r="24" fill="#0d0c10" />
    <circle cx="520" cy="188" r="18" fill="#0a090d" />
    <circle cx="680" cy="188" r="18" fill="#0a090d" />

    <!-- Golden Rim Light Highlight Around Curls -->
    <path d="M 505 170 C 490 135 520 85 560 75 C 600 65 640 75 680 85 C 710 135 695 170 695 170" fill="none" stroke="#f6d396" stroke-width="7" stroke-linecap="round" filter="url(#softGlow)" opacity="0.85" />
    <path d="M 520 115 Q 545 75 580 72" fill="none" stroke="#fff1d6" stroke-width="4" filter="url(#softGlow)" />
    <path d="M 680 115 Q 655 75 620 72" fill="none" stroke="#fff1d6" stroke-width="4" filter="url(#softGlow)" />
  </g>

  <!-- Ambient Foreground Smoke / Mist Layer at Base -->
  <ellipse cx="600" cy="1150" rx="580" ry="120" fill="#1f1810" opacity="0.5" filter="url(#smokeBlur)" />
  <ellipse cx="300" cy="1100" rx="350" ry="100" fill="#3a2817" opacity="0.3" filter="url(#smokeBlur)" />
  <ellipse cx="900" cy="1100" rx="350" ry="100" fill="#3a2817" opacity="0.3" filter="url(#smokeBlur)" />
</svg>`;

// Write SVG files
const svgPath1 = path.join(imagesDir, 'og-full-screen-m.svg');
const svgPath2 = path.join(publicDir, 'og-full-screen-m.svg');
const svgPath3 = path.join(imagesDir, 'author-nithin-katana.svg');
const svgPath4 = path.join(publicDir, 'author-nithin-katana.svg');

fs.writeFileSync(svgPath1, authorSvg);
fs.writeFileSync(svgPath2, authorSvg);
fs.writeFileSync(svgPath3, authorSvg);
fs.writeFileSync(svgPath4, authorSvg);

// Also copy or write to og-full-screen-m.jpeg and images/og-full-screen-m.jpeg so any path matches
fs.writeFileSync(path.join(publicDir, 'og-full-screen-m.jpeg'), authorSvg);
fs.writeFileSync(path.join(imagesDir, 'og-full-screen-m.jpeg'), authorSvg);

console.log('Successfully generated author assets in /public and /public/images!');
