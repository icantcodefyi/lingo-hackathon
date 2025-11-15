import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		// If already logged in, redirect to app
		if (session.data) {
			throw redirect({
				to: "/rizz-ads",
			});
		}
	},
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<ShaderBackground>
			<Header />
			<div className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
				<div className="w-full max-w-md">
					{showSignIn ? (
						<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
					) : (
						<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
					)}
				</div>
			</div>
		</ShaderBackground>
	);
}
