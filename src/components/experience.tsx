'use client';
/* Scene backgrounds use picture for art-directed portrait assets and one image request. */
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, House, LockKeyhole, Moon, Settings2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { artworks, type Artwork } from '@/data/artworks';
import { chapterStatus, type ChapterId } from '@/lib/progress';
import { useProgress } from '@/store/use-progress';
import { ArtworkExperience } from './artwork-experience';
import { Dialog } from './dialog';
import { AudioOwner } from './audio-owner';

type Phase = 'welcome' | 'entering' | 'intro' | 'house' | 'artwork' | 'story' | 'finale';
const introLines = ['Witaj w Domu Opowieści. Jestem Iskra — opiekuję się wspomnieniami tego miejsca.', 'Te obrazy skrywają historie, które czekają, aż ktoś na nowo je odkryje.', 'Zacznij od rozświetlonej ramy. Z każdą opowieścią ten dom będzie trochę bardziej Twój.'];
const particles = [8, 17, 29, 42, 58, 71, 83, 93];

function Scene({ outside, entering, completed }: { outside: boolean; entering: boolean; completed: number }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = outside ? 'exterior' : 'interior';
  return <div className={`scene ${outside ? 'outside' : 'inside'} ${entering ? 'entering' : ''} ${failedSource === source ? 'scene-fallback' : ''}`} aria-hidden>
    <picture key={source} className={`scene-picture level-${completed}`}>
      <source media="(max-width: 650px)" srcSet={`/assets/${source}-mobile.webp`} />
      <img src={`/assets/${source}.webp`} alt="" fetchPriority={outside ? 'high' : 'auto'} onError={() => setFailedSource(source)} onLoad={() => setFailedSource(null)} />
    </picture>
    <div className="scene-shade" />
    <div className="scene-grain" />
    {particles.map((x, i) => <i key={x} className="firefly" style={{ left: `${x}%`, top: `${35 + (i * 13) % 50}%`, animationDelay: `${i * -1.7}s` }} />)}
    {entering && <div className="door-light" />}
  </div>;
}

function Guardian({ small = false }: { small?: boolean }) {
  return <span className={`guardian ${small ? 'small' : ''}`} aria-hidden><span className="guardian-core"><i /><i /></span><span className="guardian-orbit" /></span>;
}

function Painting({ artwork, index, status, onSelect }: { artwork: Artwork; index: number; status: 'locked' | 'available' | 'completed'; onSelect: () => void }) {
  const statusLabel = { locked: 'Zamknięta', available: 'Dostępna', completed: 'Odkryta' }[status];
  return <button className={`painting ${status}`} onClick={onSelect} aria-label={`${artwork.title} — ${statusLabel}`} aria-disabled={status === 'locked'}>
    <span className="painting-frame"><span className="painting-inner"><span className="painting-number">0{index + 1}</span><span className="painting-symbol">{status === 'locked' ? <LockKeyhole size={20} strokeWidth={1.2} aria-hidden /> : status === 'completed' ? <Check size={25} strokeWidth={1.2} aria-hidden /> : <Sparkles size={24} strokeWidth={1.1} aria-hidden />}</span><span className="painting-placeholder">Tu pojawi się obraz</span><span className="painting-theme">{artwork.theme}</span></span></span>
    <span className="painting-meta"><span className="painting-title">{artwork.title}</span><span className="painting-state">{status === 'available' && <i />}{statusLabel}{status === 'available' && <ArrowUpRight size={13} aria-hidden />}</span></span>
  </button>;
}

function Story({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
  return <Dialog title={`Opowieść: ${artwork.title}`} onClose={onClose} className="story-dialog">
    <span className="eyebrow">ODKRYTA OPOWIEŚĆ</span><span className="story-chapter">{artwork.chapter}</span><h2>{artwork.title}</h2><p className="story-credit">{artwork.artist} · {artwork.year}</p>
    <div className="story-rule"><Sparkles size={16} strokeWidth={1.2} aria-hidden /></div>
    <div className="story-prose">{artwork.story.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
    <aside className="cultural-note"><span className="eyebrow">WARTO ZAUWAŻYĆ</span><p>{artwork.insight}</p></aside>
    <details className="story-details"><summary>Dowiedz się więcej<ChevronDown size={16} aria-hidden /></summary><p>Opowieść inspirowana dziełem; jej nastrojowe fragmenty są autorską interpretacją. Informacje o obrazie:</p><a href={artwork.source.url} target="_blank" rel="noopener noreferrer">{artwork.source.label}<ArrowUpRight size={15} aria-hidden /></a></details>
    <div className="story-reward"><Sparkles size={19} aria-hidden /><div><span>{artwork.reward}</span><p>{artwork.rewardDescription}</p></div></div>
    <button className="primary-button story-return" onClick={onClose}>Wróć do domu<ArrowRight size={18} aria-hidden /></button>
  </Dialog>;
}

export default function Experience() {
  const { progress, hydrated, storageAvailable, hydrate, complete, setPreference, reset } = useProgress();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [selected, setSelected] = useState<ChapterId>('stanczyk');
  const [introIndex, setIntroIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');
  const [newCompletion, setNewCompletion] = useState(false);
  const [resourcesReady, setResourcesReady] = useState(false);
  const systemReducedMotion = useReducedMotion();
  // Match the server on the first client render; CSS already honors the media query.
  const reduced = hydrated && (progress.reducedMotion || !!systemReducedMotion);
  const outside = phase === 'welcome' || phase === 'entering';
  const artwork = artworks.find((item) => item.id === selected)!;
  const inRoom = phase === 'house' || phase === 'intro' || phase === 'story' || phase === 'finale';

  useEffect(() => {
    hydrate();
    const image = new window.Image();
    const ready = () => setResourcesReady(true);
    image.onload = ready; image.onerror = ready;
    image.src = window.matchMedia('(max-width: 650px)').matches ? '/assets/exterior-mobile.webp' : '/assets/exterior.webp';
    const timeout = window.setTimeout(ready, 4000);
    return () => { window.clearTimeout(timeout); image.onload = null; image.onerror = null; };
  }, [hydrate]);
  useEffect(() => {
    if (phase !== 'entering') return;
    const timer = window.setTimeout(() => setPhase(progress.hasSeenIntroduction ? 'house' : 'intro'), reduced ? 150 : 2200);
    return () => window.clearTimeout(timer);
  }, [phase, progress.hasSeenIntroduction, reduced]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const focusRoomHeading = useCallback((node: HTMLHeadingElement | null) => {
    if (phase === 'house') node?.focus({ preventScroll: true });
  }, [phase]);

  const finishIntro = () => { setPreference('hasSeenIntroduction', true); setPhase('house'); };
  const select = (item: Artwork) => {
    const status = chapterStatus(progress, item.id);
    if (status === 'locked') { setNotice('Najpierw odkryj poprzednią opowieść.'); return; }
    setSelected(item.id); setNewCompletion(false); setNotice('');
    setPhase(status === 'completed' ? 'story' : 'artwork');
  };
  const finishArtwork = () => { complete(selected); setNewCompletion(true); setPhase('story'); };
  const closeStory = () => {
    if (newCompletion && progress.completed.length === 3) setPhase('finale');
    else { setPhase('house'); if (newCompletion) setNotice(artwork.rewardDescription); }
    setNewCompletion(false);
  };

  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}><main className="experience" data-reduced={reduced}>
    <AudioOwner enabled={progress.soundEnabled} reading={phase === 'story' || phase === 'artwork'} completed={progress.completed.length} />
    <Scene outside={outside} entering={phase === 'entering'} completed={progress.completed.length} />
    <header className="app-header"><button className="brand" aria-label="Dom Opowieści — ekran powitalny" disabled={phase === 'entering'} onClick={() => setPhase('welcome')}><span className="brand-mark"><Moon size={21} strokeWidth={1.2} aria-hidden /><i /></span><span>Dom Opowieści<span className="brand-subtitle">MAŁE HISTORIE. WIELKIE ŚWIATŁO.</span></span></button><div className="header-actions"><button className="icon-button sound-button" aria-label={progress.soundEnabled ? 'Wyłącz dźwięk' : 'Włącz dźwięk'} aria-pressed={progress.soundEnabled} disabled={!hydrated} onClick={() => setPreference('soundEnabled', !progress.soundEnabled)}>{progress.soundEnabled ? <Volume2 size={19} strokeWidth={1.4} aria-hidden /> : <VolumeX size={19} strokeWidth={1.4} aria-hidden />}</button><span className="header-divider" /><button className="icon-button" aria-label="Ustawienia" disabled={!hydrated || phase === 'entering'} onClick={() => { setConfirmReset(false); setSettingsOpen(true); }}><Settings2 size={19} strokeWidth={1.4} aria-hidden /></button></div></header>

    {(!hydrated || !resourcesReady) && <div className="loading-veil" role="status"><span className="loading-star"><Sparkles size={26} strokeWidth={1} aria-hidden /></span><p>Rozpalamy światło…</p></div>}

    <AnimatePresence mode="wait">
      {outside && <motion.section key="welcome" className={`welcome ${phase === 'entering' ? 'leaving' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="welcome-copy"><span className="eyebrow welcome-eyebrow"><span />ODROBINA CISZY. ODROBINA MAGII.</span><h1>Cisza ma<br />swoje <em>historie.</em></h1><p className="welcome-description">Każdy obraz skrywa opowieść.<br />Przywróć jej światło, a dom ożyje razem z nią.</p><button className="primary-button enter-button" disabled={!hydrated || !resourcesReady || phase === 'entering'} onClick={() => setPhase('entering')}>{progress.hasSeenIntroduction ? 'Wróć do domu' : 'Wejdź do domu'}<ArrowRight size={18} strokeWidth={1.5} aria-hidden /></button><span className="welcome-whisper">Nie musisz się spieszyć. Ten moment jest Twój.</span></div>
        <div className="welcome-footer"><span className="footer-note"><span className="tiny-line" />SZTUKA, KTÓRA ZBLIŻA</span><span className="journey-note"><span className="journey-dots"><i /><i /><i /></span>Jeden dom. Trzy opowieści.</span></div>
      </motion.section>}

      {inRoom && <motion.section key="house" className="house-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label="Wnętrze domu">
        <div className="room-heading"><span className="eyebrow">TWÓJ DOM OPOWIEŚCI</span><h1 ref={focusRoomHeading} tabIndex={-1}>{progress.completed.length === 3 ? <>Dobrze, że <em>jesteś.</em></> : <>Tutaj budzą się <em>opowieści.</em></>}</h1><p>{progress.completed.length === 3 ? 'Każda z tych historii jest już częścią Twojego domu.' : 'Wybierz rozświetloną ramę. Zobacz, co kryje się po drugiej stronie.'}</p></div>
        <div className="wall-gallery" inert={phase !== 'house'}>{artworks.map((item, index) => <Painting key={item.id} artwork={item} index={index} status={chapterStatus(progress, item.id)} onSelect={() => select(item)} />)}</div>
        <div className="reward-floor" aria-hidden>{progress.completed.map((id, i) => <motion.img key={id} src={`/assets/reward-${i + 1}.webp`} alt="" className={`reward-prop prop-${i + 1}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 1 }} />)}</div>
        {phase === 'house' && <div className="room-footer"><div className="guardian-hint"><Guardian small /><p>{progress.completed.length === 3 ? 'Opowieści zostają z nami. Możesz do nich wracać.' : progress.completed.length ? 'Widzisz? Z każdą historią jest tu trochę cieplej.' : 'Zacznij od pierwszej ramy. Reszta przyjdzie z czasem.'}<span>ISKRA · STRAŻNICZKA OPOWIEŚCI</span></p></div><div className="chapter-progress"><span>Odkryte historie: {progress.completed.length}/3</span><div>{artworks.map((item, i) => <i key={item.id} className={i < progress.completed.length ? 'filled' : ''} />)}</div></div></div>}
      </motion.section>}

      {phase === 'artwork' && <ArtworkExperience key="artwork" artworkId={selected} onComplete={finishArtwork} onExit={() => setPhase('house')} />}
    </AnimatePresence>

    {phase === 'intro' && <Dialog title="Poznaj Iskrę" onClose={finishIntro} className="intro-dialog"><Guardian /><span className="eyebrow">ISKRA · STRAŻNICZKA OPOWIEŚCI</span><h2>Każdy dom potrzebuje<br />odrobiny <em>światła.</em></h2><p className="intro-line" aria-live="polite">{introLines[introIndex]}</p><div className="intro-steps" aria-label={`Wprowadzenie ${introIndex + 1} z 3`}>{introLines.map((_, i) => <i key={i} className={i === introIndex ? 'active' : ''} />)}</div><div className="intro-actions"><button className="text-button" onClick={finishIntro}>Pomiń</button><button className="primary-button" onClick={() => introIndex === 2 ? finishIntro() : setIntroIndex(introIndex + 1)}>{introIndex === 2 ? 'Odkryjmy pierwszą historię' : 'Dalej'}<ArrowRight size={16} aria-hidden /></button></div></Dialog>}

    {phase === 'story' && <Story artwork={artwork} onClose={closeStory} />}

    {phase === 'finale' && <Dialog title="Dom znów żyje" onClose={() => setPhase('house')} className="finale-dialog"><span className="finale-stars"><Sparkles size={34} strokeWidth={1} aria-hidden /></span><span className="eyebrow">TRZY OPOWIEŚCI. JEDEN DOM.</span><h2>Dzięki Tobie ten dom znów żyje.</h2><p>Przywróciłeś światło trzem historiom.<br />Teraz są częścią tego miejsca — i częścią Ciebie.</p><div className="finale-chapters">{artworks.map(item => <span key={item.id}><Check size={14} aria-hidden />{item.title}</span>)}</div><button className="primary-button" onClick={() => setPhase('house')}>Zostań jeszcze chwilę<House size={17} aria-hidden /></button><span className="finale-signature">Dziękuję, że tu jesteś. — Iskra</span></Dialog>}

    {settingsOpen && <Dialog title="Ustawienia" onClose={() => setSettingsOpen(false)} className="settings-dialog"><span className="eyebrow">PO TWOJEMU</span><h2>Małe ustawienia.</h2><p className="settings-description">Zadbaj o swój spokojny moment.</p><div className="setting-row"><div><span>Dźwięki domu</span><p>Delikatny, ciepły ambient.</p></div><button className="switch" role="switch" aria-label="Dźwięki domu" aria-checked={progress.soundEnabled} onClick={() => setPreference('soundEnabled', !progress.soundEnabled)}><span /></button></div><div className="setting-row"><div><span>Ogranicz animacje</span><p>Mniej ruchu, ten sam nastrój.</p></div><button className="switch" role="switch" aria-label="Ogranicz animacje" aria-checked={progress.reducedMotion} onClick={() => setPreference('reducedMotion', !progress.reducedMotion)}><span /></button></div>{systemReducedMotion && <p className="settings-note">Respektujemy także ograniczenie ruchu ustawione na Twoim urządzeniu.</p>}<div className="settings-saved"><BookOpen size={16} aria-hidden /><p>{storageAvailable ? 'Twoje historie zapisują się tylko w tej przeglądarce. Bez konta, bez pośpiechu.' : 'Przeglądarka nie pozwala zapisać postępu. Możesz kontynuować w tej sesji.'}</p></div>{confirmReset ? <div className="reset-confirm"><p>Czy chcesz rozpocząć od nowa? Odkryte historie zostaną zresetowane.</p><button className="text-button" onClick={() => setConfirmReset(false)}><ArrowLeft size={14} aria-hidden />Zachowaj moje historie</button><button className="reset-button" onClick={() => { reset(); setSettingsOpen(false); setIntroIndex(0); setPhase('welcome'); setNotice(''); }}>Tak, zacznij od nowa</button></div> : <button className="text-button reset-link" onClick={() => setConfirmReset(true)}>Rozpocznij od nowa<ArrowUpRight size={14} aria-hidden /></button>}</Dialog>}
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Sparkles size={16} aria-hidden /><span>{notice}</span></>}</div>
    <span className="app-corner-label" aria-hidden>BEST HACKS · 2026</span>
  </main></MotionConfig>;
}
