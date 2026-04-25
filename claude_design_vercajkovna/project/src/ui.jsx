// Shared UI — theme, phone frame, buttons, chips
// Theme tokens are driven by Tweaks: accent + typeface + logo variant

const THEMES = {
  green:    { accent: '#1b5431', accentSoft: 'rgba(27, 84, 49, 0.12)', accentBorder: 'rgba(27, 84, 49, 0.28)', accentInk: '#0f3a22' },
  mustard:  { accent: '#a3701a', accentSoft: 'rgba(163, 112, 26, 0.14)', accentBorder: 'rgba(163, 112, 26, 0.32)', accentInk: '#6e4a10' },
  brick:    { accent: '#9a3a1f', accentSoft: 'rgba(154, 58, 31, 0.12)', accentBorder: 'rgba(154, 58, 31, 0.3)', accentInk: '#6a2715' },
};

const TYPEFACES = {
  playfair: { display: '"Playfair Display", Georgia, serif', feel: 'Klasický, noblesní' },
  iowan:    { display: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif', feel: 'Původní, knižní' },
  fraunces: { display: '"Fraunces", "Iowan Old Style", Georgia, serif', feel: 'Současný, řemeslný' },
};

const vkPalette = {
  bg: '#f3ede1',        // warm paper
  bgDim: '#e9e0d1',
  card: '#fdf9f1',
  ink: '#1f1610',
  inkSoft: '#5a4a3c',
  inkMuted: '#8a7a6a',
  line: 'rgba(31, 22, 16, 0.14)',
  lineSoft: 'rgba(31, 22, 16, 0.08)',
  brand: '#3a2519',     // deep brown
  brandInk: '#fff7e6',
};

const ThemeContext = React.createContext({
  accent: THEMES.green,
  typeKey: 'playfair',
  displayFont: TYPEFACES.playfair.display,
  logoVariant: 'mark',
  palette: vkPalette,
});

// Logo component — two variants
const VercajkLogo = ({ variant = 'mark', size = 40, accent }) => {
  const { palette } = React.useContext(ThemeContext);
  if (variant === 'stamp') {
    // Craft stamp: circular seal with text around, tool glyph center
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${palette.brand}`, background: palette.card, display: 'grid', placeItems: 'center', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: size * 0.72, height: size * 0.72, borderRadius: '50%', border: `1px dashed ${palette.brand}`, display: 'grid', placeItems: 'center' }}>
          <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 24 24" fill="none" stroke={palette.brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/>
            <path d="M17.64 15 22 10.64a1 1 0 0 0 0-1.41L19 6.28a1 1 0 0 0-1.41 0L13 10.64"/>
            <path d="m11 8 5 5"/>
          </svg>
        </div>
      </div>
    );
  }
  // Default: chunky monogram block
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: palette.brand,
      color: palette.brandInk,
      display: 'grid', placeItems: 'center',
      fontFamily: '"Fraunces", Georgia, serif', fontWeight: 900,
      fontSize: size * 0.5, letterSpacing: '-0.04em',
      flexShrink: 0,
      boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)`,
    }}>V</div>
  );
};

// Phone frame — fixed 390×844, scales to fit
const PhoneFrame = ({ children, label }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 390, height: 844,
        borderRadius: 48,
        padding: 10,
        background: '#1a1410',
        boxShadow: '0 40px 80px -20px rgba(31,22,16,0.4), 0 0 0 2px rgba(0,0,0,0.1)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* notch */}
        <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', width: 110, height: 28, background: '#000', borderRadius: 20, zIndex: 50 }}/>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 40,
          background: palette.bg,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Status bar */}
          <div style={{ height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 28px 4px', fontSize: 13, fontWeight: 600, color: palette.ink, flexShrink: 0, zIndex: 10 }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="0.5"/><rect x="4" y="4" width="3" height="6" rx="0.5"/><rect x="8" y="2" width="3" height="8" rx="0.5"/><rect x="12" y="0" width="3" height="10" rx="0.5"/></svg>
              <svg width="24" height="11" viewBox="0 0 24 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5"/><rect x="2" y="2" width="17" height="7" rx="1" fill="currentColor"/><path d="M22 4v3" stroke="currentColor" strokeLinecap="round"/></svg>
            </div>
          </div>
          {children}
        </div>
      </div>
      {label && <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: palette.inkMuted }}>{label}</div>}
    </div>
  );
};

// Bottom nav
const BottomNav = ({ current, onNav }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const items = [
    { id: 'market', icon: 'home', label: 'Tržiště' },
    { id: 'favorites', icon: 'heart', label: 'Oblíbené' },
    { id: 'chat', icon: 'chat', label: 'Zprávy' },
    { id: 'profile', icon: 'user', label: 'Profil' },
  ];
  return (
    <div style={{
      flexShrink: 0,
      height: 78,
      background: palette.card,
      borderTop: `1px solid ${palette.line}`,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      paddingBottom: 14,
    }}>
      {items.map(it => {
        const active = current === it.id;
        return (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '10px 0 6px',
            color: active ? accent.accent : palette.inkMuted,
            position: 'relative',
          }}>
            {active && <div style={{ position: 'absolute', top: 0, width: 32, height: 3, background: accent.accent, borderRadius: 2 }}/>}
            <Icon name={it.icon === 'heart' && active ? 'heart-fill' : it.icon} size={22} stroke={active ? 2 : 1.5}/>
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Photo placeholder — warm striped
const ToolPlaceholder = ({ label, height = 180, accent: localAccent }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const acc = localAccent || accent.accent;
  return (
    <div style={{
      height,
      background: `repeating-linear-gradient(135deg, ${palette.bgDim} 0 14px, ${palette.bg} 14px 28px)`,
      borderRadius: 14,
      border: `1px solid ${palette.line}`,
      display: 'grid',
      placeItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: palette.inkSoft,
        background: palette.card,
        padding: '4px 10px',
        border: `1px solid ${palette.line}`,
        borderRadius: 3,
      }}>{label}</div>
    </div>
  );
};

// Button
const Btn = ({ children, variant = 'primary', onClick, style, full = true, size = 'md', disabled }) => {
  const { accent, palette } = React.useContext(ThemeContext);
  const heights = { sm: 36, md: 48, lg: 54 };
  const base = {
    width: full ? '100%' : 'auto',
    height: heights[size],
    padding: full ? 0 : '0 20px',
    borderRadius: 12,
    fontFamily: 'inherit',
    fontSize: size === 'sm' ? 13 : 14,
    fontWeight: 700,
    letterSpacing: '0.02em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform 120ms ease',
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary:   { background: palette.brand, color: palette.brandInk, border: 0 },
    accent:    { background: accent.accent, color: '#fff', border: 0 },
    secondary: { background: palette.card, color: palette.brand, border: `1px solid ${palette.line}` },
    ghost:     { background: 'transparent', color: palette.brand, border: 0 },
    danger:    { background: 'transparent', color: '#9a3a1f', border: `1px solid rgba(154, 58, 31, 0.3)` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
};

// Input
const Input = ({ icon, type = 'text', value, onChange, placeholder, right, autoFocus }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: icon ? 'auto 1fr auto' : '1fr auto',
      alignItems: 'center',
      gap: 10,
      minHeight: 52,
      padding: '0 14px',
      borderRadius: 12,
      border: `1.5px solid ${focused ? accent.accent : palette.line}`,
      background: '#ffffff',
      transition: 'border-color 150ms ease',
    }}>
      {icon && <Icon name={icon} size={18} color={palette.inkMuted}/>}
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', minWidth: 0, border: 0, background: 'transparent',
          outline: 'none', fontSize: 15, color: palette.ink,
          fontFamily: 'inherit',
        }}/>
      {right}
    </div>
  );
};

// Topbar inside phone
const Topbar = ({ left, title, right, kicker, bg, borderless }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 18px 12px',
      background: bg ?? 'transparent',
      borderBottom: borderless ? 0 : `1px solid ${palette.lineSoft}`,
      flexShrink: 0,
    }}>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        {kicker && <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 2 }}>{kicker}</div>}
        <div style={{ fontSize: 15, fontWeight: 700, color: palette.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
};

const IconButton = ({ name, onClick, active, children }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 12,
      background: active ? accent.accentSoft : palette.card,
      border: `1px solid ${active ? accent.accentBorder : palette.line}`,
      color: active ? accent.accent : palette.brand,
      display: 'grid', placeItems: 'center', cursor: 'pointer',
      flexShrink: 0,
    }}>
      {name && <Icon name={name} size={18}/>}
      {children}
    </button>
  );
};

// Avatar
const Avatar = ({ initial, size = 40, ring }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: palette.bgDim,
      color: palette.brand,
      display: 'grid', placeItems: 'center',
      fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700,
      fontSize: size * 0.42,
      border: ring ? `2px solid ${accent.accent}` : `1px solid ${palette.line}`,
      flexShrink: 0,
    }}>{initial}</div>
  );
};

// Star rating
const Stars = ({ rating, size = 12, showNumber = true, reviews }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: palette.ink }}>
      <Icon name="star" size={size} color={accent.accent}/>
      {showNumber && <span style={{ fontWeight: 700 }}>{rating.toFixed(1)}</span>}
      {reviews != null && <span style={{ color: palette.inkMuted }}>({reviews})</span>}
    </div>
  );
};

// Toast
const Toast = ({ message, onClose }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 2400);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: palette.brand, color: palette.brandInk,
      padding: '12px 18px', borderRadius: 12,
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
      zIndex: 100,
      whiteSpace: 'nowrap',
      animation: 'vkToast 200ms ease-out',
    }}>{message}</div>
  );
};

Object.assign(window, {
  THEMES, TYPEFACES, vkPalette, ThemeContext,
  VercajkLogo, PhoneFrame, BottomNav, ToolPlaceholder,
  Btn, Input, Topbar, IconButton, Avatar, Stars, Toast,
});
