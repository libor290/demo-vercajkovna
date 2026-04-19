// Market, Detail, Favorites, Chat

const { ThemeContext, Btn, Input, Icon, Avatar, Stars, Topbar, IconButton, ToolPlaceholder } = window;

// Market home
const MarketScreen = ({ listings, categories, favorites, onToggleFav, onOpen, onAdd, user, onProfile, onSearch }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [cat, setCat] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [priceMax, setPriceMax] = React.useState(1000);

  const filtered = listings.filter(l =>
    (cat === 'all' || l.category === cat) &&
    (!q || (l.title + l.owner.name + l.location).toLowerCase().includes(q.toLowerCase())) &&
    l.price <= priceMax
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
      {/* Header */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <window.VercajkLogo size={38}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 800, color: palette.brand, lineHeight: 1, letterSpacing: '-0.02em' }}>vercajkovna</div>
          <div style={{ fontSize: 11, color: palette.inkMuted, marginTop: 2 }}>Půjč si v Praze — nebo půjč.</div>
        </div>
        <button onClick={onProfile} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
          <Avatar initial={user.initial} size={38}/>
        </button>
      </div>

      {/* Greeting */}
      <div style={{ padding: '0 20px 18px' }}>
        <h1 style={{
          margin: 0, fontFamily: displayFont, fontSize: 30, fontWeight: 800,
          lineHeight: 0.98, letterSpacing: '-0.03em', color: palette.brand,
        }}>
          Co bude<br/>
          <span style={{ fontStyle: 'italic', color: accent.accent }}>dneska?</span>
        </h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Input icon="search" placeholder="Hledat vercajk…" value={q} onChange={setQ}/>
        </div>
        <IconButton name="sliders" onClick={() => setFilterOpen(!filterOpen)} active={filterOpen}/>
      </div>

      {filterOpen && (
        <div style={{ margin: '0 20px 14px', padding: '14px 16px', background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: palette.inkMuted, marginBottom: 10 }}>Maximální cena: {priceMax} Kč / den</div>
          <input type="range" min="100" max="1000" step="50" value={priceMax} onChange={e => setPriceMax(+e.target.value)}
            style={{ width: '100%', accentColor: accent.accent }}/>
        </div>
      )}

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '9px 16px 10px', borderRadius: 999,
            background: cat === c.id ? palette.brand : palette.card,
            color: cat === c.id ? palette.brandInk : palette.inkSoft,
            border: `1px solid ${cat === c.id ? palette.brand : palette.line}`,
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
            whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{c.glyph}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Hero card (first) */}
      {filtered[0] && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>★ Doporučený vercajk</span>
            <span>{filtered.length} výsledků</span>
          </div>
          <ListingCardHero listing={filtered[0]} onOpen={() => onOpen(filtered[0])} onFav={() => onToggleFav(filtered[0].id)} isFav={favorites.includes(filtered[0].id)}/>
        </div>
      )}

      {/* Rest */}
      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.slice(1).map(l => (
          <ListingCardSmall key={l.id} listing={l} onOpen={() => onOpen(l)} onFav={() => onToggleFav(l.id)} isFav={favorites.includes(l.id)}/>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, marginBottom: 12 }}>— verštat prázdný —</div>
          <div style={{ fontFamily: displayFont, fontSize: 22, color: palette.brand, lineHeight: 1.1 }}>Nic nenalezeno.<br/><em style={{ color: accent.accent }}>Zkus jiné filtry.</em></div>
        </div>
      )}
    </div>
  );
};

const ListingCardHero = ({ listing, onOpen, onFav, isFav }) => {
  const { palette, accent } = React.useContext(ThemeContext);
  return (
    <div onClick={onOpen} style={{
      background: palette.card, borderRadius: 18, overflow: 'hidden',
      border: `1px solid ${palette.line}`, cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', height: 200, background: palette.bgDim }}>
        <img src={listing.photo} alt={listing.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }}/>
        <button onClick={(e) => { e.stopPropagation(); onFav(); }} style={{
          position: 'absolute', top: 12, right: 12,
          width: 36, height: 36, borderRadius: '50%',
          background: palette.card, border: 0, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          color: isFav ? '#c33' : palette.ink,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <Icon name={isFav ? 'heart-fill' : 'heart'} size={18} color={isFav ? '#c33' : palette.ink}/>
        </button>
        {listing.badges[0] && (
          <div style={{ position: 'absolute', top: 12, left: 12, padding: '5px 10px', background: palette.brand, color: palette.brandInk, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{listing.badges[0]}</div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: palette.ink, lineHeight: 1.25 }}>{listing.title}</div>
            <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2 }}>{listing.location} · {listing.distance} km</div>
          </div>
          <Stars rating={listing.rating} reviews={listing.reviews}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 800, fontSize: 22, color: palette.brand }}>{listing.price} Kč</span>
          <span style={{ fontSize: 12, color: palette.inkMuted }}>/ den</span>
        </div>
      </div>
    </div>
  );
};

const ListingCardSmall = ({ listing, onOpen, onFav, isFav }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div onClick={onOpen} style={{
      background: palette.card, borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${palette.line}`, cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: palette.bgDim }}>
        <img src={listing.photo} alt={listing.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }}/>
        <button onClick={(e) => { e.stopPropagation(); onFav(); }} style={{
          position: 'absolute', top: 8, right: 8,
          width: 28, height: 28, borderRadius: '50%',
          background: palette.card, border: 0, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}>
          <Icon name={isFav ? 'heart-fill' : 'heart'} size={13} color={isFav ? '#c33' : palette.ink}/>
        </button>
      </div>
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: palette.ink, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</div>
        <div style={{ fontSize: 10.5, color: palette.inkMuted }}>{listing.distance} km · ★ {listing.rating}</div>
        <div style={{ marginTop: 'auto', paddingTop: 6, fontFamily: '"Fraunces", Georgia, serif', fontWeight: 800, fontSize: 16, color: palette.brand }}>
          {listing.price} <span style={{ fontSize: 10.5, color: palette.inkMuted, fontWeight: 500, fontFamily: 'inherit' }}>Kč/den</span>
        </div>
      </div>
    </div>
  );
};

// FAB
const FAB = ({ onClick }) => {
  const { accent } = React.useContext(ThemeContext);
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 90, right: 20,
      width: 58, height: 58, borderRadius: '50%',
      background: accent.accent, color: '#fff', border: 0, cursor: 'pointer',
      display: 'grid', placeItems: 'center',
      boxShadow: `0 10px 24px -6px ${accent.accent}66, 0 4px 10px rgba(0,0,0,0.15)`,
      zIndex: 40,
    }}>
      <Icon name="plus" size={24} stroke={2.4}/>
    </button>
  );
};

// Detail
const DetailScreen = ({ listing, onBack, favorites, onToggleFav, onChat, onReserve }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const isFav = favorites.includes(listing.id);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero photo */}
        <div style={{ position: 'relative', height: 320, background: palette.bgDim }}>
          <img src={listing.photo} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onBack} style={{
              width: 42, height: 42, borderRadius: '50%', background: palette.card, border: 0, cursor: 'pointer',
              display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}><Icon name="arrow-left" size={18} color={palette.ink}/></button>
            <button onClick={() => onToggleFav(listing.id)} style={{
              width: 42, height: 42, borderRadius: '50%', background: palette.card, border: 0, cursor: 'pointer',
              display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}><Icon name={isFav ? 'heart-fill' : 'heart'} size={18} color={isFav ? '#c33' : palette.ink}/></button>
          </div>
          <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)' }}>1 / 4</div>
        </div>

        <div style={{ padding: '20px 22px 24px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {listing.badges.map(b => (
              <span key={b} style={{ padding: '4px 10px', background: accent.accentSoft, color: accent.accent, borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{b}</span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontFamily: displayFont, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: palette.brand, lineHeight: 1.15, textWrap: 'balance' }}>{listing.title}</h1>
          {listing.subtitle && <div style={{ fontSize: 13, color: palette.inkMuted, marginTop: 8, lineHeight: 1.4 }}>{listing.subtitle}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, fontSize: 13 }}>
            <Stars rating={listing.rating} reviews={listing.reviews}/>
            <span style={{ color: palette.inkMuted }}>·</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: palette.inkSoft }}>
              <Icon name="pin" size={13}/> {listing.location}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, margin: '18px 0 20px', padding: '16px 18px', background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14 }}>
            <div>
              <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 900, fontSize: 34, color: palette.brand, lineHeight: 1, letterSpacing: '-0.02em' }}>{listing.price} Kč</div>
              <div style={{ fontSize: 12, color: palette.inkMuted, marginTop: 2 }}>za den · kauce {listing.deposit} Kč</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent.accent, fontWeight: 700 }}>{listing.available ? '● volný dnes' : 'obsazený'}</div>
          </div>

          {/* Owner */}
          <div style={{ padding: '14px 16px', background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Avatar initial={listing.owner.initial} size={46}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: palette.brand, fontSize: 14 }}>{listing.owner.name}</div>
              <div style={{ fontSize: 12, color: palette.inkMuted }}>Na Vercajkovně od {listing.owner.since} · ★ {listing.owner.rating}</div>
            </div>
            <Btn variant="secondary" size="sm" full={false} onClick={onChat}><Icon name="chat" size={14}/> Napsat</Btn>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 8 }}>Popis</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: palette.inkSoft }}>{listing.description}</p>
          </div>

          {/* Availability calendar mini */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 10 }}>Dostupnost · Duben 2026</div>
            <MiniCalendar/>
          </div>
        </div>
      </div>

      {/* Sticky action */}
      <div style={{ padding: '12px 22px 20px', background: palette.bg, borderTop: `1px solid ${palette.lineSoft}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <Btn variant="secondary" full={false} onClick={onChat} style={{ flexShrink: 0 }}><Icon name="chat" size={16}/></Btn>
        <Btn variant="accent" size="lg" onClick={onReserve} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Rezervovat · {listing.price} Kč/den
        </Btn>
      </div>
    </div>
  );
};

const MiniCalendar = () => {
  const { palette, accent } = React.useContext(ThemeContext);
  const days = ['Po','Út','St','Čt','Pá','So','Ne'];
  const startOffset = 2; // Apr 1 2026 = Wed
  const unavailable = [6, 7, 14, 21, 22];
  const selected = [18, 19, 20];
  return (
    <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 14, padding: '14px 14px 10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {days.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: palette.inkMuted, letterSpacing: '0.04em' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: startOffset }).map((_, i) => <div key={'e'+i}/>)}
        {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
          const isSel = selected.includes(d);
          const isUn = unavailable.includes(d);
          return (
            <div key={d} style={{
              height: 32, borderRadius: 8,
              display: 'grid', placeItems: 'center',
              fontSize: 12, fontWeight: 600,
              background: isSel ? accent.accent : 'transparent',
              color: isSel ? '#fff' : (isUn ? palette.inkMuted : palette.ink),
              textDecoration: isUn ? 'line-through' : 'none',
              opacity: isUn ? 0.5 : 1,
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
};

// Favorites
const FavoritesScreen = ({ listings, favorites, onToggleFav, onOpen, onDiscover }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const favs = listings.filter(l => favorites.includes(l.id));
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '12px 22px 18px' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 8 }}>— tvé oblíbené —</div>
        <h1 style={{ margin: 0, fontFamily: displayFont, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1 }}>
          Vercajk na<br/><span style={{ fontStyle: 'italic', color: accent.accent }}>příště.</span>
        </h1>
      </div>
      {favs.length === 0 ? (
        <div style={{ padding: '30px 24px', textAlign: 'center' }}>
          <div style={{
            width: 120, height: 120, margin: '0 auto 20px',
            borderRadius: '50%', background: palette.bgDim,
            display: 'grid', placeItems: 'center',
            border: `2px dashed ${palette.line}`,
          }}>
            <Icon name="heart" size={40} color={palette.inkMuted} stroke={1.4}/>
          </div>
          <h2 style={{ margin: 0, fontFamily: displayFont, fontSize: 22, color: palette.brand, lineHeight: 1.15 }}>Zatím tu nic nemáš.</h2>
          <p style={{ margin: '8px 0 20px', fontSize: 13.5, color: palette.inkSoft, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Srdíčkem si označ vercajk, ke kterému se chceš vrátit. Třeba až přijde inspirace.
          </p>
          <Btn variant="secondary" full={false} onClick={onDiscover}>Prozkoumat tržiště</Btn>
        </div>
      ) : (
        <div style={{ padding: '0 22px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {favs.map(l => (
            <ListingCardSmall key={l.id} listing={l} onOpen={() => onOpen(l)} onFav={() => onToggleFav(l.id)} isFav={true}/>
          ))}
        </div>
      )}
    </div>
  );
};

// Chat list + thread
const ChatListScreen = ({ conversations, onOpen }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '12px 22px 18px' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 8 }}>— zprávy —</div>
        <h1 style={{ margin: 0, fontFamily: displayFont, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1 }}>
          Co je<br/><span style={{ fontStyle: 'italic', color: accent.accent }}>nového?</span>
        </h1>
      </div>
      <div>
        {conversations.map(c => (
          <div key={c.id} onClick={() => onOpen(c)} style={{
            padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', borderBottom: `1px solid ${palette.lineSoft}`,
          }}>
            <Avatar initial={c.with.initial} size={46}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: palette.brand }}>{c.with.name}</div>
                <div style={{ fontSize: 11, color: palette.inkMuted, flexShrink: 0 }}>{c.time}</div>
              </div>
              <div style={{ fontSize: 11, color: palette.inkMuted, marginTop: 1, fontStyle: 'italic' }}>o „{c.listing}"</div>
              <div style={{ fontSize: 13, color: palette.inkSoft, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
            </div>
            {c.unread > 0 && <div style={{
              flexShrink: 0, minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999,
              background: accent.accent, color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>{c.unread}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatThreadScreen = ({ conversation, onBack, onSend }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [conversation]);
  const send = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar
        left={<button onClick={onBack} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: palette.brand, padding: 4 }}><Icon name="arrow-left" size={20}/></button>}
        title={conversation.with.name}
        kicker={`o „${conversation.listing}"`}
        right={<IconButton name="phone"/>}
      />
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
        {conversation.messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start', margin: '6px 0' }}>
            <div style={{
              maxWidth: '75%',
              padding: '9px 13px',
              borderRadius: 16,
              borderBottomRightRadius: m.from === 'me' ? 4 : 16,
              borderBottomLeftRadius: m.from === 'me' ? 16 : 4,
              background: m.from === 'me' ? accent.accent : palette.card,
              color: m.from === 'me' ? '#fff' : palette.ink,
              border: m.from === 'me' ? 0 : `1px solid ${palette.line}`,
              fontSize: 14, lineHeight: 1.4,
            }}>
              {m.text}
              <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px 14px', borderTop: `1px solid ${palette.lineSoft}`, display: 'flex', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1 }}><Input placeholder="Napiš zprávu…" value={input} onChange={setInput}/></div>
        <button onClick={send} style={{
          width: 48, height: 52, borderRadius: 12,
          background: accent.accent, color: '#fff', border: 0, cursor: 'pointer',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><Icon name="send" size={18}/></button>
      </div>
    </div>
  );
};

Object.assign(window, { MarketScreen, FAB, DetailScreen, FavoritesScreen, ChatListScreen, ChatThreadScreen });
