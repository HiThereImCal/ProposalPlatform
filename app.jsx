// app.jsx — single-page proposal document, QUB-themed. Light/dark toggle.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Theme persists in localStorage so reload keeps your preference.
  const [theme, setTheme] = React.useState(() => {
    try {
      return window.localStorage.getItem('qub-theme') || 'light';
    } catch { return 'light'; }
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { window.localStorage.setItem('qub-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="app" data-density={t.density}>
      <HomeMap density={t.density} theme={theme} onToggleTheme={toggleTheme} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout">
          <TweakRadio
            label="Density"
            value={t.density}
            options={['cozy', 'regular', 'compact']}
            onChange={(v) => setTweak('density', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
