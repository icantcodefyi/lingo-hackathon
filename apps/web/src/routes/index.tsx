import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import HeroContent from "@/components/hero-content";
import PulsingCircle from "@/components/pulsing-circle";
import ShaderBackground from "@/components/shader-background";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<ShaderBackground>
			<Header />
			<HeroContent />
			<PulsingCircle />
		</ShaderBackground>
	);
}
