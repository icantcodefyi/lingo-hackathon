import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";

export default function Header() {
	const { data: session } = authClient.useSession();

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

			{/* Auth Actions */}
			<div className="relative flex items-center gap-3">
				{session && (
					<Link
						to="/rizz-ads"
						className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
					>
						App
					</Link>
				)}

				{!session ? (
					<Link
						to="/login"
						className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center"
					>
						Sign In
					</Link>
				) : (
					<div className="[&_button]:bg-white/10 [&_button]:backdrop-blur-sm [&_button]:text-white [&_button]:border-white/20 [&_button]:hover:bg-white/20">
						<UserMenu />
					</div>
				)}
			</div>
		</header>
	);
}
