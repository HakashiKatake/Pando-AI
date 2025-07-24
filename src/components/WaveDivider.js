"use client"

const WaveDivider = ({ flip = false, className = "", color = "#D3C3F3" }) => {
return (
    <div className={`w-full ${flip ? "rotate-180" : ""} ${className}`}>
        <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-6 md:h-8 lg:h-10"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
                fill={color}
            />
        </svg>
    </div>
)
}

export default WaveDivider
