import React from 'react'

const PandaLogo = ({ className = "w-10 h-10", showText = true }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`${className} relative`}>
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full"
          fill="currentColor"
        >
          {/* Panda Logo SVG */}
          <g>
            {/* Left ear */}
            <circle cx="150" cy="120" r="80" fill="#000000" />
            {/* Right ear */}
            <circle cx="362" cy="120" r="80" fill="#000000" />
            
            {/* Main head */}
            <circle cx="256" cy="200" r="160" fill="#FFFFFF" />
            
            {/* Left eye patch */}
            <ellipse cx="200" cy="180" rx="45" ry="60" fill="#000000" />
            {/* Right eye patch */}
            <ellipse cx="312" cy="180" rx="45" ry="60" fill="#000000" />
            
            {/* Left eye */}
            <ellipse cx="200" cy="185" rx="20" ry="25" fill="#FFFFFF" />
            <circle cx="205" cy="190" r="8" fill="#000000" />
            <circle cx="208" cy="185" r="3" fill="#FFFFFF" />
            
            {/* Right eye */}
            <ellipse cx="312" cy="185" rx="20" ry="25" fill="#FFFFFF" />
            <circle cx="307" cy="190" r="8" fill="#000000" />
            <circle cx="304" cy="185" r="3" fill="#FFFFFF" />
            
            {/* Nose */}
            <ellipse cx="256" cy="230" rx="15" ry="10" fill="#000000" />
            
            {/* Mouth */}
            <path
              d="M 230 260 Q 256 280 282 260"
              stroke="#000000"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Body curves */}
            <path
              d="M 120 320 Q 120 450 256 480 Q 392 450 392 320"
              fill="#000000"
            />
            
            {/* Inner body curve */}
            <path
              d="M 160 340 Q 160 420 256 440 Q 352 420 352 340"
              fill="#FFFFFF"
            />
          </g>
        </svg>
      </div>
      {}
    </div>
  )
}

export default PandaLogo