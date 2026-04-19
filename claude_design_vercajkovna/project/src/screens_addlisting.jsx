// Add-listing 3-step flow — matches original: photos+info → cena+dostupnost → tech+pravidla

const { ThemeContext, Btn, Input, Icon, Topbar } = window;

const CONDITIONS = [
  { id: 'new', label: 'Nové', note: 'Bez známek použití' },
  { id: 'like_new', label: 'Jako nové', note: 'Použité minimálně' },
  { id: 'used_good', label: 'Velmi dobrý', note: 'Běžné použití' },
  { id: 'used_ok', label: 'Dobrý', note: 'Viditelné opotřebení' },
  { id: 'worn', label: 'Opotřebené', note: 'Funguje, ale je znát' },
];

const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  return { label: `${MONTHS[month]} ${year}`, cells: Array.from({ length: 42 }, (_, i) => { const d = i - offset + 1; return d > 0 && d <= days ? d : null; }) };
}

function fmtDay(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const AddListingFlow = ({ onClose, onPublish, categories }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  const [step, setStep] = React.useState(1);
  const [attempted, setAttempted] = React.useState(false);
  const [draft, setDraft] = React.useState({
    photos: [null, null, null, null], // each slot: null | 'filled'
    title: '', category: '',
    price: '', depositEnabled: false, deposit: '',
    availDays: [],
    locationMode: 'profile',
    customStreet: '', customCity: '',
    brand: '', model: '', power: '', accessories: '',
    condition: 'used_good',
    description: '',
    pickupMode: 'personal', pickupOther: '',
    rules: { noMods: false, purposeOnly: false, noThirdParty: false, depositForfeit: false },
  });
  const [condOpen, setCondOpen] = React.useState(false);
  const [calY, setCalY] = React.useState(new Date().getFullYear());
  const [calM, setCalM] = React.useState(new Date().getMonth());
  const [rangeStart, setRangeStart] = React.useState(null);

  const upd = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  // Step validation
  const hasPhoto = draft.photos.some(Boolean);
  const step1ok = hasPhoto && draft.title.trim() && draft.category;
  const step2ok = Number(draft.price) > 0 && draft.availDays.length > 0 && (!draft.depositEnabled || Number(draft.deposit) > 0);
  const step3ok = true;

  const canGo = step === 1 ? step1ok : step === 2 ? step2ok : step3ok;

  const next = () => {
    setAttempted(true);
    if (!canGo) return;
    setAttempted(false);
    if (step === 3) { onPublish(draft); return; }
    setStep(s => s + 1);
  };
  const back = () => { setAttempted(false); step > 1 ? setStep(s => s - 1) : onClose(); };

  // Calendar
  const cal = buildCalendar(calY, calM);
  const toggleDay = (d) => {
    if (!d) return;
    const key = fmtDay(calY, calM, d);
    if (!rangeStart) {
      const idx = draft.availDays.indexOf(key);
      if (idx >= 0) { upd('availDays', draft.availDays.filter(x => x !== key)); return; }
      setRangeStart(key);
      upd('availDays', [...draft.availDays, key]);
    } else {
      const end = fmtDay(calY, calM, d);
      const [sy, sm, sd] = rangeStart.split('-').map(Number);
      const startD = new Date(sy, sm - 1, sd);
      const endD = new Date(calY, calM, d);
      const from = startD <= endD ? startD : endD;
      const to = startD <= endD ? endD : startD;
      const set = new Set(draft.availDays);
      for (let cur = new Date(from); cur <= to; cur.setDate(cur.getDate() + 1)) {
        set.add(fmtDay(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      }
      upd('availDays', Array.from(set).sort());
      setRangeStart(null);
    }
  };
  const isDaySelected = (d) => d && draft.availDays.includes(fmtDay(calY, calM, d));

  // Photo click simulation
  const clickPhoto = (i) => {
    const next = [...draft.photos];
    next[i] = next[i] ? null : 'filled';
    upd('photos', next);
  };

  const condLabel = CONDITIONS.find(c => c.id === draft.condition)?.label || 'Vyber stav';

  const errorStyle = { border: `1.5px solid #c33` };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar
        left={<button onClick={back} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: palette.brand, padding: 4 }}><Icon name="arrow-left" size={20}/></button>}
        title="Nová nabídka"
        kicker={`Krok ${step} ze 3`}
        right={<button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: palette.inkMuted, padding: 4 }}><Icon name="x" size={20}/></button>}
      />
      <div style={{ padding: '0 22px 10px', display: 'flex', gap: 6 }}>
        {[1,2,3].map(n => <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= step ? accent.accent : palette.bgDim, transition: 'background 200ms' }}/>)}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 24px' }}>

        {/* ── STEP 1: Fotky + Název + Kategorie ── */}
        {step === 1 && <>
          <h2 style={{ margin: '0 0 16px', fontFamily: displayFont, fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1.05 }}>
            Co budeš<br/><em style={{ color: accent.accent }}>půjčovat?</em>
          </h2>

          <ALField label="Fotografie" error={attempted && !hasPhoto && 'Přidej alespoň 1 fotku'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {draft.photos.map((p, i) => (
                <button key={i} onClick={() => clickPhoto(i)} style={{
                  aspectRatio: i === 0 ? '2 / 1.2' : '1',
                  gridColumn: i === 0 ? '1 / -1' : '',
                  borderRadius: 12, border: `1.5px ${p ? 'solid' : 'dashed'} ${attempted && !hasPhoto ? '#c33' : p ? palette.line : 'rgba(31,22,16,0.25)'}`,
                  background: p ? palette.bgDim : palette.card,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  display: 'grid', placeItems: 'center',
                }}>
                  {p ? <>
                    <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, ${palette.bg} 0 10px, ${palette.bgDim} 10px 20px)` }}/>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      {i === 0 && <div style={{ padding: '3px 8px', background: accent.accent, color: '#fff', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Hlavní</div>}
                      <Icon name="check" size={20} color={accent.accent} stroke={2.5}/>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.12em', color: palette.inkSoft, textTransform: 'uppercase' }}>
                        {['HLAVNÍ FOTO','DETAIL','PŘÍSLUŠENSTVÍ','STAV'][i]}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); clickPhoto(i); }} style={{
                      position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
                      background: palette.card, border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
                    }}><Icon name="x" size={12} color={palette.inkMuted}/></button>
                  </> : <div style={{ textAlign: 'center', color: palette.inkMuted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Icon name={i === 0 ? 'camera' : 'upload'} size={i === 0 ? 26 : 18} stroke={1.5}/>
                    <div style={{ fontSize: i === 0 ? 11 : 10, fontWeight: 600 }}>{i === 0 ? '+ Přidat fotku' : ['Detail','Příslušenství','Stav'][i-1]}</div>
                  </div>}
                </button>
              ))}
            </div>
          </ALField>

          <ALField label="Název vercajku" error={attempted && !draft.title.trim() && 'Vyplň název'}>
            <Input placeholder="Např. Aku vrtačka Makita 18V" value={draft.title} onChange={v => upd('title', v)}
              style={attempted && !draft.title.trim() ? errorStyle : {}}/>
          </ALField>

          <ALField label="Kategorie" error={attempted && !draft.category && 'Vyber kategorii'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {categories.filter(c => c.id !== 'all').map(c => {
                const on = draft.category === c.id;
                return <button key={c.id} onClick={() => upd('category', c.id)} style={{
                  padding: '11px 12px', borderRadius: 11, cursor: 'pointer',
                  background: on ? accent.accentSoft : palette.card,
                  border: `1.5px solid ${on ? accent.accent : (attempted && !draft.category ? '#c33' : palette.line)}`,
                  color: on ? accent.accent : palette.brand,
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{ opacity: 0.75 }}>{c.glyph}</span>{c.label}
                </button>;
              })}
            </div>
          </ALField>
        </>}

        {/* ── STEP 2: Cena + Dostupnost ── */}
        {step === 2 && <>
          <h2 style={{ margin: '0 0 16px', fontFamily: displayFont, fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1.05 }}>
            Za kolik<br/><em style={{ color: accent.accent }}>a kdy?</em>
          </h2>

          <ALField label="Cena za den" error={attempted && !(Number(draft.price) > 0) && 'Zadej cenu'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', minHeight: 52, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${attempted && !(Number(draft.price) > 0) ? '#c33' : palette.line}`, background: palette.card }}>
              <input type="number" min="0" value={draft.price} onChange={e => upd('price', e.target.value)} placeholder="250"
                style={{ border: 0, background: 'transparent', outline: 'none', fontSize: 15, fontFamily: 'inherit', color: palette.ink, fontWeight: 600 }}/>
              <span style={{ fontSize: 13, color: palette.inkMuted, fontWeight: 600 }}>Kč / den</span>
            </div>
          </ALField>

          <ALField label="">
            <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: draft.depositEnabled ? 12 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: palette.brand }}>Vratná kauce</div>
                  <div style={{ fontSize: 11.5, color: palette.inkMuted, marginTop: 2 }}>Vrátí se po hladkém předání.</div>
                </div>
                <ALToggle on={draft.depositEnabled} onChange={v => upd('depositEnabled', v)}/>
              </div>
              {draft.depositEnabled && <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', minHeight: 46, padding: '0 12px', borderRadius: 10, border: `1px solid ${palette.line}`, background: palette.bgDim }}>
                <input type="number" min="0" value={draft.deposit} onChange={e => upd('deposit', e.target.value)} placeholder="2000"
                  style={{ border: 0, background: 'transparent', outline: 'none', fontSize: 15, fontFamily: 'inherit', color: palette.ink, fontWeight: 600 }}/>
                <span style={{ fontSize: 13, color: palette.inkMuted, fontWeight: 600 }}>Kč</span>
              </div>}
            </div>
          </ALField>

          <ALField label="Dostupnost" error={attempted && draft.availDays.length === 0 && 'Vyber aspoň jeden den'}>
            <div style={{ background: palette.card, border: `1.5px solid ${attempted && draft.availDays.length === 0 ? '#c33' : palette.line}`, borderRadius: 14, padding: 14 }}>
              {/* Calendar nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <button onClick={() => { const d = new Date(calY, calM - 1, 1); setCalY(d.getFullYear()); setCalM(d.getMonth()); setRangeStart(null); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6, color: palette.brand }}>
                  <Icon name="arrow-left" size={16}/>
                </button>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.brand }}>{cal.label}</span>
                <button onClick={() => { const d = new Date(calY, calM + 1, 1); setCalY(d.getFullYear()); setCalM(d.getMonth()); setRangeStart(null); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6, color: palette.brand }}>
                  <Icon name="arrow-right" size={16}/>
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {['Po','Út','St','Čt','Pá','So','Ne'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 700, color: palette.inkMuted, letterSpacing: '0.04em' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cal.cells.map((d, i) => {
                  const sel = isDaySelected(d);
                  return <button key={i} onClick={() => toggleDay(d)} disabled={!d} style={{
                    height: 30, borderRadius: 7, border: 0, cursor: d ? 'pointer' : 'default',
                    background: sel ? accent.accent : 'transparent',
                    color: sel ? '#fff' : d ? palette.ink : 'transparent',
                    fontSize: 12, fontWeight: sel ? 700 : 500,
                  }}>{d || ''}</button>;
                })}
              </div>
              {draft.availDays.length > 0 && <div style={{ marginTop: 8, fontSize: 11, color: accent.accent, fontWeight: 600 }}>
                {draft.availDays.length} {draft.availDays.length === 1 ? 'den' : 'dní'} označeno
                {rangeStart && ' · klikni na konec rozmezí'}
              </div>}
            </div>
          </ALField>

          <ALField label="Lokalita">
            <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, padding: '12px 14px' }}>
              {['profile','custom'].map(m => <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}>
                <input type="radio" checked={draft.locationMode === m} onChange={() => upd('locationMode', m)} style={{ accentColor: accent.accent }}/>
                <span style={{ fontSize: 14, color: palette.brand, fontWeight: m === draft.locationMode ? 600 : 400 }}>
                  {m === 'profile' ? 'Stejná jako v profilu' : 'Jiná adresa'}
                </span>
              </label>)}
              {draft.locationMode === 'custom' && <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                <input value={draft.customStreet} onChange={e => upd('customStreet', e.target.value)} placeholder="Ulice a č.p." style={{ padding: '10px 12px', border: `1px solid ${palette.line}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, color: palette.ink, background: palette.bg, outline: 'none' }}/>
                <input value={draft.customCity} onChange={e => upd('customCity', e.target.value)} placeholder="Město" style={{ padding: '10px 12px', border: `1px solid ${palette.line}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, color: palette.ink, background: palette.bg, outline: 'none' }}/>
              </div>}
            </div>
          </ALField>
        </>}

        {/* ── STEP 3: Tech parametry + Způsob předání + Pravidla ── */}
        {step === 3 && <>
          <h2 style={{ margin: '0 0 16px', fontFamily: displayFont, fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1.05 }}>
            Pár<br/><em style={{ color: accent.accent }}>detailů.</em>
          </h2>

          <ALField label="Technické parametry">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Značka','brand','Bosch, DeWalt…'],['Model','model','Přesné označení'],['Výkon','power','1500W, 18V…'],['Příslušenství','accessories','Kufr, baterie…']].map(([l, k, ph]) => (
                <div key={k} style={{ gridColumn: k === 'accessories' ? '1 / -1' : '' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: palette.inkMuted, marginBottom: 5 }}>{l}</div>
                  <input value={draft[k]} onChange={e => upd(k, e.target.value)} placeholder={ph}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${palette.line}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 13, color: palette.ink, background: palette.card, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: palette.inkMuted, marginBottom: 5 }}>Stav vercajku</div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setCondOpen(o => !o)} style={{
                  width: '100%', padding: '11px 12px', border: `1px solid ${palette.line}`, borderRadius: 10,
                  background: palette.card, fontFamily: 'inherit', fontSize: 14, color: palette.brand, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                }}>
                  {condLabel}
                  <Icon name="chevron-down" size={16} color={palette.inkMuted}/>
                </button>
                {condOpen && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4 }}>
                  {CONDITIONS.map(c => <button key={c.id} onClick={() => { upd('condition', c.id); setCondOpen(false); }} style={{
                    width: '100%', padding: '11px 14px', background: draft.condition === c.id ? accent.accentSoft : 'transparent',
                    border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    color: draft.condition === c.id ? accent.accent : palette.brand,
                  }}>
                    <span style={{ fontWeight: 700 }}>{c.label}</span>
                    <span style={{ fontSize: 11.5, color: palette.inkMuted, marginLeft: 6 }}>— {c.note}</span>
                  </button>)}
                </div>}
              </div>
            </div>
          </ALField>

          <ALField label="Popis (volitelný)">
            <textarea value={draft.description} onChange={e => upd('description', e.target.value)}
              placeholder="Co ještě nájemce potřebuje vědět? Tipy, speciální instrukce…"
              style={{ width: '100%', minHeight: 90, padding: '10px 12px', border: `1px solid ${palette.line}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, color: palette.ink, background: palette.card, resize: 'vertical', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}/>
          </ALField>

          <ALField label="Způsob vyzvednutí">
            <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, padding: '12px 14px', display: 'grid', gap: 8 }}>
              {[['personal','Osobní vyzvednutí'],['other','Jiné (upřesnit)']].map(([v, l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="radio" checked={draft.pickupMode === v} onChange={() => upd('pickupMode', v)} style={{ accentColor: accent.accent }}/>
                  <span style={{ fontSize: 14, color: palette.brand, fontWeight: draft.pickupMode === v ? 600 : 400 }}>{l}</span>
                </label>
              ))}
              {draft.pickupMode === 'other' && <textarea value={draft.pickupOther} onChange={e => upd('pickupOther', e.target.value)} placeholder="Např. dovoz, zásilkovna, garáž s kódem…"
                style={{ padding: '8px 10px', border: `1px solid ${palette.line}`, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: palette.ink, background: palette.bg, resize: 'vertical', outline: 'none', lineHeight: 1.5 }}/>}
            </div>
          </ALField>

          <ALField label="Pravidla a omezení">
            <div style={{ background: palette.card, border: `1px solid ${palette.line}`, borderRadius: 12, padding: '12px 14px', display: 'grid', gap: 10 }}>
              {[
                ['noMods', 'Zákaz úprav a modifikací'],
                ['purposeOnly', 'Jen k určenému účelu'],
                ['noThirdParty', 'Zákaz půjčení třetím osobám'],
                ['depositForfeit', 'Kauce propadá při poškození'],
              ].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div onClick={() => upd('rules', { ...draft.rules, [k]: !draft.rules[k] })} style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `1.5px solid ${draft.rules[k] ? accent.accent : palette.line}`,
                    background: draft.rules[k] ? accent.accent : palette.card,
                    display: 'grid', placeItems: 'center',
                  }}>
                    {draft.rules[k] && <Icon name="check" size={12} color="#fff" stroke={3}/>}
                  </div>
                  <span style={{ fontSize: 13.5, color: palette.inkSoft, lineHeight: 1.4 }}>{l}</span>
                </label>
              ))}
            </div>
          </ALField>
        </>}
      </div>

      {/* CTA */}
      <div style={{ padding: '10px 22px 20px', background: palette.bg, borderTop: `1px solid ${palette.lineSoft}`, flexShrink: 0 }}>
        <Btn variant="primary" size="lg" onClick={next} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {step === 3 ? 'Zveřejnit vercajk' : `Pokračovat →`}
        </Btn>
        {attempted && !canGo && <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#c33', fontWeight: 600 }}>
          Vyplň prosím povinná pole výše
        </div>}
      </div>
    </div>
  );
};

const ALField = ({ label, children, error }) => {
  const { palette } = React.useContext(ThemeContext);
  return (
    <div style={{ display: 'grid', gap: 7, marginBottom: 18 }}>
      {label && <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: palette.brand }}>{label}</div>}
      {children}
      {error && <div style={{ fontSize: 11.5, color: '#c33', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};

const ALToggle = ({ on, onChange }) => {
  const { accent, palette } = React.useContext(ThemeContext);
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 46, height: 26, borderRadius: 999, border: 0, cursor: 'pointer', padding: 2, flexShrink: 0,
      background: on ? accent.accent : palette.bgDim, transition: 'background 180ms',
    }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', transform: `translateX(${on ? 20 : 0}px)`, transition: 'transform 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
    </button>
  );
};

const AddListingSuccess = ({ onClose, draft }) => {
  const { palette, accent, displayFont } = React.useContext(ThemeContext);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: accent.accentSoft, color: accent.accent, display: 'grid', placeItems: 'center', marginBottom: 24, border: `2px solid ${accent.accentBorder}`, animation: 'vkPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <Icon name="check" size={44} stroke={2.8}/>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.inkMuted, fontWeight: 700, marginBottom: 10 }}>— vercajk je v nabídce —</div>
        <h1 style={{ margin: 0, fontFamily: displayFont, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: palette.brand, lineHeight: 1.05 }}>
          A máš <em style={{ color: accent.accent }}>po práci.</em>
        </h1>
        <p style={{ margin: '16px 0 0', maxWidth: 300, fontSize: 14, lineHeight: 1.6, color: palette.inkSoft }}>
          „{draft?.title || 'Tvůj vercajk'}" je teď vidět pro sousedy v okolí. Jakmile někdo pošle žádost, uvidíš ji v sekci Zprávy.
        </p>
      </div>
      <div style={{ padding: '12px 22px 24px', display: 'grid', gap: 10, flexShrink: 0 }}>
        <Btn variant="primary" size="lg" onClick={onClose} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zpět do tržiště</Btn>
        <Btn variant="ghost" full onClick={onClose}>Přidat další nabídku</Btn>
      </div>
    </div>
  );
};

Object.assign(window, { AddListingFlow, AddListingSuccess });
