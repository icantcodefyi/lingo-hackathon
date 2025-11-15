"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

interface ShaderBackgroundProps {
	children: React.ReactNode;
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const handleMouseEnter = () => setIsActive(true);
		const handleMouseLeave = () => setIsActive(false);

		const container = containerRef.current;
		if (container) {
			container.addEventListener("mouseenter", handleMouseEnter);
			container.addEventListener("mouseleave", handleMouseLeave);
		}

		return () => {
			if (container) {
				container.removeEventListener("mouseenter", handleMouseEnter);
				container.removeEventListener("mouseleave", handleMouseLeave);
			}
		};
	}, []);

	return (
		<>
			{/* Background Shaders - Fixed position for smooth scrolling */}
			<div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
				<MeshGradient
					className="absolute inset-0 w-full h-full"
					colors={["#0a0a0f", "#6132a3", "#1e1b4b", "#2d1b69", "#0f0a1e"]}
					speed={0.3}
				/>
				<MeshGradient
					className="absolute inset-0 w-full h-full opacity-50"
					colors={["#1e1b4b", "#6132a3", "#4c1d95", "#2d1b69"]}
					speed={0.2}
				/>
			</div>

			{/* SVG Filters */}
			<svg className="fixed top-0 left-0 w-0 h-0">
				<defs>
					<filter
						id="glass-effect"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
						<feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
						<feColorMatrix
							type="matrix"
							values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
							result="tint"
						/>
					</filter>
					<filter
						id="gooey-filter"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
						<feColorMatrix
							in="blur"
							mode="matrix"
							values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
							result="gooey"
						/>
						<feComposite in="SourceGraphic" in2="gooey" operator="atop" />
					</filter>
				</defs>
			</svg>

			<div
				ref={containerRef}
				className="min-h-screen relative z-10"
			>
				{children}
			</div>
		</>
	);
}
