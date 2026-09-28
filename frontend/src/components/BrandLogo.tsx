import logo from '../assets/restaurank-logo.png'

type BrandLogoProps = {
  compact?: boolean
}

function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div
      className={`overflow-hidden ${
        compact ? 'h-20 w-48' : 'h-28 w-64'
      }`}
    >
      <img
        src={logo}
        alt="RestauRank — Avalie · Ranqueie · Descubra"
        className="h-full w-full object-cover object-bottom"
      />
    </div>
  )
}

export default BrandLogo
