type BrandLogoProps = {
  showTagline?: boolean
}

function BrandLogo({ showTagline = false }: BrandLogoProps) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 160 160"
          className="h-12 w-12"
        >
          <circle cx="80" cy="80" r="76" fill="#C8371F" />
          <circle cx="80" cy="80" r="60" fill="none" stroke="#FBF4E9" strokeWidth="4" />
          <circle cx="80" cy="80" r="46" fill="#FBF4E9" />
          <polygon
            points="80,48 88.5,69.5 111.5,70.5 93.5,84.5 99.5,107 80,94 60.5,107 66.5,84.5 48.5,70.5 71.5,69.5"
            fill="#C8371F"
          />
        </svg>
        <span
          className="whitespace-nowrap font-serif text-3xl leading-none tracking-tight text-brand-brown"
          aria-label="RestauRank"
        >
          Restau<span className="font-extrabold text-brand-tomato">Rank</span>
        </span>
      </div>
      {showTagline && (
        <span className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-[#6B5648]">
          Avalie · Ranqueie · Descubra
        </span>
      )}
    </div>
  )
}

export default BrandLogo
