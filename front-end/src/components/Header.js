import { useNavigate } from "react-router-dom";
import { FiCompass, FiGlobe, FiChevronDown, FiMap, FiSun } from "react-icons/fi";

export function Brand() {
  return <span className="brand"><span className="brand-icon"><FiCompass /></span>Travel<span className="brand-accent">IA</span></span>;
}

export default function Header({ t, language, loading }) {
  const navigate = useNavigate();
  return (
    <header className="masthead">
      <div className="masthead-inner shell">
        <a href="#top" aria-label="Travel IA"><Brand /></a>
        <nav aria-label={t.planner}>
          <a href="#planner"><FiMap />{t.planner}</a>
          <a href="#inspiration"><FiSun />{t.inspiration}</a>
        </nav>
        <label className="language">
          <FiGlobe /><select aria-label={t.language} value={language} disabled={loading}
            onChange={event => navigate("/" + event.target.value.toLowerCase())}>
            <option value="PT-BR" lang="pt-BR">PT-BR</option>
            <option value="FR" lang="fr">FR</option><option value="EN" lang="en">EN</option>
          </select><FiChevronDown />
        </label>
      </div>
    </header>
  );
}
