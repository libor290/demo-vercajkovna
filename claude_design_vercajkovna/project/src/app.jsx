// Main app — routing, tweaks, easter eggs

const { ThemeContext, THEMES, TYPEFACES, vkPalette, PhoneFrame, BottomNav, FAB, Toast, Btn, IconButton, Icon, VercajkLogo } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typeface": "playfair",
  "accent": "green",
  "logoVariant": "mark"
}/*EDITMODE-END*/;

// ---- App root ----
const App = () => {
  // theme state
  const [typeKey, setTypeKey] = React.useState(TWEAK_DEFAULTS.typeface);
  const [accentKey, setAccentKey] = React.useState(TWEAK_DEFAULTS.accent);
  const [logoVariant, setLogoVariant] = React.useState(TWEAK_DEFAULTS.logoVariant);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [tweaksAvailable, setTweaksAvailable] = React.useState(false);

  // routing
  const [route, setRoute] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('vk.route')) || { screen: 'auth' }; }
    catch { return { screen: 'auth' }; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('vk.route', JSON.stringify(route)); } catch {}
  }, [route]);

  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('vk.user')); } catch { return null; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('vk.user', JSON.stringify(user)); } catch {}
  }, [user]);

  const [favorites, setFavorites] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('vk.favs')) || ['festool-ts55', 'karcher-wash']; }
    catch { return []; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('vk.favs', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  const [conversations, setConversations] = React.useState(window.CONVERSATIONS);
  const [toast, setToast] = React.useState(null);
  const [listings, setListings] = React.useState(window.LISTINGS);
  const [easterActive, setEasterActive] = React.useState(false);
  const [logoTaps, setLogoTaps] = React.useState(0);

  const theme = React.useMemo(() => ({
    accent: THEMES[accentKey],
    typeKey,
    displayFont: TYPEFACES[typeKey].display,
    logoVariant,
    palette: vkPalette,
  }), [accentKey, typeKey, logoVariant]);

  // ---- Tweak protocol ----
  React.useEffect(() => {
    const handler = (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === '__activate_edit_mode') setTweaksOpen(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    setTweaksAvailable(true);
    return () => window.removeEventListener('message', handler);
  }, []);

  const persist = (patch) => {
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*'); } catch {}
  };

  // ---- Handlers ----
  const handleAuth = (u, isRegister) => {
    setUser(u);
    if (isRegister) setRoute({ screen: 'onboarding' });
    else setRoute({ screen: 'market' });
  };
  const finishOnboarding = () => {
    setRoute({ screen: 'market' });
    setToast('Vítej ve verštatu! 🔧');
  };
  const logout = () => {
    setUser(null);
    setRoute({ screen: 'auth' });
  };
  const toggleFav = (id) => {
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };
  const openListing = (listing) => setRoute({ screen: 'detail', listingId: listing.id, back: route.screen });
  const startChat = (listing) => {
    // Find or create conversation
    const existing = conversations.find(c => c.listing === listing.title);
    if (existing) setRoute({ screen: 'chat-thread', cid: existing.id });
    else {
      const cid = 'c-' + Date.now();
      const convo = {
        id: cid,
        with: { name: listing.owner.name + '.', initial: listing.owner.initial },
        listing: listing.title,
        lastMessage: 'Ahoj! Je vercajk volný tenhle víkend?',
        time: 'teď',
        unread: 0,
        messages: [
          { from: 'me', text: 'Ahoj! Je vercajk volný tenhle víkend?', time: 'teď' },
        ],
      };
      setConversations(cs => [convo, ...cs]);
      setRoute({ screen: 'chat-thread', cid });
    }
  };
  const sendMessage = (cid, text) => {
    setConversations(cs => cs.map(c => c.id === cid
      ? { ...c, messages: [...c.messages, { from: 'me', text, time: 'teď' }], lastMessage: text, time: 'teď', unread: 0 }
      : c));
    // Fake reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Super, dík za zprávu!',
        'Jasně, domluvíme se.',
        'Mrknu a napíšu.',
        'Paráda. V kolik by se ti hodilo?',
      ];
      const r = replies[Math.floor(Math.random() * replies.length)];
      setConversations(cs => cs.map(c => c.id === cid
        ? { ...c, messages: [...c.messages, { from: 'them', text: r, time: 'teď' }], lastMessage: r, time: 'teď' }
        : c));
    }, 1400);
  };
  const reserve = (listing) => {
    setToast(`Žádost o „${listing.title}" odeslána ✓`);
    setTimeout(() => startChat(listing), 400);
  };
  const publishListing = (draft) => {
    const id = 'mine-' + Date.now();
    const newL = {
      id,
      title: draft.title,
      subtitle: 'Tvůj nový vercajk',
      price: Number(draft.price),
      deposit: draft.depositEnabled ? Number(draft.deposit) : 0,
      location: 'Praha 7 — Letná',
      distance: 0.4,
      rating: 5.0,
      reviews: 0,
      category: draft.category,
      owner: { name: user.name.split(' ')[0], initial: user.initial, since: '2026', rating: 5.0 },
      photo: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800&q=80',
      badges: ['Nový'],
      description: draft.description,
      available: draft.available,
    };
    setListings(ls => [newL, ...ls]);
    setRoute({ screen: 'add-success', draft });
  };

  // ---- Easter egg: tap logo 3× ----
  const bumpLogo = () => {
    const n = logoTaps + 1;
    setLogoTaps(n);
    if (n >= 3) {
      setLogoTaps(0);
      setEasterActive(true);
      setToast('🔧 Verjcajk mód aktivován');
      setTimeout(() => setEasterActive(false), 4000);
    }
  };

  // ---- Screen router ----
  let screen;
  const tabs = ['market', 'favorites', 'chat', 'profile'];
  const showChrome = tabs.includes(route.screen);

  if (route.screen === 'auth' || !user) {
    screen = <window.AuthScreen onAuth={handleAuth}/>;
  } else if (route.screen === 'onboarding') {
    screen = <window.OnboardingFlow user={user} onDone={finishOnboarding}/>;
  } else if (route.screen === 'market') {
    screen = <window.MarketScreen
      listings={listings}
      categories={window.CATEGORIES}
      favorites={favorites}
      onToggleFav={toggleFav}
      onOpen={openListing}
      onAdd={() => setRoute({ screen: 'add' })}
      user={user}
      onProfile={() => setRoute({ screen: 'profile' })}
    />;
  } else if (route.screen === 'favorites') {
    screen = <window.FavoritesScreen listings={listings} favorites={favorites} onToggleFav={toggleFav} onOpen={openListing} onDiscover={() => setRoute({ screen: 'market' })}/>;
  } else if (route.screen === 'chat') {
    screen = <window.ChatListScreen conversations={conversations} onOpen={(c) => setRoute({ screen: 'chat-thread', cid: c.id })}/>;
  } else if (route.screen === 'chat-thread') {
    const convo = conversations.find(c => c.id === route.cid);
    screen = convo
      ? <window.ChatThreadScreen conversation={convo} onBack={() => setRoute({ screen: 'chat' })} onSend={(t) => sendMessage(convo.id, t)}/>
      : null;
  } else if (route.screen === 'profile') {
    screen = <window.ProfileScreen user={user} listings={listings} onNav={(id) => {
      const map = { personal: 'personal', listings: 'profile-listings', payments: 'payments', security: 'security', language: 'language', notifications: 'notifications', help: 'help', pending: 'pending-request' };
      setRoute({ screen: map[id] || 'profile', back: 'profile' });
    }} onLogout={logout}/>;
  } else if (route.screen === 'personal') {
    screen = <window.PersonalDataScreen user={user} onBack={() => setRoute({ screen: 'profile' })} onSave={(form) => setUser({ ...user, name: form.firstName + ' ' + form.lastName, email: form.email, initial: form.firstName[0].toUpperCase() })}/>;
  } else if (route.screen === 'profile-listings') {
    screen = <window.ProfileListingsScreen listings={listings} onBack={() => setRoute({ screen: 'profile' })} onOpen={openListing}/>;
  } else if (route.screen === 'payments') {
    screen = <window.PaymentsScreen onBack={() => setRoute({ screen: 'profile' })}/>;
  } else if (route.screen === 'security') {
    screen = <window.SecurityScreen onBack={() => setRoute({ screen: 'profile' })}/>;
  } else if (route.screen === 'language') {
    screen = <window.LanguageScreen onBack={() => setRoute({ screen: 'profile' })}/>;
  } else if (route.screen === 'notifications') {
    screen = <window.NotificationsScreen onBack={() => setRoute({ screen: 'profile' })}/>;
  } else if (route.screen === 'help') {
    screen = <window.HelpScreen onBack={() => setRoute({ screen: 'profile' })}/>;
  } else if (route.screen === 'simple') {
    screen = <window.SimpleScreen title="Nastavení" onBack={() => setRoute({ screen: 'profile' })}>
      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: theme.displayFont, fontSize: 22, color: vkPalette.brand }}>Tahle sekce se právě<br/><em style={{ color: theme.accent.accent }}>dlabe.</em></div>
      </div>
    </window.SimpleScreen>;
  } else if (route.screen === 'detail') {
    const l = listings.find(x => x.id === route.listingId);
    screen = l ? <window.DetailScreen
      listing={l}
      favorites={favorites}
      onToggleFav={toggleFav}
      onBack={() => setRoute({ screen: route.back || 'market' })}
      onChat={() => startChat(l)}
      onReserve={() => reserve(l)}
    /> : null;
  } else if (route.screen === 'add') {
    screen = <window.AddListingFlow categories={window.CATEGORIES} onClose={() => setRoute({ screen: 'market' })} onPublish={publishListing}/>;
  } else if (route.screen === 'add-success') {
    screen = <window.AddListingSuccess draft={route.draft} onClose={() => setRoute({ screen: 'market' })}/>;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <style>{`
        @keyframes vkPop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes vkToast { from { transform: translate(-50%, 8px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes vkWiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
        input::placeholder, textarea::placeholder { color: ${vkPalette.inkMuted}; opacity: 0.7; }
        ::-webkit-scrollbar { width: 0; }
        button:active { transform: scale(0.97); }
      `}</style>
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        padding: '24px 20px',
        background: `
          radial-gradient(1200px 600px at 20% 0%, rgba(27,84,49,0.06), transparent 60%),
          radial-gradient(800px 400px at 100% 100%, rgba(163,112,26,0.06), transparent 60%),
          ${vkPalette.bg}
        `,
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Global header strip */}
        <div style={{ position: 'fixed', top: 18, left: 24, display: 'flex', alignItems: 'center', gap: 10, zIndex: 60 }}>
          <div onClick={bumpLogo} style={{ cursor: 'pointer' }}>
            <VercajkLogo variant={logoVariant} size={32}/>
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: vkPalette.inkMuted, fontWeight: 700,
          }}>Prototyp · v1.0</div>
        </div>

        {/* Phone */}
        <PhoneFrame>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            {screen}
            {showChrome && route.screen === 'market' && <FAB onClick={() => setRoute({ screen: 'add' })}/>}
            {showChrome && <BottomNav current={route.screen} onNav={(s) => setRoute({ screen: s })}/>}
            <Toast message={toast} onClose={() => setToast(null)}/>
            {easterActive && <EasterOverlay/>}
          </div>
        </PhoneFrame>

        {/* Tweaks panel */}
        {tweaksOpen && (
          <TweaksPanel
            typeKey={typeKey} setTypeKey={(v) => { setTypeKey(v); persist({ typeface: v }); }}
            accentKey={accentKey} setAccentKey={(v) => { setAccentKey(v); persist({ accent: v }); }}
            logoVariant={logoVariant} setLogoVariant={(v) => { setLogoVariant(v); persist({ logoVariant: v }); }}
            onClose={() => setTweaksOpen(false)}
          />
        )}

        {/* Hint footer */}
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: vkPalette.inkMuted, fontWeight: 600,
          textAlign: 'center', maxWidth: 400,
        }}>
          tap · swipe · půjč si vercajk
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

// ---- Tweaks panel ----
const TweaksPanel = ({ typeKey, setTypeKey, accentKey, setAccentKey, logoVariant, setLogoVariant, onClose }) => {
  const palette = vkPalette;
  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20,
      width: 300, maxHeight: 'calc(100vh - 40px)',
      background: palette.card,
      border: `1px solid ${palette.line}`,
      borderRadius: 18,
      boxShadow: '0 24px 60px -12px rgba(31,22,16,0.3), 0 8px 24px -8px rgba(31,22,16,0.15)',
      overflow: 'hidden', zIndex: 100,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${palette.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.brand, fontWeight: 700, flex: 1,
        }}>▲ Tweaks</div>
        <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 4, color: palette.inkMuted }}>
          <Icon name="x" size={16}/>
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: 16, display: 'grid', gap: 18 }}>
        {/* Typeface */}
        <TweakGroup title="Typografie">
          <div style={{ display: 'grid', gap: 6 }}>
            {Object.entries(TYPEFACES).map(([k, v]) => (
              <button key={k} onClick={() => setTypeKey(k)} style={{
                padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
                background: typeKey === k ? THEMES[accentKey].accentSoft : palette.bg,
                border: `1.5px solid ${typeKey === k ? THEMES[accentKey].accent : palette.line}`,
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontFamily: v.display, fontSize: 22, fontWeight: 700, color: palette.brand, letterSpacing: '-0.02em', lineHeight: 1 }}>Aa</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: palette.brand, textTransform: 'capitalize' }}>{k}</div>
                  <div style={{ fontSize: 10.5, color: palette.inkMuted }}>{v.feel}</div>
                </div>
              </button>
            ))}
          </div>
        </TweakGroup>

        {/* Accent */}
        <TweakGroup title="Akcentní barva">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button key={k} onClick={() => setAccentKey(k)} style={{
                padding: 10, cursor: 'pointer', display: 'grid', placeItems: 'center', gap: 6,
                background: accentKey === k ? v.accentSoft : palette.bg,
                border: `1.5px solid ${accentKey === k ? v.accent : palette.line}`,
                borderRadius: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: v.accent, boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.18)` }}/>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: palette.brand, textTransform: 'capitalize' }}>
                  {k === 'green' ? 'Zelená' : k === 'mustard' ? 'Hořčice' : 'Cihla'}
                </div>
              </button>
            ))}
          </div>
        </TweakGroup>

        {/* Logo */}
        <TweakGroup title="Značka">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['mark', 'stamp'].map(v => (
              <button key={v} onClick={() => setLogoVariant(v)} style={{
                padding: 12, cursor: 'pointer', display: 'grid', placeItems: 'center', gap: 6,
                background: logoVariant === v ? THEMES[accentKey].accentSoft : palette.bg,
                border: `1.5px solid ${logoVariant === v ? THEMES[accentKey].accent : palette.line}`,
                borderRadius: 10,
              }}>
                <VercajkLogo variant={v} size={44}/>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: palette.brand }}>
                  {v === 'mark' ? 'Monogram' : 'Pečeť'}
                </div>
              </button>
            ))}
          </div>
        </TweakGroup>

        <div style={{ padding: '10px 12px', background: palette.bgDim, borderRadius: 10, fontSize: 11, lineHeight: 1.5, color: palette.inkSoft }}>
          <strong>Tip:</strong> klikni 3× na logo v rohu. Je tam vercajkový easter egg.
        </div>
      </div>
    </div>
  );
};

const TweakGroup = ({ title, children }) => (
  <div>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: vkPalette.inkMuted, fontWeight: 700, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

// ---- Easter egg overlay ----
const EasterOverlay = () => {
  const pieces = ['🔧', '🔨', '🪛', '⚙️', '🪚', '📏'];
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 200,
    }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 7.3) % 100;
        const delay = (i * 0.12).toFixed(2);
        const piece = pieces[i % pieces.length];
        const size = 20 + (i % 4) * 6;
        return (
          <div key={i} style={{
            position: 'absolute', top: -30, left: `${left}%`,
            fontSize: size, opacity: 0.9,
            animation: `vkRain 2.6s ${delay}s cubic-bezier(0.4, 0.05, 0.6, 1) forwards`,
          }}>{piece}</div>
        );
      })}
      <style>{`
        @keyframes vkRain {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(900px) rotate(540deg); opacity: 0; }
        }
      `}</style>
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#1f1610', color: '#f3ede1',
        padding: '16px 22px', borderRadius: 14,
        fontFamily: '"Fraunces", Georgia, serif', fontWeight: 800, fontSize: 20,
        letterSpacing: '-0.01em', textAlign: 'center',
        boxShadow: '0 20px 40px -8px rgba(0,0,0,0.4)',
        animation: 'vkPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        🔧 Verjcajk!
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', opacity: 0.7, marginTop: 4 }}>— tajný mód odemčen —</div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
