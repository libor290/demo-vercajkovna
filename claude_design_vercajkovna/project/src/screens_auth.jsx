// Auth screens — login, register, onboarding

const { ThemeContext, VercajkLogo, Btn, Input, Icon, Avatar, Topbar } = window;

const AuthScreen = ({ onAuth, onClose }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [terms, setTerms] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);

  const rules = [
    { label: 'Aspoň 8 znaků', ok: password.length >= 8 },
    { label: 'Velké písmeno', ok: /[A-Z]/.test(password) },
    { label: 'Číslo nebo symbol', ok: /[\d\W]/.test(password) },
  ];

  const canSubmit = mode === 'login'
    ? email && password
    : name && email && rules.every(r => r.ok) && terms;

  const submit = () => {
    if (!canSubmit) return;
    onAuth({ name: name || 'Tomáš Novák', email, initial: (name || 'Tomáš')[0].toUpperCase() }, mode === 'register');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 40px', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ padding: '16px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <VercajkLogo size={46}/>
          <div style={{ display: 'grid', gap: 2, minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 800, color: palette.brand, letterSpacing: '-0.02em', lineHeight: 1 }}>vercajkovna</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, whiteSpace: 'nowrap' }}>půjčujem si vercajk</div>
          </div>
        </div>
        <h1 style={{
          margin: 0, width: '100%',
          fontFamily: displayFont, fontSize: 32, fontWeight: 800, lineHeight: 1.0,
          letterSpacing: '-0.03em', color: palette.brand,
        }}>
          {mode === 'login' ? <>Vítej zpátky<br/><span style={{ fontStyle: 'italic', color: accent.accent }}>v dílně.</span></> : <>Založ si <br/><span style={{ fontStyle: 'italic', color: accent.accent }}>verštat.</span></>}
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: palette.inkSoft, maxWidth: 320 }}>
          {mode === 'login'
            ? 'Co potřebuješ tentokrát — aku vrtačku, laser, nebo celé lešení?'
            : 'Pár údajů a za chvíli si půjčíš první vercajk od souseda.'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        padding: 4, borderRadius: 14,
        background: palette.bgDim, marginBottom: 18,
        border: `1px solid ${palette.line}`,
      }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            height: 40, border: 0, borderRadius: 10,
            background: mode === m ? palette.card : 'transparent',
            color: mode === m ? palette.brand : palette.inkSoft,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: mode === m ? '0 2px 6px rgba(31,22,16,0.08)' : 'none',
          }}>{m === 'login' ? 'Přihlášení' : 'Registrace'}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gap: 12 }}>
        {mode === 'register' && (
          <Input icon="user" placeholder="Jméno a příjmení" value={name} onChange={setName}/>
        )}
        <Input icon="mail" placeholder="tvuj@email.cz" value={email} onChange={setEmail}/>
        <Input icon="lock" type={showPw ? 'text' : 'password'} placeholder="Heslo" value={password} onChange={setPassword}
          right={<button onClick={() => setShowPw(!showPw)} style={{ background: 'transparent', border: 0, color: palette.inkMuted, cursor: 'pointer', padding: 4 }}><Icon name="eye" size={18}/></button>}
        />

        {mode === 'register' && (
          <div style={{ display: 'grid', gap: 6, padding: '4px 6px' }}>
            {rules.map(r => (
              <div key={r.label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, letterSpacing: '0.04em', fontWeight: 600,
                color: r.ok ? accent.accent : palette.inkMuted,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', display: 'grid', placeItems: 'center', background: r.ok ? accent.accentSoft : 'transparent', border: `1px solid ${r.ok ? accent.accentBorder : palette.line}` }}>
                  {r.ok && <Icon name="check" size={9} stroke={3}/>}
                </div>
                {r.label}
              </div>
            ))}
          </div>
        )}

        {mode === 'login' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: palette.inkSoft, cursor: 'pointer' }}>
              <div onClick={() => setRemember(!remember)} style={{
                width: 18, height: 18, borderRadius: 5,
                border: `1.5px solid ${remember ? accent.accent : palette.line}`,
                background: remember ? accent.accent : palette.card,
                display: 'grid', placeItems: 'center',
              }}>
                {remember && <Icon name="check" size={11} color="#fff" stroke={3}/>}
              </div>
              Pamatovat si mě
            </label>
            <button style={{ background: 'transparent', border: 0, color: palette.brand, fontSize: 13, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', padding: 0 }}>Zapomenuté?</button>
          </div>
        ) : (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, lineHeight: 1.5, color: palette.inkSoft, cursor: 'pointer', padding: '4px 2px' }}>
            <div onClick={() => setTerms(!terms)} style={{
              width: 18, height: 18, borderRadius: 5, marginTop: 1, flexShrink: 0,
              border: `1.5px solid ${terms ? accent.accent : palette.line}`,
              background: terms ? accent.accent : palette.card,
              display: 'grid', placeItems: 'center',
            }}>
              {terms && <Icon name="check" size={11} color="#fff" stroke={3}/>}
            </div>
            Souhlasím s pravidly komunity a zpracováním osobních údajů.
          </label>
        )}

        <Btn variant="primary" size="lg" onClick={submit} disabled={!canSubmit} style={{ marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {mode === 'login' ? 'Jdeme na to' : 'Pojď do toho'}
        </Btn>
      </div>

      {/* Demo profiles */}
      {mode === 'login' && (
        <div style={{ marginTop: 22 }}>
          <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, marginBottom: 10 }}>
            — nebo skoč rovnou jako demo —
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {window.DEMO_ACCOUNTS.map(acc => (
              <button key={acc.email} onClick={() => onAuth({ name: acc.name, email: acc.email, initial: acc.initial }, false)}
                style={{
                  background: palette.card, border: `1px solid ${palette.line}`,
                  borderRadius: 12, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <Avatar initial={acc.initial} size={32}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: palette.brand, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: palette.inkMuted, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider + social */}
      <div style={{ margin: '22px 0 14px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <div style={{ height: 1, background: palette.line }}/>
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700 }}>nebo přes</span>
        <div style={{ height: 1, background: palette.line }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Google', mark: 'G', color: '#ea4335' },
          { label: 'Apple', mark: '', color: palette.ink },
          { label: 'Facebook', mark: 'f', color: '#1877f2' },
        ].map(s => (
          <button key={s.label} style={{
            height: 48, borderRadius: 12,
            background: palette.card, border: `1px solid ${palette.line}`,
            cursor: 'pointer', fontWeight: 900, fontSize: 18, color: s.color,
            fontFamily: s.label === 'Apple' ? '-apple-system, sans-serif' : 'inherit',
          }}>
            {s.label === 'Apple' ? '' : s.mark}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: palette.inkMuted, lineHeight: 1.5 }}>
        {mode === 'login' ? 'Ještě nemáš účet?' : 'Už jsi u nás byl?'}{' '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 0, color: palette.brand, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
          {mode === 'login' ? 'Zaregistruj se.' : 'Přihlaš se.'}
        </button>
      </div>
    </div>
  );
};

// Onboarding — 4 steps: values → phone SMS → location → tour
const OnboardingFlow = ({ onDone, user }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [step, setStep] = React.useState(0);
  const [phone, setPhone] = React.useState('+420 ');
  const [smsCode, setSmsCode] = React.useState(['', '', '', '']);
  const [smsSent, setSmsSent] = React.useState(false);
  const [address, setAddress] = React.useState('');
  const [locationGranted, setLocationGranted] = React.useState(null);

  const steps = [
    { kicker: 'Krok 1 ze 4', title: <>Ahoj {user.name.split(' ')[0]}.<br/><em style={{ color: accent.accent, fontStyle: 'italic' }}>Ať se tu cítíš doma.</em></>, sub: 'Vercajkovna je malá česká komunita. Dřív než vletíš do tržiště, vem si minutu na pár základů.' },
    { kicker: 'Krok 2 ze 4', title: <>Ověříme <em style={{ color: accent.accent, fontStyle: 'italic' }}>telefon.</em></>, sub: 'Díky ověření jsi pro ostatní důvěryhodný soused, ne anonymní účet. Jen SMS, nic víc.' },
    { kicker: 'Krok 3 ze 4', title: <>Kde máš <em style={{ color: accent.accent, fontStyle: 'italic' }}>verštat?</em></>, sub: 'Aby ti tržiště ukazovalo nejbližší vercajk — a ty naopak našel někoho od tebe z ulice.' },
    { kicker: 'Krok 4 ze 4', title: <>Krátká <em style={{ color: accent.accent, fontStyle: 'italic' }}>prohlídka.</em></>, sub: 'Tři věci, co se ti budou hodit. Klik — klik — hotovo.' },
  ];

  const next = () => step < 3 ? setStep(step + 1) : onDone();
  const back = () => step > 0 ? setStep(step - 1) : onDone();

  const current = steps[step];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Progress */}
      <div style={{ padding: '6px 24px 16px', display: 'flex', gap: 6 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i <= step ? accent.accent : palette.bgDim,
            transition: 'background 200ms ease',
          }}/>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 10 }}>{current.kicker}</div>
        <h1 style={{
          margin: 0, fontFamily: displayFont, fontSize: 32, fontWeight: 800,
          lineHeight: 1.02, letterSpacing: '-0.03em', color: palette.brand,
        }}>{current.title}</h1>
        <p style={{ margin: '14px 0 20px', fontSize: 14, lineHeight: 1.55, color: palette.inkSoft }}>{current.sub}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {window.VALUES.map((v, i) => (
              <div key={v.title} style={{
                background: palette.card, border: `1px solid ${palette.line}`,
                borderRadius: 16, padding: '16px 18px',
                display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: accent.accentSoft, color: accent.accent,
                  display: 'grid', placeItems: 'center',
                  fontFamily: displayFont, fontWeight: 800, fontSize: 15,
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 16, color: palette.brand, marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: palette.inkSoft }}>{v.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <Input icon="phone" placeholder="+420 777 123 456" value={phone} onChange={setPhone}/>
            {!smsSent ? (
              <Btn variant="accent" onClick={() => setSmsSent(true)} disabled={phone.trim().length < 9}>Pošli mi SMS kód</Btn>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
                  {smsCode.map((d, i) => (
                    <input key={i} inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                        const next = [...smsCode]; next[i] = v; setSmsCode(next);
                        if (v && i < 3) {
                          const inputs = e.target.parentElement.querySelectorAll('input');
                          inputs[i + 1]?.focus();
                        }
                      }}
                      style={{
                        width: 56, height: 64, textAlign: 'center',
                        fontFamily: '"Fraunces", Georgia, serif', fontSize: 26, fontWeight: 700,
                        color: palette.brand,
                        border: `1.5px solid ${d ? accent.accent : palette.line}`,
                        borderRadius: 12, background: palette.card,
                        outline: 'none',
                      }}/>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: palette.inkMuted }}>
                  Kód dorazil? <button style={{ background: 'transparent', border: 0, color: palette.brand, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Pošli znovu</button>
                </div>
              </>
            )}
            <div style={{ background: palette.bgDim, padding: '12px 14px', borderRadius: 12, fontSize: 12, color: palette.inkSoft, lineHeight: 1.5 }}>
              Telefon vidí jen ověření — ostatní uživatelé tvé číslo nevidí, pokud si nedohodnete předání.
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{
              padding: '20px 18px', borderRadius: 16,
              background: palette.card, border: `1px solid ${palette.line}`,
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: accent.accentSoft, color: accent.accent, display: 'grid', placeItems: 'center' }}>
                <Icon name="pin" size={22}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: palette.brand, marginBottom: 3 }}>Zjistit polohu automaticky</div>
                <div style={{ fontSize: 12, color: palette.inkMuted, lineHeight: 1.4 }}>Rychlejší, přesnější, nic víc.</div>
              </div>
              <Btn variant={locationGranted ? 'accent' : 'secondary'} size="sm" full={false} onClick={() => setLocationGranted(true)}>
                {locationGranted ? <><Icon name="check" size={14} stroke={3}/> Povoleno</> : 'Povolit'}
              </Btn>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700 }}>— nebo zadej adresu —</div>
            <Input icon="pin" placeholder="Ulice, město" value={address} onChange={setAddress}/>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { icon: 'search', title: 'Hledáš — klikáš — máš', body: 'Tržiště má chipy kategorií a filtry. Co nenajdeš, doplní soused.' },
              { icon: 'chat', title: 'Domluva v aplikaci', body: 'Čat, nabídnutý termín, souhlas. Všechno na jednom místě.' },
              { icon: 'plus', title: 'I ty máš co nabídnout', body: 'Tři kroky a tvůj vercajk je v nabídce. Pracuje za tebe.' },
            ].map(t => (
              <div key={t.title} style={{
                background: palette.card, border: `1px solid ${palette.line}`,
                borderRadius: 14, padding: '14px 16px',
                display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: accent.accentSoft, color: accent.accent, display: 'grid', placeItems: 'center' }}>
                  <Icon name={t.icon} size={20} stroke={1.8}/>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: palette.brand }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: palette.inkSoft, lineHeight: 1.45, marginTop: 2 }}>{t.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 24px 24px', display: 'flex', gap: 10, flexShrink: 0, background: palette.bg, borderTop: `1px solid ${palette.lineSoft}` }}>
        <Btn variant="ghost" full={false} onClick={back} style={{ flex: 0 }}>
          {step === 0 ? 'Přeskočit' : '← Zpět'}
        </Btn>
        <Btn variant="primary" size="lg" onClick={next} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {step === 3 ? 'Do tržiště' : 'Pokračovat'}
        </Btn>
      </div>
    </div>
  );
};

window.AuthScreen = AuthScreen;
window.OnboardingFlow = OnboardingFlow;
