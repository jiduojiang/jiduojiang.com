// homepage-app.jsx — Jiduo Jiang's project hub

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#ff6b6b", "#ffc83d", "#4fb3f5", "#61c97a", "#b67bff", "#ff97c5"],
  "cardStyle": "stickers",
  "kidName": "Jiduo",
  "kidAge": 6,
  "tagline": "I'm 6 years old and I make little games and tools with Claude. Come play with them!",
  "showNewProjectCard": true
}/*EDITMODE-END*/;

// ── sample content (would come from meta.json scan at build time) ──
const GAMES = [
  { slug: "snake",       emoji: "🐍", title: "Snake",         description: "The classic — eat apples and grow longer!",              created: "2026-05-17", isNew: true,  color: 0 },
  { slug: "jump-block",  emoji: "🟦", title: "Jump Block",    description: "Press space to hop over the obstacles.",                 created: "2026-05-12", isNew: false, color: 2 },
  { slug: "color-match", emoji: "🎨", title: "Color Match",   description: "Connect balls that are the same color.",                 created: "2026-05-08", isNew: false, color: 4 },
  { slug: "math-quest",  emoji: "🔢", title: "Math Quest",    description: "Beat the monsters by solving + and − problems.",         created: "2026-05-03", isNew: false, color: 3 },
  { slug: "spot-diff",   emoji: "🔍", title: "Spot the Diff", description: "Find 5 differences between two pictures.",               created: "2026-04-28", isNew: false, color: 1 },
  { slug: "memory",      emoji: "🃏", title: "Memory Cards",  description: "Remember where the cards are and match every pair.",    created: "2026-04-20", isNew: false, color: 5 },
  { slug: "dino-run",    emoji: "🦖", title: "Dino Run",      description: "Help the little dino run and dodge things.",             created: "2026-04-15", isNew: false, color: 0 },
];

const TOOLS = [
  { slug: "color-picker", emoji: "🌈", title: "Rainbow Picker", description: "Tap around to pick a color you like.",                 created: "2026-05-15", isNew: true, color: 4 },
  { slug: "timer",        emoji: "⏱️", title: "Tooth Timer",    description: "Mom says brush for 2 minutes — this counts down!",    created: "2026-05-10", isNew: false, color: 2 },
  { slug: "dice",         emoji: "🎲", title: "Lucky Dice",     description: "Can't decide? Roll and let the dice pick.",            created: "2026-05-05", isNew: false, color: 1 },
  { slug: "weather",      emoji: "🌤️", title: "What to Wear",   description: "Check the weather so I know if I need a jacket.",     created: "2026-04-30", isNew: false, color: 3 },
];

// ── helpers ──
function fmtDate(iso){
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function getCardBg(idx, palette){
  return palette[idx % palette.length];
}

// ── card ──
function Card({ item, palette, onOpen, type }){
  const bg = getCardBg(item.color, palette);
  return (
    <button
      className="card"
      style={{ "--card-bg": bg }}
      onClick={() => onOpen({ ...item, type, bg })}
      data-comment-anchor={`card-${type}-${item.slug}`}
    >
      {item.isNew && <span className="badge">NEW!</span>}
      <div className="card-emoji">{item.emoji}</div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="date">
        <span>{fmtDate(item.created)}</span>
        <span className="go" aria-hidden>→</span>
      </div>
    </button>
  );
}

function AddCard({ kind }){
  return (
    <div className="card add">
      <div>
        <div className="plus">+</div>
        <h3>{kind === "games" ? "Add a new game" : "Add a new tool"}</h3>
        <p>just tell Claude!</p>
      </div>
    </div>
  );
}

// ── splash on click (cards "navigate" to placeholders) ──
function Splash({ project, onClose }){
  if (!project) return null;
  const url = `jiduojiang.com/${project.type}/${project.slug}/`;
  return (
    <div className="splash" onClick={onClose}>
      <div className="card-big" onClick={(e)=>e.stopPropagation()}>
        <div className="ce" style={{ "--card-bg": project.bg }}>{project.emoji}</div>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="url">{url}</div>
        <button onClick={onClose}>OK, back home</button>
      </div>
    </div>
  );
}

// ── decorative SVG arrow on hand-note ──
const ArrowSVG = () => (
  <svg className="arrow" viewBox="0 0 60 24">
    <path d="M2 12 Q 18 0, 32 12 T 54 14 M 48 8 L 56 14 L 48 20" />
  </svg>
);

// ── section ──
function Section({ id, emoji, title, items, palette, onOpen, kind, showAdd }){
  return (
    <section id={id} data-screen-label={`section-${kind}`}>
      <header className="section-head">
        <span className="sh-emoji">{emoji}</span>
        <h2 className="sh-title">{title}</h2>
        <span className="sh-count">{items.length} {items.length === 1 ? "thing" : "things"}</span>
        <span className="sh-rule" />
      </header>
      <div className="grid">
        {items.map(it => (
          <Card key={it.slug} item={it} palette={palette} onOpen={onOpen} type={kind} />
        ))}
        {showAdd && <AddCard kind={kind} />}
      </div>
    </section>
  );
}

// ── main app ──
function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [opened, setOpened] = useState(null);

  // theme via body class
  useEffect(() => {
    document.body.classList.toggle("theme-blocks", t.cardStyle === "blocks");
  }, [t.cardStyle]);

  // palette via CSS vars
  useEffect(() => {
    const root = document.documentElement;
    const names = ["--c1","--c2","--c3","--c4","--c5","--c6"];
    names.forEach((n, i) => {
      if (t.palette && t.palette[i]) root.style.setProperty(n, t.palette[i]);
    });
  }, [t.palette]);

  const handleNav = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page">
      {/* topbar */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">J</div>
          <div>
            <div className="brand-name">jiduojiang<span className="dot">.</span>com</div>
            <div className="brand-sub">// {t.kidAge}-year-old's coding lab</div>
          </div>
        </div>
        <nav className="nav-pills">
          <button className="pill" onClick={() => handleNav("games")}>🎮 Games</button>
          <button className="pill" onClick={() => handleNav("tools")}>🔧 Tools</button>
        </nav>
      </div>

      {/* hero */}
      <header className="hero" data-screen-label="hero">
        <span className="tape t1" />
        <span className="tape t2" />
        <div>
          <h1>
            Hi, I'm <span style={{ color: "var(--c1)" }}>{t.kidName}</span>
            ! <span className="wave">👋</span>
          </h1>
          <p className="lead">{t.tagline}</p>

          <div className="facts">
            <div className="fact"><span className="emo">🎂</span>{t.kidAge} years old</div>
            <div className="fact"><span className="emo">🏠</span>lives in Shanghai</div>
            <div className="fact"><span className="emo">💡</span>codes with Claude</div>
            <div className="fact"><span className="emo">🦖</span>loves dinosaurs</div>
          </div>

          <div className="hand-note">
            <ArrowSVG />
            scroll down to see what I made!
          </div>
        </div>

        <div className="portrait">
          <div className="frame">
            <div className="face">🧒🏻</div>
            <div className="cap">self-portrait goes here</div>
          </div>
          <div className="sticker s1">⭐</div>
          <div className="sticker s2">🚀</div>
          <div className="sticker s3">★</div>
        </div>
      </header>

      {/* games */}
      <Section
        id="games"
        emoji="🎮"
        title="Games I made"
        items={GAMES}
        palette={t.palette}
        onOpen={setOpened}
        kind="games"
        showAdd={t.showNewProjectCard}
      />

      {/* tools */}
      <Section
        id="tools"
        emoji="🔧"
        title="Tools I made"
        items={TOOLS}
        palette={t.palette}
        onOpen={setOpened}
        kind="tools"
        showAdd={t.showNewProjectCard}
      />

      {/* footer */}
      <footer className="footer">
        <div>made with <span className="heart">♥</span> and Claude · one push and everyone can play in a minute</div>
        <div>jiduojiang.com</div>
      </footer>

      {/* splash modal */}
      <Splash project={opened} onClose={() => setOpened(null)} />

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Style" />
        <TweakRadio
          label="Cards"
          value={t.cardStyle}
          options={["stickers", "blocks"]}
          onChange={(v) => setTweak("cardStyle", v)}
        />
        <TweakColor
          label="Palette"
          value={t.palette}
          options={[
            ["#ff6b6b","#ffc83d","#4fb3f5","#61c97a","#b67bff","#ff97c5"], /* crayon */
            ["#ef476f","#ffd166","#06d6a0","#118ab2","#073b4c","#f78c6b"], /* candy */
            ["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93","#ff7eb3"], /* primary+ */
            ["#f4a261","#e76f51","#2a9d8f","#264653","#e9c46a","#f4978e"], /* warm */
            ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#bdb2ff"], /* pastel */
          ]}
          onChange={(v) => setTweak("palette", v)}
        />
        <TweakSection label="Content" />
        <TweakText
          label="Name"
          value={t.kidName}
          onChange={(v) => setTweak("kidName", v)}
        />
        <TweakSlider
          label="Age"
          value={t.kidAge}
          min={4} max={12} step={1}
          onChange={(v) => setTweak("kidAge", v)}
        />
        <TweakToggle
          label='"Add new" card'
          value={t.showNewProjectCard}
          onChange={(v) => setTweak("showNewProjectCard", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
