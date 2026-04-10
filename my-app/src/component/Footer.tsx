import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  brandName?: string;
  tagline?: string;
  description?: string;
  logoSrc?: string;           // ← NEW: path to your logo image
  nithyasoooriLinks?: FooterLink[];
  enjomLinks?: FooterLink[];
  crystalWisdomLinks?: FooterLink[];
  sacredSpacesLinks?: FooterLink[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    youtube?: string;
    twitter?: string;
  };
  email?: string;
  phone?: string;
  address?: string;
  copyright?: string;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
const FooterLogo: React.FC<{ src: string; brandName: string }> = ({ src, brandName }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Fallback: text wordmark if image path is wrong or missing
    return (
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(26px, 3vw, 34px)',
        fontWeight: 800, color: '#f5f0ff',
        letterSpacing: '-0.02em', margin: '0 0 20px',
        lineHeight: 1,
      }}>
        {brandName}
      </h2>
    );
  }

  return (
    <img
      src={src}
      alt={`${brandName} logo`}
      onError={() => setImgError(true)}
      style={{
        height: 56,              // adjust to taste — 48–72px works well in footers
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        marginBottom: '20px',
        // If your logo is dark and needs to appear light on this dark footer, uncomment:
        // filter: 'brightness(0) invert(1)',
      }}
    />
  );
};

// ─── Social Icon Components ───────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.140-.828 3.330-.236.995.499 1.806 1.476 1.806 1.772 0 3.138-1.868 3.138-4.566 0-2.386-1.715-4.054-4.163-4.054-2.836 0-4.498 2.127-4.498 4.326 0 .857.330 1.775.741 2.276a.3.3 0 0 1 .069.286c-.076.313-.244.995-.277 1.134-.044.183-.146.222-.337.134C5.927 14.996 5 13.376 5 12c0-3.866 2.819-8 8.515-8 4.47 0 7.946 3.184 7.946 7.439 0 4.441-2.798 8.014-6.68 8.014-1.305 0-2.533-.679-2.954-1.479l-.803 2.998c-.291 1.118-1.076 2.520-1.602 3.374C11.15 21.947 11.575 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ─── Social Button ────────────────────────────────────────────────────────────
const SocialBtn: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '42px', height: '42px',
        borderRadius: '50%',
        border: `1.5px solid ${hovered ? '#7B4BA0' : 'rgba(255,255,255,0.15)'}`,
        background: hovered ? '#7B4BA0' : 'transparent',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
};

// ─── Animated Link ────────────────────────────────────────────────────────────
const FooterNavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        fontFamily: "'Crimson Text', Georgia, serif",
        fontSize: '15px', fontWeight: 400,
        color: hovered ? '#c4a8dc' : 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        letterSpacing: '0.3px',
        transition: 'color 0.22s ease',
        cursor: 'pointer',
      }}
    >
      <span style={{
        display: 'inline-block', width: '14px', height: '1px',
        background: hovered ? '#c4a8dc' : 'rgba(255,255,255,0.2)',
        transition: 'all 0.22s ease',
        transform: hovered ? 'scaleX(1.6)' : 'scaleX(1)',
        transformOrigin: 'left',
        flexShrink: 0,
      }} />
      {children}
    </a>
  );
};

// ─── Section heading inside footer columns ────────────────────────────────────
const BrandHeading: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
    <span style={{ display: 'block', width: '3px', height: '12px', borderRadius: '2px', background: color, flexShrink: 0 }} />
    <h4 style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '11px', fontWeight: 600,
      color,
      letterSpacing: '3px', textTransform: 'uppercase',
      margin: 0,
    }}>{children}</h4>
  </div>
);

// ─── Footer Component ─────────────────────────────────────────────────────────
const Footer: React.FC<FooterProps> = ({
  brandName = 'EMPAVAI',
  tagline = 'Museum Exhibition 2024',
  description = 'A sanctuary for those who believe beauty still has something urgent to say. Curating the finest intersection of ancient traditions and contemporary vision.',
  logoSrc = '/images/logo.jpeg',   // ← swap with your actual logo path e.g. '/logo.svg'

  nithyasoooriLinks = [
    { label: 'Crystal Art Decor',    href: '/collections/product-1' },
    { label: 'Aura Trinket Trays',   href: '/collections/aura-trinket-trays' },
    { label: 'Floating Flora Bowls', href: '/collections/floating-flora-bowls' },
  ],
  enjomLinks = [
    { label: 'Crystal Bracelets', href: '/collections/crystal-bracelets' },
    { label: 'Crystal Pendants',  href: '/collections/crystal-pendants' },
  ],
  crystalWisdomLinks = [
    { label: 'Chakra Connection', href: '/collections/chakra-connection' },
    { label: 'Zodiac Alignment',  href: '/collections/zodiac-alignment' },
    { label: 'Care & Cleanse',    href: '/collections/care-cleanse' },
  ],
  sacredSpacesLinks = [
    { label: 'About',   href: '/about-us' },
    { label: 'Artists', href: '/artists' },
    { label: 'Contact', href: '/contact' },
  ],
  socialLinks = {
    instagram: '#',
    facebook:  '#',
    pinterest: '#',
    youtube:   '#',
    twitter:   '#',
  },
  email    = 'hello@empavai.com',
  phone    = '+91 98765 43210',
  address  = 'Gallery District, Chennai, India',
  copyright = `© ${new Date().getFullYear()} Empavai. All rights reserved.`,
}) => {
  const [emailHovered, setEmailHovered] = useState(false);
  const [phoneHovered, setPhoneHovered] = useState(false);

  return (
    <footer style={{
      width: '100%',
      background: 'linear-gradient(160deg, #1a0f2e 0%, #120a22 60%, #0d0718 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Playfair Display', Georgia, serif",
    }}>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        @keyframes ft-pulse { 0%,100%{opacity:0.04} 50%{opacity:0.07} }
      `}</style>

      {/* Decorative background orbs */}
      <div style={{ position:'absolute', top:'-180px', right:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(123,75,160,0.12) 0%, transparent 65%)', pointerEvents:'none', animation:'ft-pulse 6s ease infinite' }} />
      <div style={{ position:'absolute', top:'60px', left:'-100px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(90,58,125,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* ── Top accent line ───────────────────────────────────────────────── */}
      <div style={{ width:'100%', height:'1px', background:'linear-gradient(90deg, transparent 0%, rgba(123,75,160,0.5) 30%, #7B4BA0 50%, rgba(123,75,160,0.5) 70%, transparent 100%)' }} />

      {/* ── Main footer body ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(56px, 7vw, 88px) clamp(20px, 5vw, 80px) 0',
      }}>

        {/* ── Top row: Brand + Links ────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(36px, 5vw, 64px)',
          marginBottom: 'clamp(48px, 6vw, 72px)',
        }}>

          {/* ── Brand column ─────────────────────────────────────────────── */}
          <div style={{ gridColumn: 'span 1' }}>

            {/* Tagline above logo */}
            <p style={{
              fontFamily: "'Crimson Text', Georgia, serif",
              fontSize: '10px', letterSpacing: '5px',
              textTransform: 'uppercase', color: '#7B4BA0',
              margin: '0 0 14px', opacity: 0.85,
            }}>{tagline}</p>

            {/* ── Logo image — replaces the old <h2> text wordmark ── */}
            <FooterLogo src={logoSrc} brandName={brandName} />

            {/* Ornamental divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'32px', height:'1px', background:'linear-gradient(to right, #7B4BA0, transparent)' }} />
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#7B4BA0', opacity:0.6 }} />
            </div>

            <p style={{
              fontFamily: "'Crimson Text', Georgia, serif",
              fontSize: '15px', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
              margin: '0 0 28px', maxWidth: '280px',
            }}>{description}</p>

            {/* Contact details */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'32px' }}>
              <a href={`mailto:${email}`}
                onMouseEnter={() => setEmailHovered(true)}
                onMouseLeave={() => setEmailHovered(false)}
                style={{
                  fontFamily:"'Crimson Text', Georgia, serif",
                  fontSize:'14px', color: emailHovered ? '#c4a8dc' : 'rgba(255,255,255,0.45)',
                  textDecoration:'none', letterSpacing:'0.3px',
                  transition:'color 0.22s ease', display:'flex', alignItems:'center', gap:'8px',
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {email}
              </a>
              <a href={`tel:${phone}`}
                onMouseEnter={() => setPhoneHovered(true)}
                onMouseLeave={() => setPhoneHovered(false)}
                style={{
                  fontFamily:"'Crimson Text', Georgia, serif",
                  fontSize:'14px', color: phoneHovered ? '#c4a8dc' : 'rgba(255,255,255,0.45)',
                  textDecoration:'none', letterSpacing:'0.3px',
                  transition:'color 0.22s ease', display:'flex', alignItems:'center', gap:'8px',
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {phone}
              </a>
              <p style={{ fontFamily:"'Crimson Text', serif", fontSize:'14px', color:'rgba(255,255,255,0.35)', margin:0, display:'flex', alignItems:'center', gap:'8px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {address}
              </p>
            </div>

            {/* Social icons */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {socialLinks.instagram && <SocialBtn href={socialLinks.instagram} label="Instagram"><InstagramIcon /></SocialBtn>}
              {socialLinks.facebook  && <SocialBtn href={socialLinks.facebook}  label="Facebook"><FacebookIcon /></SocialBtn>}
              {socialLinks.pinterest && <SocialBtn href={socialLinks.pinterest} label="Pinterest"><PinterestIcon /></SocialBtn>}
              {socialLinks.youtube   && <SocialBtn href={socialLinks.youtube}   label="YouTube"><YoutubeIcon /></SocialBtn>}
              {socialLinks.twitter   && <SocialBtn href={socialLinks.twitter}   label="X / Twitter"><TwitterIcon /></SocialBtn>}
            </div>
          </div>

          {/* ── Collections column: Nithyasoori + Enjem ──────────────────── */}
          <div>
            <h3 style={{
              fontFamily:"'Playfair Display', Georgia, serif",
              fontSize:'13px', fontWeight:600, color:'#f5f0ff',
              letterSpacing:'3px', textTransform:'uppercase',
              margin:'0 0 24px',
            }}>Collections</h3>

            <BrandHeading color="#9b6fe0">Nithyasoori</BrandHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px' }}>
              {nithyasoooriLinks.map(l => <FooterNavLink key={l.label} href={l.href}>{l.label}</FooterNavLink>)}
            </div>

            <BrandHeading color="#c084fc">Enjem</BrandHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {enjomLinks.map(l => <FooterNavLink key={l.label} href={l.href}>{l.label}</FooterNavLink>)}
            </div>
          </div>

          {/* ── Crystal Wisdom column ─────────────────────────────────────── */}
          <div>
            <h3 style={{
              fontFamily:"'Playfair Display', Georgia, serif",
              fontSize:'13px', fontWeight:600, color:'#f5f0ff',
              letterSpacing:'3px', textTransform:'uppercase',
              margin:'0 0 24px',
            }}>Crystal Wisdom</h3>

            <BrandHeading color="#7b2fbf">Crystal Wisdom</BrandHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {crystalWisdomLinks.map(l => <FooterNavLink key={l.label} href={l.href}>{l.label}</FooterNavLink>)}
            </div>
          </div>

          {/* ── Sacred Spaces column + newsletter ────────────────────────── */}
          <div>
            <h3 style={{
              fontFamily:"'Playfair Display', Georgia, serif",
              fontSize:'13px', fontWeight:600, color:'#f5f0ff',
              letterSpacing:'3px', textTransform:'uppercase',
              margin:'0 0 24px',
            }}>Sacred Spaces</h3>

            <BrandHeading color="#7c5cbf">Connect</BrandHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {sacredSpacesLinks.map(l => <FooterNavLink key={l.label} href={l.href}>{l.label}</FooterNavLink>)}
            </div>

            {/* Newsletter mini CTA */}
            <div style={{ marginTop:'36px' }}>
              <p style={{
                fontFamily:"'Crimson Text', Georgia, serif",
                fontSize:'13px', fontStyle:'italic',
                color:'rgba(255,255,255,0.35)',
                margin:'0 0 12px', letterSpacing:'0.3px',
              }}>Stay in the loop</p>
              <div style={{ display:'flex', height:'42px' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    flex:1, minWidth:0,
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    borderRight:'none',
                    color:'rgba(255,255,255,0.7)',
                    fontFamily:"'Crimson Text', serif",
                    fontSize:'14px',
                    padding:'0 14px',
                    outline:'none',
                    borderRadius:0,
                  }}
                />
                <button
                  style={{
                    background:'#7B4BA0',
                    border:'none',
                    color:'#fff',
                    padding:'0 16px',
                    cursor:'pointer',
                    fontFamily:"'Inter', sans-serif",
                    fontSize:'10px',
                    fontWeight:600,
                    letterSpacing:'2px',
                    textTransform:'uppercase',
                    flexShrink:0,
                    transition:'background 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#5A3A7D'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#7B4BA0'; }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Thin separator ────────────────────────────────────────────── */}
        <div style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'20px' }} />

        {/* ── Bottom bar: copyright + legal ─────────────────────────────── */}
        <div style={{
          display:'flex', flexWrap:'wrap',
          alignItems:'center', justifyContent:'space-between',
          gap:'12px', padding:'0 0 20px',
        }}>
          <p style={{
            fontFamily:"'Crimson Text', Georgia, serif",
            fontSize:'13px', color:'rgba(255,255,255,0.28)',
            margin:0, letterSpacing:'0.5px',
          }}>{copyright}</p>

          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {['Privacy Policy', 'Terms of Use', 'Accessibility'].map(txt => (
              <a key={txt} href="#" style={{
                fontFamily:"'Crimson Text', Georgia, serif",
                fontSize:'12px', color:'rgba(255,255,255,0.25)',
                textDecoration:'none', letterSpacing:'0.5px',
                transition:'color 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(196,168,220,0.7)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(255,255,255,0.25)'; }}>
                {txt}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── GIANT half-cropped brand watermark at the very bottom ─────────── */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        lineHeight: 1,
        marginTop: '-8px',
        pointerEvents: 'none',
        userSelect: 'none',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: 'clamp(100px, 20vw, 300px)',
          letterSpacing: '-0.03em',
          lineHeight: 0.82,
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.18)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          margin: '0 auto',
          padding: 0,
          transform: 'translateY(42%)',
          whiteSpace: 'nowrap',
          display: 'block',
        }}>
          {brandName}
        </p>
      </div>
    </footer>
  );
};

export default Footer;