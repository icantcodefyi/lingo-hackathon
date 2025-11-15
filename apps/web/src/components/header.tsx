import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <span className="text-2xl font-medium text-white">
          <span className="italic instrument">Rizz</span> Ads
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        <a
          href="https://lingo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Lingo.dev
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          GitHub
        </a>
      </nav>

      {/* Launch App Button */}
      <div className="relative flex items-center group">
        <Link
          to="/rizz-ads"
          className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center"
        >
          Launch App
        </Link>
      </div>
    </header>
  );
}
