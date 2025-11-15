import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import Header from "@/components/header";
import ShaderBackground from "@/components/shader-background";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const privateData = useQuery(orpc.privateData.queryOptions());

	return (
		<ShaderBackground>
			<Header />
			<div className="container relative z-10 mx-auto px-6 py-12">
				<div className="fade-in slide-in-from-bottom-8 animate-in rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-700 hover:border-white/20">
					<h1 className="fade-in slide-in-from-left-4 mb-4 animate-in font-bold text-4xl text-white duration-500">
						Dashboard
					</h1>
					<p className="fade-in slide-in-from-left-4 mb-2 animate-in text-lg text-white/80 delay-100 duration-500">
						Welcome {session.data?.user.name}
					</p>
					<p className="fade-in slide-in-from-left-4 animate-in text-white/60 delay-200 duration-500">
						API: {privateData.data?.message}
					</p>
				</div>
			</div>
		</ShaderBackground>
	);
}
