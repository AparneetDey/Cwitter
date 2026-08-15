import React from 'react';

const CwitterLogo = ({ className = "w-12 h-12", style = {} }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Main C Outer Gradient */}
        <linearGradient id="cOuterGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="40%" stopColor="#0066ff" />
          <stop offset="85%" stopColor="#6c5ce7" />
          <stop offset="100%" stopColor="#8e44ad" />
        </linearGradient>

        {/* C Top Right Tip Gradient */}
        <linearGradient id="cTopTipGrad" x1="200" y1="50" x2="360" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#0077ff" />
        </linearGradient>

        {/* C Bottom Ribbon Gradient */}
        <linearGradient id="cBottomRibbonGrad" x1="150" y1="300" x2="380" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7928ca" />
          <stop offset="50%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#00d2ff" />
        </linearGradient>

        {/* Speech Bubble Gradient */}
        <linearGradient id="bubbleGrad" x1="180" y1="160" x2="320" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e6f2ff" stopOpacity="0.9" />
        </linearGradient>

        {/* Feather Gradient */}
        <linearGradient id="featherGrad" x1="280" y1="310" x2="380" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0052d4" />
          <stop offset="50%" stopColor="#4364f7" />
          <stop offset="80%" stopColor="#6fb1fc" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>

        {/* Feather Accent Gradient */}
        <linearGradient id="featherAccentGrad" x1="300" y1="280" x2="370" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7b2cbf" />
          <stop offset="100%" stopColor="#00c6ff" />
        </linearGradient>

        {/* Drop Shadow for Speech Bubble */}
        <filter id="bubbleShadow" x="140" y="140" width="200" height="170" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0044ff" floodOpacity="0.15" />
        </filter>

        {/* Soft Glow filter */}
        <filter id="softGlow" x="0" y="0" width="500" height="500" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00d2ff" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer 3D "C" Shape */}
      <g id="MainCStructure">
        {/* Main Sweeping C Body */}
        <path
          d="M 340 120 
             C 270 55, 120 85, 75 210 
             C 30 335, 120 440, 250 445 
             C 320 448, 370 410, 370 380 
             C 370 345, 305 340, 250 365 
             C 170 400, 105 320, 125 240 
             C 145 160, 230 115, 310 160 
             Z"
          fill="url(#cOuterGrad)"
        />

        {/* Top-Right Glowing Horn Arc of C */}
        <path
          d="M 230 70 
             C 280 65, 345 90, 360 145 
             C 330 120, 280 125, 240 140 
             C 210 150, 190 140, 230 70 Z"
          fill="url(#cTopTipGrad)"
        />

        {/* Inner Curved Shadow Layer inside C */}
        <path
          d="M 125 240
             C 110 300, 160 370, 250 365
             C 200 350, 150 300, 165 240
             C 175 200, 220 160, 260 150
             C 200 165, 140 190, 125 240 Z"
          fill="#0a194f"
          opacity="0.3"
        />

        {/* Bottom Swirling Ribbon Tail */}
        <path
          d="M 200 400
             C 240 440, 310 445, 370 380
             C 330 355, 270 360, 220 400
             Z"
          fill="url(#cBottomRibbonGrad)"
        />
      </g>

      {/* Floating Speech Bubble */}
      <g id="SpeechBubble" filter="url(#bubbleShadow)">
        {/* Tail */}
        <path
          d="M 205 255 L 180 295 L 230 270 Z"
          fill="url(#bubbleGrad)"
        />
        {/* Rounded Main Box */}
        <rect
          x="160"
          y="155"
          width="170"
          height="115"
          rx="40"
          fill="url(#bubbleGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* 3 Chat Dots */}
        {/* Dot 1: Light Cyan */}
        <circle cx="205" cy="212" r="12" fill="#00d2ff" />
        {/* Dot 2: Royal Blue */}
        <circle cx="245" cy="212" r="12" fill="#0066ff" />
        {/* Dot 3: Deep Purple */}
        <circle cx="285" cy="212" r="12" fill="#9b51e0" />
      </g>

      {/* Feather Quill Pen */}
      <g id="QuillPen" filter="url(#softGlow)">
        {/* Main Feather Vane Body (Back Layer) */}
        <path
          d="M 290 330
             C 300 280, 345 200, 400 140
             C 415 170, 395 240, 360 275
             C 340 295, 310 320, 290 330 Z"
          fill="url(#featherGrad)"
        />

        {/* Feather Inner Accent Vanes (Front Layer) */}
        <path
          d="M 305 305
             C 320 260, 360 190, 410 145
             C 412 180, 380 240, 345 285
             Z"
          fill="url(#featherAccentGrad)"
          opacity="0.9"
        />

        {/* Feather Cuts / Splits (Detailing) */}
        <path
          d="M 360 210 L 385 200 L 370 225 M 340 250 L 360 242 L 350 262"
          stroke="#00f2fe"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Feather Center Shaft Line */}
        <path
          d="M 290 330 C 320 270, 360 200, 405 140"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Metal Pen Nib */}
        <path
          d="M 290 330 L 280 355 L 292 342 L 302 338 Z"
          fill="#1e293b"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        {/* Nib Tip */}
        <path
          d="M 280 355 L 275 365 L 284 358 Z"
          fill="#00f2fe"
        />

        {/* Written Ink Line under Nib */}
        <path
          d="M 275 365 C 240 375, 210 365, 240 345"
          stroke="url(#cTopTipGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default CwitterLogo;
