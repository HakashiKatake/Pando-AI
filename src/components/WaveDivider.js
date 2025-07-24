"use client"

<<<<<<< HEAD
const WaveDivider = ({ flip = false, className = "", color = "" }) => {
  return (
    <div className={`w-full ${flip ? "rotate-180" : ""} ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16 lg:h-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
          fill={color || "currentColor"}
          className={color ? "" : "text-purple-300"}
        />
      </svg>
=======
const WaveDivider = ({ flip = false, className = "" }) => {
return (
    <div className={`w-full ${flip ? "rotate-180" : ""} ${className}`}>
        <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-12 md:h-16 lg:h-20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
                fill="#D3C3F3"
            />
        </svg>
>>>>>>> 01df573dcfede6fb7bf2c650de02b68eb51674e6
    </div>
)
}

export default WaveDivider
