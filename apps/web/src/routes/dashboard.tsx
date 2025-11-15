import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";

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
			<div className="relative z-10 container mx-auto px-6 py-12">
				<div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
					<h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
					<p className="text-white/80 text-lg mb-2">
						Welcome {session.data?.user.name}
					</p>
					<p className="text-white/60">API: {privateData.data?.message}</p>
				</div>
			</div>
		</ShaderBackground>
	);
}
