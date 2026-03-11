interface ContentSectionProps {
  label: string;
  heading: string;
  body: string;
  // 0–1: how visible this section is (drives fade + translateY)
  visibility: number;
}

export default function ContentSection({ label, heading, body, visibility }: ContentSectionProps) {
  // visibility < 0 = below fold, 0–1 = entering, >1 = past
  const clampedV = Math.max(0, Math.min(1, visibility));
  const opacity = clampedV;
  const translateY = (1 - clampedV) * 24;

  return (
    <div
      className="content-section"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'none', // GSAP-driven, not CSS transition
      }}
    >
      <span className="section-label">{label}</span>
      <div className="section-divider-gold" />
      <h2 className="section-heading">{heading}</h2>
      <div className="section-divider-gold" />
      <p className="section-body">{body}</p>
    </div>
  );
}
