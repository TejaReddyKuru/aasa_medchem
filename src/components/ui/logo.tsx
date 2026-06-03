export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* FLASK */}
      {/* Rim */}
      <line x1="20" y1="30" x2="40" y2="30" />
      {/* Neck */}
      <path d="M24 30 v15 l-12 20 a 22 22 0 1 0 36 0 l-12 -20 v-15" />
      {/* Liquid Level */}
      <line x1="8" y1="65" x2="52" y2="65" />

      {/* MOLECULE (Hexagon) */}
      <polygon points="65,30 85,40 85,65 65,75 45,65 45,40" />
      
      {/* Double Bonds in Hexagon */}
      <line x1="52" y1="44" x2="52" y2="61" />
      <line x1="63" y1="68" x2="77" y2="61" />
      <line x1="63" y1="37" x2="77" y2="44" />

      {/* Branches */}
      {/* Top Left Branch */}
      <line x1="45" y1="40" x2="35" y2="20" />
      <line x1="35" y1="20" x2="20" y2="20" />

      {/* Top Right Branch & Circle */}
      <line x1="85" y1="40" x2="95" y2="30" />
      <circle cx="95" cy="25" r="5" />

      {/* Bottom Right Branch & Circle */}
      <line x1="85" y1="65" x2="95" y2="75" />
      <circle cx="95" cy="80" r="5" />
      
      {/* Bottom Left branch */}
      <line x1="45" y1="65" x2="35" y2="80" />
    </svg>
  );
}
