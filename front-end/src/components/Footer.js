import { FiLinkedin, FiBriefcase } from "react-icons/fi";
import { Brand } from "./Header";

export default function Footer() {
  return (
    <footer className="shell footer"><Brand /><small>© {new Date().getFullYear()} Pedro Meireles</small>
      <a aria-label="LinkedIn" href="https://www.linkedin.com/in/pedro-henrique-braz-meireles-68609b204/" target="_blank" rel="noreferrer"><FiLinkedin /></a>
      <a aria-label="Freelance.com" href="https://plateforme.freelance.com/freelance/Pedro-80201e0a-b4f1-40c3-ad2a-7828044205f6" target="_blank" rel="noreferrer"><FiBriefcase /></a>
    </footer>
  );
}
