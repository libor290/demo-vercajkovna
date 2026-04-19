// Profile + sub-screens: Personal, Listings, Payments, Security, Language, Notifications, Help

const { ThemeContext, Btn, Input, Icon, Avatar, Topbar, IconButton } = window;

const ProfileScreen = ({ user, listings, onNav, onLogout }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const items = [
    { id: 'personal',      icon: 'user',        label: 'Osobní údaje',    meta: 'Jméno, kontakt, bio' },
    { id: 'listings',      icon: 'hammer',      label: 'Můj vercajk',     meta: '3 aktivní nabídky' },
    { id: 'pending',       icon: 'calendar',    label: 'Rezervace',       meta: 'Žádosti a pronájmy' },
    { id: 'payments',      icon: 'credit-card', label: 'Platby',          meta: '•••• 4242' },
    { id: 'security',      icon: 'shield',      label: 'Zabezpečení',     meta: 'Heslo, 2FA' },
    { id: 'language',      icon: 'globe',       label: 'Jazyk a měna',    meta: 'Čeština · CZK' },
    { id: 'notifications', icon: 'bell',        label: 'Oznámení',        meta: 'Zapnuto' },
    { id: 'help',          icon: 'help',        label: 'Nápověda',        meta: 'FAQ, napiš nám' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
      <div style={{ padding: '12px 22px 20px' }}>
        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px', background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 16, marginBottom: 12 }}>
          <Avatar initial={user.initial} size={60} ring/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: displayFont, fontSize: 19, fontWeight: 700, color: palette.brand, lineHeight: 1.15 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '3px 9px', background: accent.accentSoft, color: accent.accent, borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Icon name="check" size={10} stroke={3}/> Ověřený soused
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
          {[{ n: '12', l: 'Půjčeno' }, { n: '8', l: 'Vypůjčeno' }, { n: '4.9', l: 'Hodnocení', star: true }].map(s => (
            <div key={s.l} style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 800, color: palette.brand, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {s.star && <Icon name="star" size={13} color={accent.accent}/>}{s.n}
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 16, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              width: '100%', padding: '14px 16px', background: 'transparent',
              border: 0, borderTop: i > 0 ? `1px solid ${palette.lineSoft}` : 0,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: palette.bgDim, color: palette.brand, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={it.icon} size={18} stroke={1.6}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: palette.ink }}>{it.label}</div>
                <div style={{ fontSize: 11.5, color: palette.inkMuted, marginTop: 1 }}>{it.meta}</div>
              </div>
              <Icon name="chevron-right" size={16} color={palette.inkMuted}/>
            </button>
          ))}
        </div>

        <button onClick={onLogout} style={{ marginTop: 14, width: '100%', padding: '14px 16px', background: 'transparent', border: `1px solid ${palette.line}`, borderRadius: 14, cursor: 'pointer', color: '#9a3a1f', fontWeight: 700, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="logout" size={16}/> Odhlásit se
        </button>
        <div style={{ textAlign: 'center', marginTop: 18, fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.inkMuted }}>v 1.0 · vercajkovna · praha</div>
      </div>
    </div>
  );
};

// ── Personal data ──
const PersonalDataScreen = ({ user, onBack, onSave }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const [form, setForm] = React.useState({
    firstName: user.name?.split(' ')[0] || 'Tomáš',
    lastName: user.name?.split(' ').slice(1).join(' ') || 'Novák',
    email: user.email || 'tomas@vercajkovna.cz',
    phone: '+420 777 123 456',
    address: 'Dlouhá 12, Praha 7',
    bio: 'Víkendový kutil z Letné. Víc lešení doma, než pánský pokoj.',
  });
  const [saved, setSaved] = React.useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Osobní údaje"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 24px' }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 10, padding: '12px 0 20px' }}>
          <Avatar initial={form.firstName[0]} size={80} ring/>
          <button style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 999, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: palette.brand }}>Změnit foto</button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PField label="Jméno"><Input value={form.firstName} onChange={v => upd('firstName', v)}/></PField>
            <PField label="Příjmení"><Input value={form.lastName} onChange={v => upd('lastName', v)}/></PField>
          </div>
          <PField label="E-mail"><Input icon="mail" type="email" value={form.email} onChange={v => upd('email', v)}/></PField>
          <PField label="Telefon" hint="Ověřený ✓"><Input icon="phone" value={form.phone} onChange={v => upd('phone', v)}/></PField>
          <PField label="Adresa"><Input icon="pin" value={form.address} onChange={v => upd('address', v)}/></PField>
          <PField label="O mně">
            <textarea value={form.bio} onChange={e => upd('bio', e.target.value)}
              style={{ width: '100%', minHeight: 96, padding: '12px 14px', border: `1.5px solid ${palette.line}`, borderRadius: 12, background: palette.card, fontFamily: 'inherit', fontSize: 14, color: palette.ink, resize: 'vertical', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}/>
          </PField>
        </div>
      </div>
      <div style={{ padding: '12px 22px 20px', background: palette.bg, borderTop: `1px solid ${palette.lineSoft}`, flexShrink: 0 }}>
        <Btn variant="primary" size="lg" onClick={save} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {saved ? <><Icon name="check" size={16} stroke={3}/> Uloženo</> : 'Uložit změny'}
        </Btn>
      </div>
    </div>
  );
};

// ── My Listings ──
const ProfileListingsScreen = ({ listings, onBack, onOpen }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [tab, setTab] = React.useState('offers');
  const OFFER_STATUS = { 'festool-ts55': { l: 'Čeká na schválení', t: 'brown' }, 'karcher-wash': { l: 'Aktivní', t: 'green' }, 'makita-drill': { l: 'Aktivní', t: 'green' } };
  const myListings = listings.slice(0, 5).map((l, i) => ({ ...l, statusLabel: OFFER_STATUS[l.id]?.l || 'Aktivní', statusTone: OFFER_STATUS[l.id]?.t || 'green' }));

  const statusColors = { green: { bg: 'rgba(27,84,49,0.14)', color: '#1b5431' }, brown: { bg: 'rgba(58,37,25,0.14)', color: '#3a2519' }, muted: { bg: 'rgba(100,90,80,0.12)', color: '#6f6258' } };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Můj vercajk"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {['offers','requests'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              height: 40, border: `1.5px solid ${tab === t ? accent.accent : palette.line}`,
              borderRadius: 12, background: tab === t ? accent.accentSoft : palette.card,
              color: tab === t ? accent.accent : palette.inkSoft,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>{t === 'offers' ? 'Nabídky' : 'Poptávky'}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {myListings.map(l => {
            const sc = statusColors[l.statusTone] || statusColors.muted;
            return (
              <button key={l.id} onClick={() => onOpen(l)} style={{
                padding: '14px 16px', background: palette.card,
                border: `1px solid ${palette.line}`, borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: palette.bgDim, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={l.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: palette.brand, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2 }}>{l.location}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: palette.brand, marginTop: 4 }}>{l.price} Kč / den</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', background: sc.bg, color: sc.color, flexShrink: 0 }}>
                  {l.statusLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Payments ──
const PaymentsScreen = ({ onBack }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [cards] = React.useState([
    { id: 'c1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: 'c2', brand: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false },
  ]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Platby"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 12 }}>Uložené karty</div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
          {cards.map(c => (
            <div key={c.id} style={{ padding: '16px 18px', background: palette.card, border: `1.5px solid ${c.isDefault ? accent.accent : palette.line}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 28, borderRadius: 6, background: c.brand === 'Visa' ? '#1a1f71' : '#eb001b', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.04em' }}>{c.brand}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: palette.brand, letterSpacing: '0.06em' }}>•••• •••• •••• {c.last4}</div>
                <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2 }}>Platnost {c.expiry}</div>
              </div>
              {c.isDefault && <div style={{ padding: '3px 9px', background: accent.accentSoft, color: accent.accent, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Výchozí</div>}
            </div>
          ))}
        </div>
        <Btn variant="secondary" onClick={() => {}} style={{ marginBottom: 24 }}><Icon name="plus" size={16}/> Přidat kartu</Btn>

        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 12 }}>Historie plateb</div>
        {[
          { date: '15. 4. 2026', item: 'Ponorná pila Festool TS 55', amount: '+1 350 Kč', type: 'příjem' },
          { date: '10. 4. 2026', item: 'Aku vrtačka Makita 18V', amount: '-540 Kč', type: 'platba' },
          { date: '3. 4. 2026', item: 'Vysokotlaký čistič Kärcher', amount: '+870 Kč', type: 'příjem' },
        ].map((t, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${palette.lineSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: palette.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.item}</div>
              <div style={{ fontSize: 11, color: palette.inkMuted, marginTop: 2 }}>{t.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: t.type === 'příjem' ? '#1b5431' : palette.brand, flexShrink: 0 }}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Security ──
const SecurityScreen = ({ onBack }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const [twofa, setTwofa] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Zabezpečení"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700 }}>Heslo</div>
          <PField label="Současné heslo"><Input type="password" placeholder="••••••••"/></PField>
          <PField label="Nové heslo"><Input type="password" placeholder="Min. 8 znaků, velké písmeno…"/></PField>
          <PField label="Potvrdit heslo"><Input type="password" placeholder="Zopakuj nové heslo"/></PField>
          <Btn variant="secondary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1600); }}>
            {saved ? <><Icon name="check" size={14} stroke={3}/> Uloženo</> : 'Změnit heslo'}
          </Btn>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 12 }}>Dvoufaktorové ověření</div>
        <div style={{ padding: '16px 18px', background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: twofa ? accent.accentSoft : palette.bgDim, color: twofa ? accent.accent : palette.inkMuted, display: 'grid', placeItems: 'center' }}>
            <Icon name="phone" size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: palette.brand, fontSize: 14 }}>SMS ověření</div>
            <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2 }}>{twofa ? 'Aktivní — +420 777 123 456' : 'Vypnuto'}</div>
          </div>
          <PToggle on={twofa} onChange={setTwofa}/>
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: palette.bgDim, borderRadius: 12, fontSize: 12, color: palette.inkSoft, lineHeight: 1.5 }}>
          Při každém přihlášení ti pošleme SMS kód pro ověření identity.
        </div>
      </div>
    </div>
  );
};

// ── Language ──
const LanguageScreen = ({ onBack }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const [lang, setLang] = React.useState('cs');
  const [curr, setCurr] = React.useState('CZK');
  const langs = [{ id: 'cs', label: 'Čeština', flag: '🇨🇿' }, { id: 'sk', label: 'Slovenčina', flag: '🇸🇰' }, { id: 'en', label: 'English', flag: '🇬🇧' }];
  const currs = ['CZK', 'EUR', 'USD'];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Jazyk a měna"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 12 }}>Jazyk rozhraní</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
          {langs.map(l => (
            <button key={l.id} onClick={() => setLang(l.id)} style={{
              padding: '14px 16px', background: palette.card,
              border: `1.5px solid ${lang === l.id ? accent.accent : palette.line}`,
              borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 24 }}>{l.flag}</span>
              <span style={{ fontWeight: lang === l.id ? 700 : 500, color: palette.brand, fontSize: 15 }}>{l.label}</span>
              {lang === l.id && <div style={{ marginLeft: 'auto' }}><Icon name="check" size={16} color={accent.accent} stroke={2.5}/></div>}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 12 }}>Měna</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {currs.map(c => (
            <button key={c} onClick={() => setCurr(c)} style={{
              flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
              background: curr === c ? accent.accentSoft : palette.card,
              border: `1.5px solid ${curr === c ? accent.accent : palette.line}`,
              color: curr === c ? accent.accent : palette.brand,
              fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Notifications ──
const NotificationsScreen = ({ onBack }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  const [prefs, setPrefs] = React.useState({
    newRequest: true, requestApproved: true, paymentReceived: true,
    newMessage: true, reminders: false, marketing: false,
  });
  const items = [
    { k: 'newRequest', l: 'Nová žádost o půjčení', sub: 'Když někdo pošle žádost na tvůj inzerát' },
    { k: 'requestApproved', l: 'Schválení žádosti', sub: 'Majitel schválil nebo zamítl tvou žádost' },
    { k: 'paymentReceived', l: 'Platba přijata', sub: 'Potvrzení o přijatých i odeslaných platbách' },
    { k: 'newMessage', l: 'Nová zpráva', sub: 'Příchozí zpráva v chatu' },
    { k: 'reminders', l: 'Připomínky', sub: 'Blížící se termíny vyzvednutí a vrácení' },
    { k: 'marketing', l: 'Novinky z Vercajkovny', sub: 'Nové funkce, akce, tipy pro pronájem' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Oznámení"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 22px 24px' }}>
        <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <div key={it.k} style={{ padding: '14px 16px', borderTop: i > 0 ? `1px solid ${palette.lineSoft}` : 0, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: palette.ink }}>{it.l}</div>
                <div style={{ fontSize: 11.5, color: palette.inkMuted, marginTop: 2, lineHeight: 1.4 }}>{it.sub}</div>
              </div>
              <PToggle on={prefs[it.k]} onChange={v => setPrefs(p => ({ ...p, [it.k]: v }))}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Help ──
const HelpScreen = ({ onBack }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title="Nápověda"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 22px 40px' }}>
        <h2 style={{ margin: '4px 0 16px', fontFamily: displayFont, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1.05 }}>
          Jak ti <em style={{ color: accent.accent }}>pomůžem?</em>
        </h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {window.FAQ.map((f, i) => (
            <div key={i} style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: palette.brand }}>{f.q}</div>
                <Icon name={open === i ? 'chevron-down' : 'chevron-right'} size={16} color={palette.inkMuted}/>
              </button>
              {open === i && <div style={{ padding: '12px 16px 14px', fontSize: 13.5, lineHeight: 1.6, color: palette.inkSoft, borderTop: `1px solid ${palette.lineSoft}` }}>{f.a}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 18, background: accent.accentSoft, border: `1px solid ${accent.accentBorder}`, borderRadius: 14 }}>
          <div style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, color: accent.accentInk, marginBottom: 6 }}>Nenašel jsi odpověď?</div>
          <div style={{ fontSize: 13, color: accent.accentInk, opacity: 0.85, lineHeight: 1.5, marginBottom: 12 }}>Napiš nám — odpovídáme během dne.</div>
          <Btn variant="accent" full onClick={() => {}}>Napsat podpoře</Btn>
        </div>
      </div>
    </div>
  );
};

// ── Shared helpers ──
const PField = ({ label, hint, children }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label && <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: palette.brand, paddingLeft: 2 }}>{label}</div>}
      {children}
      {hint && <div style={{ fontSize: 11.5, color: palette.inkMuted, paddingLeft: 2 }}>{hint}</div>}
    </div>
  );
};

const PToggle = ({ on, onChange }) => {
  const { accent, palette } = React.useContext(ThemeContext);
  return (
    <button onClick={() => onChange(!on)} style={{ width: 46, height: 26, borderRadius: 999, border: 0, cursor: 'pointer', padding: 2, flexShrink: 0, background: on ? accent.accent : palette.bgDim, transition: 'background 180ms' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', transform: `translateX(${on ? 20 : 0}px)`, transition: 'transform 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
};

const SimpleScreen = ({ title, onBack, children }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar left={<BackBtn onClick={onBack}/>} title={title}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 22px 40px' }}>{children}</div>
    </div>
  );
};

const BackBtn = ({ onClick }) => {
  const { palette } = React.useContext(ThemeContext);
  return <button onClick={onClick} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: palette.brand, padding: 4 }}><Icon name="arrow-left" size={20}/></button>;
};

Object.assign(window, { ProfileScreen, PersonalDataScreen, ProfileListingsScreen, PaymentsScreen, SecurityScreen, LanguageScreen, NotificationsScreen, HelpScreen, SimpleScreen });
