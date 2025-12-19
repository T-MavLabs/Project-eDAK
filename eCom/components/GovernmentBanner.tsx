/**
 * Government of India Banner
 * Displays the Indian flag icon and "Government of India" text
 * Positioned above the main navbar
 */

export function GovernmentBanner() {
  return (
    <div 
      className="w-full bg-neutral-700 text-white py-1.5 px-4"
      role="banner"
      aria-label="Government of India"
    >
      <div className="mx-auto w-full max-w-[1536px] flex items-center gap-2">
        {/* Indian Flag Icon */}
        <svg
          width="24"
          height="16"
          viewBox="0 0 24 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
          aria-hidden="true"
        >
          {/* Saffron band */}
          <rect width="24" height="5.33" fill="#FF9933" />
          {/* White band with Ashoka Chakra */}
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          {/* Ashoka Chakra - simplified 24-spoke wheel */}
          <circle cx="12" cy="8" r="2" fill="#000080" />
          <g stroke="#000080" strokeWidth="0.3">
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              // Round to 3 decimal places to prevent hydration mismatches
              const x1 = Math.round((12 + 1.5 * Math.cos((angle * Math.PI) / 180)) * 1000) / 1000;
              const y1 = Math.round((8 + 1.5 * Math.sin((angle * Math.PI) / 180)) * 1000) / 1000;
              const x2 = Math.round((12 + 2.5 * Math.cos((angle * Math.PI) / 180)) * 1000) / 1000;
              const y2 = Math.round((8 + 2.5 * Math.sin((angle * Math.PI) / 180)) * 1000) / 1000;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              );
            })}
          </g>
          {/* Green band */}
          <rect y="10.66" width="24" height="5.33" fill="#138808" />
        </svg>
        
        {/* Government of India Text */}
        <span className="text-sm font-medium" style={{ fontFamily: "var(--ux4g-font-family-base, 'Noto Sans', sans-serif)" }}>
          Government of India
        </span>
      </div>
    </div>
  );
}
