import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-dark-bg/95 to-dark-bg/50 backdrop-blur-sm border-b border-neon-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group">
          <div className="font-orbitron font-black text-2xl tracking-wider group-hover:scale-110 transition-transform duration-300">
            <span className="bg-gradient-to-r from-neon-primary via-neon-secondary to-neon-primary bg-clip-text text-transparent drop-shadow-lg">
              ◇ DREAMS
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 sm:gap-8">
          <Link
            to="/gallery"
            className={`font-exo2 text-sm sm:text-base transition-all duration-300 ${
              isActive("/gallery")
                ? "text-neon-primary"
                : "text-neon-secondary hover:text-neon-primary"
            }`}
          >
            Gallery
          </Link>
          <Link
            to="/submit"
            className={`font-exo2 text-sm sm:text-base transition-all duration-300 ${
              isActive("/submit")
                ? "text-neon-primary"
                : "text-neon-secondary hover:text-neon-primary"
            }`}
          >
            Submit Wish
          </Link>
          <Link
            to="/about"
            className={`font-exo2 text-sm sm:text-base transition-all duration-300 ${
              isActive("/about")
                ? "text-neon-primary"
                : "text-neon-secondary hover:text-neon-primary"
            }`}
          >
            About
          </Link>
          <Link
            to="/submit"
            className="hidden sm:inline neon-button text-sm"
          >
            Submit – $1
          </Link>
        </nav>
      </div>
    </header>
  );
}
