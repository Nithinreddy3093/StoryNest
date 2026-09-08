import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowDown, Lightbulb } from 'lucide-react';

interface ReadingRoomLampProps {
  isLampOn: boolean;
  lightPhase: 0 | 1 | 2 | 3 | 4;
  onTurnOn: () => void;
  className?: string;
}

export const ReadingRoomLamp: React.FC<ReadingRoomLampProps> = ({
  isLampOn,
  lightPhase,
  onTurnOn,
  className = '',
}) => {
  const [pullOffset, setPullOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const dragStartYRef = useRef(0);
  const pullOffsetRef = useRef(0);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Subtle acoustic mechanical switch sound (tactile feedback)
  const playClickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio is an optional tactile enhancement; fail silently if unpermitted
    }
  }, []);

  const triggerActivation = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {
        // Ignore if unsupported
      }
    }
    playClickSound();
    onTurnOn();
  }, [playClickSound, onTurnOn]);

  // Pointer drag events for string pulling
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    pullOffsetRef.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartYRef.current;
    // Clamp downward pull between 0 and 55px
    const clamped = Math.max(0, Math.min(55, deltaY));
    pullOffsetRef.current = clamped;
    setPullOffset(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    // If pulled more than 20px or if a brief click/tap occurred, activate!
    const pulledDistance = pullOffsetRef.current;
    if (!isLampOn && (pulledDistance >= 18 || Math.abs(e.clientY - dragStartYRef.current) < 6)) {
      triggerActivation();
    }

    // Smooth spring back to 0
    setPullOffset(0);
    pullOffsetRef.current = 0;
  };

  // Keyboard accessibility: Enter or Space pulls the string
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPullOffset(30);
      triggerActivation();
      setTimeout(() => setPullOffset(0), 220);
    }
  };

  // Ultra-subtle, physically realistic micro dust motes drifting inside the warm light beam
  const particles = [
    { id: 1, x: 132, y: 235, size: 1.2, delay: 0, dur: 5.2 },
    { id: 2, x: 110, y: 275, size: 0.9, delay: 1.2, dur: 6.4 },
    { id: 3, x: 158, y: 295, size: 1.4, delay: 2.1, dur: 5.8 },
    { id: 4, x: 95, y: 335, size: 0.8, delay: 0.6, dur: 7.1 },
    { id: 5, x: 175, y: 345, size: 1.1, delay: 2.8, dur: 6.0 },
    { id: 6, x: 125, y: 380, size: 1.3, delay: 1.5, dur: 6.6 },
    { id: 7, x: 195, y: 395, size: 1.0, delay: 3.2, dur: 7.5 },
  ];

  // Opacity & glow calculation based on light phase
  // 0: Off, 1: 25%, 2: 50%, 3: 75%, 4: 100%
  const lightOpacity =
    lightPhase === 0 ? 0 : lightPhase === 1 ? 0.25 : lightPhase === 2 ? 0.55 : lightPhase === 3 ? 0.82 : 1.0;

  // Mechanical tilt of the lampshade when string is pulled
  const shadeTilt = pullOffset * 0.08; // subtle 0 to 4.4 deg tilt

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      aria-label="StoryNest Reading Room Lamp"
    >
      {/* Cinematic Ambient Background Light Wash */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
        style={{
          opacity: lightOpacity * 0.9,
          background:
            'radial-gradient(circle at 35% 45%, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 75%)',
        }}
      />

      {/* Main SVG Scene */}
      <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/5] flex items-center justify-center">
        <svg
          viewBox="0 0 400 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Realistic Brushed Brass Gradient with Specular Sheen */}
            <linearGradient id="lampBrassGrad" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="12%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="65%" stopColor="#b45309" />
              <stop offset="88%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Brass Tube Specular Highlight Line */}
            <linearGradient id="brassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Spun Matte Black Metal Outer Lampshade */}
            <linearGradient id="lampShadeOuter" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#222734" />
              <stop offset="30%" stopColor="#151b26" />
              <stop offset="70%" stopColor="#0b0f17" />
              <stop offset="100%" stopColor="#05070a" />
            </linearGradient>

            {/* Warm Reflected Brass Interior of Lampshade */}
            <linearGradient id="lampShadeInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#fbbf24" />
              <stop offset="65%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Rich Polished Dark Walnut Desk Gradient */}
            <linearGradient id="deskWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#23170f" />
              <stop offset="25%" stopColor="#1a110a" />
              <stop offset="60%" stopColor="#120b06" />
              <stop offset="100%" stopColor="#090503" />
            </linearGradient>

            {/* Hardcover Book Cover Textures */}
            <linearGradient id="bookCoverCharcoal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#262c36" />
              <stop offset="50%" stopColor="#181d26" />
              <stop offset="100%" stopColor="#0d1117" />
            </linearGradient>

            <linearGradient id="bookCoverBurgundy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#631717" />
              <stop offset="50%" stopColor="#400e0e" />
              <stop offset="100%" stopColor="#1f0505" />
            </linearGradient>

            <linearGradient id="bookCoverNavyCloth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e2d42" />
              <stop offset="55%" stopColor="#111c2c" />
              <stop offset="100%" stopColor="#070c14" />
            </linearGradient>

            {/* Physically Believable 2700K Tungsten Light Beam Cone */}
            <radialGradient id="lightBeamGradient" cx="45%" cy="0%" r="95%">
              <stop offset="0%" stopColor="rgba(255, 247, 214, 0.42)" />
              <stop offset="20%" stopColor="rgba(251, 191, 36, 0.28)" />
              <stop offset="50%" stopColor="rgba(245, 158, 11, 0.12)" />
              <stop offset="80%" stopColor="rgba(217, 119, 6, 0.02)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Warm Radial Pool of Light on Polished Wood Surface */}
            <radialGradient id="deskLightPool" cx="48%" cy="48%" r="52%">
              <stop offset="0%" stopColor="rgba(255, 247, 214, 0.52)" />
              <stop offset="30%" stopColor="rgba(251, 191, 36, 0.32)" />
              <stop offset="65%" stopColor="rgba(245, 158, 11, 0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Luminous Filament Aura */}
            <radialGradient id="bulbGlowRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#fffbeb" />
              <stop offset="55%" stopColor="#fbbf24" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Camera Depth-of-Field Blur Filter for Background Bookshelf */}
            <filter id="dofBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" />
            </filter>

            {/* Contact Shadow & Atmospheric Glow Filters */}
            <filter id="contactShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" />
            </filter>

            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="beamBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>

            <filter id="filamentGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ==================================================== */}
          {/* 1. ROOM BACKGROUND: CINEMATIC DEPTH-OF-FIELD BOOKSHELF */}
          {/* ==================================================== */}
          <g opacity={0.3 + lightOpacity * 0.25} filter="url(#dofBlur)" className="transition-opacity duration-700">
            {/* Deep Midnight Wall Shadow */}
            <rect x="0" y="0" width="400" height="430" fill="#04060c" />

            {/* Softly Blurred Dark Oak Bookshelf in Distance */}
            <rect x="220" y="36" width="180" height="7" fill="#0f1523" rx="1.5" />
            <g opacity="0.5">
              <rect x="232" y="43" width="11" height="72" fill="#182030" rx="1" />
              <rect x="245" y="48" width="9" height="67" fill="#242e42" rx="1" />
              <rect x="256" y="42" width="13" height="73" fill="#141829" rx="1.5" />
              <rect x="271" y="52" width="10" height="63" fill="#300d0d" rx="1" />
              <rect x="283" y="45" width="14" height="70" fill="#082b21" rx="1.5" />
              <rect x="299" y="47" width="12" height="68" fill="#1a202c" rx="1" />
              <rect x="313" y="50" width="11" height="65" fill="#24150b" rx="1" />
              <rect x="326" y="43" width="13" height="72" fill="#162030" rx="1.5" />
              <rect x="341" y="48" width="12" height="67" fill="#1f1c3d" rx="1" />
              <rect x="355" y="45" width="14" height="70" fill="#152438" rx="1" />
            </g>
            <rect x="220" y="115" width="180" height="6" fill="#121a2b" rx="1.5" />
          </g>

          {/* ==================================================== */}
          {/* 2. REALISTIC DARK WALNUT DESK & SPECULAR HIGHLIGHTS */}
          {/* ==================================================== */}
          <g>
            {/* Ambient Occlusion / Deep Shadow Under Desk Edge */}
            <rect x="-20" y="423" width="440" height="60" fill="#020408" />

            {/* Main Desk Top with Dark Polished Walnut Surface */}
            <path
              d="M -20 425 L 420 425 L 420 480 L -20 480 Z"
              fill="url(#deskWoodGrad)"
            />

            {/* Subtle Woodgrain Striations */}
            <line x1="-20" y1="432" x2="420" y2="432" stroke="#2a1c13" strokeWidth="0.5" opacity="0.6" />
            <line x1="-20" y1="440" x2="420" y2="440" stroke="#1f140d" strokeWidth="0.75" opacity="0.5" />
            <line x1="-20" y1="452" x2="420" y2="452" stroke="#261910" strokeWidth="0.5" opacity="0.4" />

            {/* Precision Chamfered Beveled Edge Highlight */}
            <line
              x1="-20"
              y1="425"
              x2="420"
              y2="425"
              stroke="#382214"
              strokeWidth="1.5"
            />

            {/* Glossy Specular Varnish Sheen when light illuminates */}
            <line
              x1="20"
              y1="425"
              x2="290"
              y2="425"
              stroke="#f59e0b"
              strokeWidth="2"
              opacity={lightOpacity * 0.85}
              className="transition-opacity duration-700"
            />
          </g>

          {/* ==================================================== */}
          {/* 3. LIGHT RAYS & LIGHT POOLS (Under the lamp & books) */}
          {/* ==================================================== */}
          {lightPhase > 0 && (
            <g
              opacity={lightOpacity}
              className="transition-opacity duration-700 ease-out pointer-events-none"
            >
              {/* Wide Atmospheric Ambient Light Cone */}
              <polygon
                points="125,188 -15,465 365,465"
                fill="url(#lightBeamGradient)"
                filter="url(#beamBlur)"
              />

              {/* Directional Inner Core 2700K Beam */}
              <polygon
                points="125,188 35,445 245,445"
                fill="url(#lightBeamGradient)"
                opacity="0.85"
              />

              {/* Desk Surface Radial Light Pool with Natural Falloff */}
              <ellipse
                cx="145"
                cy="435"
                rx="160"
                ry="36"
                fill="url(#deskLightPool)"
                filter="url(#softGlow)"
              />
            </g>
          )}

          {/* ==================================================== */}
          {/* 4. THREE REALISTIC HARDCOVER BOOKS ON DESK */}
          {/* ==================================================== */}
          <g className="transition-all duration-700">
            {/* Book Stack Contact Shadow on Wood Desk */}
            <ellipse
              cx="115"
              cy="431"
              rx="75"
              ry="10"
              fill="#020306"
              filter="url(#contactShadow)"
              opacity="0.9"
            />

            {/* 1. Bottom Book: Charcoal Linen Hardcover Volume */}
            <g>
              {/* Hardcover Outer Shell */}
              <rect
                x="45"
                y="410"
                width="142"
                height="17"
                rx="2"
                fill="url(#bookCoverCharcoal)"
                stroke="#090d14"
                strokeWidth="1"
              />
              {/* Deckled Aged Paper Edges */}
              <rect
                x="49"
                y="413"
                width="135"
                height="11"
                fill="#854d0e"
                opacity={0.65 + lightOpacity * 0.35}
              />
              <line x1="51" y1="416" x2="182" y2="416" stroke="#fbbf24" strokeWidth="0.6" opacity={lightOpacity * 0.9} />
              <line x1="51" y1="419" x2="182" y2="419" stroke="#b45309" strokeWidth="0.6" opacity={lightOpacity * 0.9} />
              {/* Headband cloth accent */}
              <rect x="46" y="413" width="3" height="11" fill="#b91c1c" />
            </g>

            {/* 2. Middle Book: Deep Burgundy Leather Volume (Slightly Offset) */}
            <g transform="translate(4, -13)">
              <rect
                x="48"
                y="410"
                width="134"
                height="15"
                rx="2.5"
                fill="url(#bookCoverBurgundy)"
                stroke="#1c0505"
                strokeWidth="1"
              />
              {/* Spine Ribs (Raised bands) */}
              <line x1="50" y1="413" x2="50" y2="422" stroke="#7f1d1d" strokeWidth="1.5" />
              <line x1="54" y1="413" x2="54" y2="422" stroke="#7f1d1d" strokeWidth="1.5" />
              {/* Golden Page Edges */}
              <rect
                x="56"
                y="413"
                width="123"
                height="9"
                fill="#92400e"
                opacity={0.6 + lightOpacity * 0.4}
              />
              <line x1="58" y1="416" x2="177" y2="416" stroke="#fef08a" strokeWidth="0.5" opacity={lightOpacity} />
            </g>

            {/* 3. Top Book: Navy Cloth Hardcover with Gold Embossed "StoryNest" */}
            <g transform="rotate(-2.2, 58, 388)">
              {/* Book Drop Shadow onto Middle Book */}
              <rect
                x="54"
                y="386"
                width="126"
                height="18"
                rx="3"
                fill="#02040a"
                filter="url(#contactShadow)"
                opacity="0.4"
              />
              {/* Textured Navy Cloth Cover */}
              <rect
                x="52"
                y="384"
                width="126"
                height="18"
                rx="3"
                fill="url(#bookCoverNavyCloth)"
                stroke="#09101d"
                strokeWidth="1"
              />

              {/* Debossed Gold Foil "StoryNest" Branding on Spine */}
              <text
                x="68"
                y="396.5"
                fill="#fde047"
                fontSize="7"
                fontFamily="Playfair Display, Georgia, serif"
                fontWeight="bold"
                letterSpacing="1.4"
                opacity={0.55 + lightOpacity * 0.45}
              >
                StoryNest
              </text>

              {/* Spine Trim Lines */}
              <line x1="56" y1="387" x2="56" y2="399" stroke="#b45309" strokeWidth="0.8" opacity={lightOpacity} />
              <line x1="172" y1="387" x2="172" y2="399" stroke="#b45309" strokeWidth="0.8" opacity={lightOpacity} />

              {/* Silk Amber Bookmark Ribbon Draped Naturally Across the Desk */}
              <path
                d="M 158 393 C 172 405 180 418 184 430 C 187 438 180 442 176 443"
                stroke="#d97706"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 158 393 C 172 405 180 418 184 430 C 187 438 180 442 176 443"
                stroke="#fef08a"
                strokeWidth="0.8"
                strokeLinecap="round"
                fill="none"
                opacity={lightOpacity}
              />
            </g>
          </g>

          {/* ==================================================== */}
          {/* 5. FLOATING PARTICLES / DUST MOTES IN BEAM */}
          {/* ==================================================== */}
          {isLampOn &&
            !prefersReducedMotion &&
            particles.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill="#fef08a"
                opacity={lightOpacity * 0.65}
                filter="url(#highGlow)"
                className="pointer-events-none animate-pulse"
                style={{
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}

          {/* ==================================================== */}
          {/* 6. THE LAMP STRUCTURE (Base, Arm, Shade, Bulb) */}
          {/* ==================================================== */}
          <g>
            {/* Lamp Base Contact Shadow on Desk */}
            <ellipse
              cx="245"
              cy="424"
              rx="54"
              ry="12"
              fill="#010205"
              filter="url(#contactShadow)"
              opacity="0.95"
            />

            {/* Weighted Circular Brass Base on Desk */}
            <ellipse
              cx="245"
              cy="420"
              rx="48"
              ry="13"
              fill="url(#lampBrassGrad)"
              stroke="#3b1704"
              strokeWidth="1.5"
            />
            {/* Base Specular Highlight Rim */}
            <ellipse
              cx="245"
              cy="417"
              rx="42"
              ry="9.5"
              fill="#18100a"
              stroke="#f59e0b"
              strokeWidth="0.8"
              opacity={0.7 + lightOpacity * 0.3}
            />
            {/* Base Center Collar */}
            <ellipse cx="245" cy="414" rx="14" ry="5.5" fill="url(#lampBrassGrad)" stroke="#451a03" strokeWidth="0.8" />

            {/* Graceful Tubular Arched Brass Stem */}
            <path
              d="M 245 412 C 248 310 290 215 235 130 C 205 85 160 75 125 105"
              stroke="url(#lampBrassGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* High-Gloss Specular Glint Along the Gooseneck Curve */}
            <path
              d="M 244 412 C 247 310 288 215 234 130 C 204 86 161 76 126 106"
              stroke="url(#brassHighlight)"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity={0.6 + lightOpacity * 0.4}
            />
            <path
              d="M 245 412 C 248 310 290 215 235 130 C 205 85 160 75 125 105"
              stroke="#381503"
              strokeWidth="1"
              fill="none"
            />

            {/* Mechanical Brass Joint Knuckle with Knurling */}
            <circle cx="232" cy="132" r="7.5" fill="url(#lampBrassGrad)" stroke="#451a03" strokeWidth="1" />
            <circle cx="232" cy="132" r="4" fill="#2d1305" />
            <circle cx="232" cy="132" r="1.5" fill="#fbbf24" opacity={lightOpacity} />

            {/* Upper Arm Segment to Shade Bracket */}
            <line
              x1="125"
              y1="105"
              x2="125"
              y2="135"
              stroke="url(#lampBrassGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="124"
              y1="105"
              x2="124"
              y2="135"
              stroke="#fef08a"
              strokeWidth="1"
              opacity="0.6"
            />

            {/* Socket Fixture & Shade Mount */}
            <rect
              x="117"
              y="128"
              width="16"
              height="16"
              rx="2.5"
              fill="url(#lampBrassGrad)"
              stroke="#381503"
              strokeWidth="1"
            />

            {/* ==================================================== */}
            {/* LAMPSHADE & BULB (Tilts slightly when string is pulled) */}
            {/* ==================================================== */}
            <g
              transform={`rotate(${shadeTilt}, 125, 136)`}
              className="transition-transform duration-100 ease-out"
            >
              {/* Inner Reflective Gold Lining (visible from below) */}
              <ellipse
                cx="125"
                cy="188"
                rx="48"
                ry="14"
                fill="url(#lampShadeInner)"
                stroke="#b45309"
                strokeWidth="1.5"
              />

              {/* Glowing Bulb inside the shade */}
              <g>
                {/* Luminous Bulb Aura when ON */}
                {lightPhase > 0 && (
                  <ellipse
                    cx="125"
                    cy="185"
                    rx="28"
                    ry="20"
                    fill="url(#bulbGlowRadial)"
                    filter="url(#filamentGlow)"
                    opacity={lightOpacity}
                  />
                )}

                {/* Hand-Blown Bulb Glass Body */}
                <ellipse
                  cx="125"
                  cy="184"
                  rx="15"
                  ry="12"
                  fill={
                    isLampOn
                      ? '#fffdf5'
                      : 'rgba(245, 158, 11, 0.14)'
                  }
                  stroke={isLampOn ? '#fef08a' : '#542408'}
                  strokeWidth="1"
                />

                {/* Edison Spiral Filament */}
                <path
                  d="M 121 184 Q 123 178 125 184 Q 127 178 129 184"
                  stroke={isLampOn ? '#ffffff' : '#78350f'}
                  strokeWidth="1.4"
                  fill="none"
                />
                {isLampOn && (
                  <circle cx="125" cy="181" r="2" fill="#ffffff" filter="url(#filamentGlow)" />
                )}
              </g>

              {/* Lampshade Outer Spun Metal Bell Body */}
              <path
                d="M 117 136 C 117 136 100 155 77 188 C 105 197 145 197 173 188 C 150 155 133 136 133 136 Z"
                fill="url(#lampShadeOuter)"
                stroke="#090d16"
                strokeWidth="1.5"
              />

              {/* Spun Metal Subtle Specular Arc Highlight */}
              <path
                d="M 118 140 C 118 140 106 158 89 185"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Polished Brass Rim Trim along the bottom of the shade */}
              <path
                d="M 77 188 C 105 197 145 197 173 188"
                stroke="url(#lampBrassGrad)"
                strokeWidth="2.5"
                fill="none"
              />

              {/* Precision Top Cap Finial Trim */}
              <rect x="115" y="134" width="20" height="4" rx="2" fill="url(#lampBrassGrad)" />
            </g>

            {/* ==================================================== */}
            {/* 7. INTERACTIVE PULL STRING / BEADED CHAIN */}
            {/* ==================================================== */}
            <g
              className="cursor-grab active:cursor-grabbing transition-transform duration-75"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              aria-label="Lamp pull string: pull down, tap, or press Enter to enter StoryNest"
            >
              {/* Cord Anchor Collar under the socket */}
              <circle cx="146" cy="144" r="3.5" fill="url(#lampBrassGrad)" />

              {/* The Chain / Braided String */}
              <line
                x1="146"
                y1="144"
                x2="146"
                y2={228 + pullOffset}
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="2,3"
                strokeLinecap="round"
              />
              <line
                x1="146"
                y1="144"
                x2="146"
                y2={228 + pullOffset}
                stroke="#fde047"
                strokeWidth="1"
                strokeDasharray="2,3"
                strokeLinecap="round"
                opacity={0.8}
              />

              {/* Brass Teardrop Pull Handle / Fob */}
              <g transform={`translate(146, ${230 + pullOffset})`}>
                {/* Pull Handle Specular Halo if hovered or dragging */}
                {(isHovered || isDragging || !isLampOn) && (
                  <circle
                    cx="0"
                    cy="14"
                    r="16"
                    fill="rgba(245, 158, 11, 0.15)"
                    className="animate-pulse"
                  />
                )}

                {/* Handle Top Ring */}
                <ellipse cx="0" cy="2" rx="3.5" ry="2" fill="#78350f" />

                {/* Solid Brass Teardrop Handle Body */}
                <path
                  d="M -4 4 C -4 4 -6 12 0 20 C 6 12 4 4 4 4 Z"
                  fill="url(#lampBrassGrad)"
                  stroke="#451a03"
                  strokeWidth="1"
                />
                {/* Knurled Grip Texture on Handle */}
                <line x1="-3" y1="8" x2="3" y2="8" stroke="#451a03" strokeWidth="0.75" />
                <line x1="-3.5" y1="12" x2="3.5" y2="12" stroke="#451a03" strokeWidth="0.75" />
                <line x1="-2.5" y1="16" x2="2.5" y2="16" stroke="#451a03" strokeWidth="0.75" />
              </g>

              {/* Generous Invisible Touch/Click Target (min 48x140px hit box) */}
              <rect
                x="122"
                y="140"
                width="48"
                height={130 + pullOffset}
                fill="transparent"
                style={{ touchAction: 'none' }}
                className="cursor-grab active:cursor-grabbing"
              />
            </g>
          </g>
        </svg>

        {/* ==================================================== */}
        {/* INTERACTIVE INSTRUCTION TOOLTIP (Near the pull string) */}
        {/* ==================================================== */}
        <AnimatePresence>
          {!isLampOn && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute left-[54%] top-[45%] -translate-y-1/2 pointer-events-none z-20"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-[0_4px_20px_rgba(245,158,11,0.25)] backdrop-blur-md whitespace-nowrap">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400"
                >
                  <ArrowDown className="w-3 h-3" />
                </motion.div>
                <span>Pull the string to enter StoryNest</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================== */}
      {/* ACCESSIBILITY & ONE-CLICK FALLBACK CONTROL */}
      {/* ==================================================== */}
      <div className="mt-2 text-center z-20">
        {!isLampOn ? (
          <button
            type="button"
            onClick={triggerActivation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all shadow-sm group cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Enter StoryNest</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Light up your story.</span>
          </div>
        )}
      </div>
    </div>
  );
};
