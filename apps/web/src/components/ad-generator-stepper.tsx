import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import {
	ChevronRight,
	ChevronLeft,
	Check,
	Sparkles,
	Plus,
	X,
} from "lucide-react";

interface AdGeneratorStepperProps {
	onGenerate: (data: {
		baseCopy: string;
		productDetails: {
			name: string;
			category: string;
			features: string[];
			benefits: string[];
		};
		targetLocales: string[];
		targetPlatforms: string[];
		industry: string;
	}) => void;
	isLoading?: boolean;
	supportedLocales?: Array<{ code: string; name?: string; region?: string }>;
	supportedPlatforms?: Array<{ id: string; name: string }>;
}

const steps = [
	{ id: 1, title: "Product Info", description: "Tell us about your product" },
	{ id: 2, title: "Ad Copy", description: "Your base ad content" },
	{ id: 3, title: "Target Markets", description: "Select regions & platforms" },
];

export function AdGeneratorStepper({
	onGenerate,
	isLoading,
	supportedLocales = [],
	supportedPlatforms = [],
}: AdGeneratorStepperProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		productName: "",
		productCategory: "",
		industry: "",
		features: [""],
		benefits: [""],
		baseCopy: "",
		selectedLocales: [] as string[],
		selectedPlatforms: [] as string[],
	});

	// Step 1: Product Details
	const handleAddFeature = () => {
		setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
	};

	const handleRemoveFeature = (index: number) => {
		setFormData((prev) => ({
			...prev,
			features: prev.features.filter((_, i) => i !== index),
		}));
	};

	const handleFeatureChange = (index: number, value: string) => {
		const newFeatures = [...formData.features];
		newFeatures[index] = value;
		setFormData((prev) => ({ ...prev, features: newFeatures }));
	};

	const handleAddBenefit = () => {
		setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }));
	};

	const handleRemoveBenefit = (index: number) => {
		setFormData((prev) => ({
			...prev,
			benefits: prev.benefits.filter((_, i) => i !== index),
		}));
	};

	const handleBenefitChange = (index: number, value: string) => {
		const newBenefits = [...formData.benefits];
		newBenefits[index] = value;
		setFormData((prev) => ({ ...prev, benefits: newBenefits }));
	};

	// Step 3: Target Markets
	const handleLocaleToggle = (locale: string) => {
		setFormData((prev) => ({
			...prev,
			selectedLocales: prev.selectedLocales.includes(locale)
				? prev.selectedLocales.filter((l) => l !== locale)
				: [...prev.selectedLocales, locale],
		}));
	};

	const handlePlatformToggle = (platform: string) => {
		setFormData((prev) => ({
			...prev,
			selectedPlatforms: prev.selectedPlatforms.includes(platform)
				? prev.selectedPlatforms.filter((p) => p !== platform)
				: [...prev.selectedPlatforms, platform],
		}));
	};

	const canProceedFromStep = (step: number) => {
		switch (step) {
			case 1:
				return (
					formData.productName.trim() &&
					formData.productCategory.trim() &&
					formData.industry.trim()
				);
			case 2:
				return formData.baseCopy.trim();
			case 3:
				return (
					formData.selectedLocales.length > 0 &&
					formData.selectedPlatforms.length > 0
				);
			default:
				return false;
		}
	};

	const handleNext = () => {
		if (canProceedFromStep(currentStep) && currentStep < 3) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (canProceedFromStep(3)) {
			onGenerate({
				baseCopy: formData.baseCopy,
				productDetails: {
					name: formData.productName,
					category: formData.productCategory,
					features: formData.features.filter((f) => f.trim()),
					benefits: formData.benefits.filter((b) => b.trim()),
				},
				targetLocales: formData.selectedLocales,
				targetPlatforms: formData.selectedPlatforms,
				industry: formData.industry,
			});
		}
	};

	return (
		<div className="max-w-3xl mx-auto">
			{/* Progress Steps */}
			<div className="mb-12">
				<div className="flex items-center justify-between relative">
					{/* Progress Line */}
					<div className="absolute top-5 left-0 right-0 h-[2px] bg-white/10">
						<div
							className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
							style={{
								width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
							}}
						/>
					</div>

				{/* Step Indicators */}
				{steps.map((step, index) => {
					const isCompleted = currentStep > step.id;
					const isCurrent = currentStep === step.id;

					return (
						<div
							key={step.id}
							className="flex flex-col items-center relative z-10"
						>
							<div
							className={cn(
								"w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 mb-2",
								isCompleted &&
									"bg-primary",
								isCurrent &&
									"bg-white/20 backdrop-blur-sm ring-2 ring-white/40",
								!isCompleted && !isCurrent && "bg-white/5 backdrop-blur-sm",
							)}
							>
								{isCompleted ? (
									<Check className="w-5 h-5 text-white animate-in zoom-in duration-300" />
								) : (
									<span className="text-white font-medium">{step.id}</span>
								)}
							</div>
							<div className="text-center">
								<p
									className={cn(
										"text-sm font-medium transition-all duration-300",
										isCurrent ? "text-white" : "text-white/50",
									)}
								>
									{step.title}
								</p>
								<p className="text-xs text-white/30 mt-1 hidden sm:block transition-opacity duration-300">
									{step.description}
								</p>
							</div>
						</div>
					);
				})}
				</div>
			</div>

			{/* Form Content */}
			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[500px] transition-all duration-300 hover:border-white/20">
					{/* Step 1: Product Details */}
					{currentStep === 1 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" key="step-1">
							<div>
								<h2 className="text-2xl font-semibold text-white mb-2">
									Product Information
								</h2>
								<p className="text-white/60 text-sm">
									Help us understand what you're advertising
								</p>
							</div>

							<div className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="productName" className="text-white/90">
										Product Name *
									</Label>
									<Input
										id="productName"
										value={formData.productName}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												productName: e.target.value,
											}))
										}
										placeholder="e.g., AI Writer Pro"
										className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="category" className="text-white/90">
										Category *
									</Label>
									<Input
										id="category"
										value={formData.productCategory}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												productCategory: e.target.value,
											}))
										}
										placeholder="e.g., Productivity Software"
										className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="industry" className="text-white/90">
										Industry *
									</Label>
									<Input
										id="industry"
										value={formData.industry}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												industry: e.target.value,
											}))
										}
										placeholder="e.g., SaaS, Finance, Healthcare"
										className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors"
									/>
								</div>

								<div className="space-y-2">
									<Label className="text-white/90">
										Key Features (optional)
									</Label>
									<div className="space-y-2">
										{formData.features.map((feature, index) => (
											<div key={index} className="flex gap-2">
												<Input
													value={feature}
													onChange={(e) =>
														handleFeatureChange(index, e.target.value)
													}
													placeholder="e.g., AI-powered content generation"
													className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors"
												/>
												{formData.features.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => handleRemoveFeature(index)}
														className="text-white/60 hover:text-white hover:bg-white/10"
													>
														<X className="h-4 w-4" />
													</Button>
												)}
											</div>
										))}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handleAddFeature}
											className="text-white/60 hover:text-white hover:bg-white/10"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Feature
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label className="text-white/90">
										Key Benefits (optional)
									</Label>
									<div className="space-y-2">
										{formData.benefits.map((benefit, index) => (
											<div key={index} className="flex gap-2">
												<Input
													value={benefit}
													onChange={(e) =>
														handleBenefitChange(index, e.target.value)
													}
													placeholder="e.g., Save 10 hours per week"
													className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors"
												/>
												{formData.benefits.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => handleRemoveBenefit(index)}
														className="text-white/60 hover:text-white hover:bg-white/10"
													>
														<X className="h-4 w-4" />
													</Button>
												)}
											</div>
										))}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handleAddBenefit}
											className="text-white/60 hover:text-white hover:bg-white/10"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Benefit
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Ad Copy */}
					{currentStep === 2 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" key="step-2">
							<div>
								<h2 className="text-2xl font-semibold text-white mb-2">
									Base Ad Copy
								</h2>
								<p className="text-white/60 text-sm">
									Enter your original ad copy in English. We'll localize it for
									your target markets.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="baseCopy" className="text-white/90">
									Ad Copy *
								</Label>
								<Textarea
									id="baseCopy"
									value={formData.baseCopy}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											baseCopy: e.target.value,
										}))
									}
									placeholder="e.g., Boost your productivity with our AI-powered writing assistant. Get started today and save 10 hours per week!"
									className="min-h-[300px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-colors resize-none"
								/>
								<p className="text-xs text-white/40">
									{formData.baseCopy.length} characters
								</p>
							</div>
						</div>
					)}

					{/* Step 3: Target Markets & Platforms */}
					{currentStep === 3 && (
						<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" key="step-3">
							<div>
								<h2 className="text-2xl font-semibold text-white mb-2">
									Target Markets & Platforms
								</h2>
								<p className="text-white/60 text-sm">
									Choose where you want to run your ads
								</p>
							</div>

							<div className="space-y-5">
								<div className="space-y-3">
									<Label className="text-white/90">Target Markets *</Label>
									<div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-4 bg-white/5 rounded-lg border border-white/10">
										{supportedLocales.map((locale) => (
											<Badge
												key={locale.code}
												variant={
													formData.selectedLocales.includes(locale.code)
														? "default"
														: "outline"
												}
												className={cn(
													"cursor-pointer transition-all duration-300",
													formData.selectedLocales.includes(locale.code)
														? "bg-primary border-0 text-white animate-in fade-in duration-200"
														: "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30",
												)}
												onClick={() => handleLocaleToggle(locale.code)}
											>
												{locale.code}
												{locale.name && ` - ${locale.name}`}
												{locale.region && ` (${locale.region})`}
											</Badge>
										))}
									</div>
									{formData.selectedLocales.length === 0 && (
										<p className="text-sm text-white/40">
											Select at least one target market
										</p>
									)}
									{formData.selectedLocales.length > 0 && (
										<p className="text-sm text-white/60">
											{formData.selectedLocales.length} market
											{formData.selectedLocales.length > 1 ? "s" : ""} selected
										</p>
									)}
								</div>

								<div className="space-y-3">
									<Label className="text-white/90">Ad Platforms *</Label>
									<div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
										{supportedPlatforms.map((platform) => (
											<Badge
												key={platform.id}
												variant={
													formData.selectedPlatforms.includes(platform.id)
														? "default"
														: "outline"
												}
												className={cn(
													"cursor-pointer transition-all duration-300",
													formData.selectedPlatforms.includes(platform.id)
														? "bg-primary border-0 text-white animate-in fade-in duration-200"
														: "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30",
												)}
												onClick={() => handlePlatformToggle(platform.id)}
											>
												{platform.name}
											</Badge>
										))}
									</div>
									{formData.selectedPlatforms.length === 0 && (
										<p className="text-sm text-white/40">
											Select at least one platform
										</p>
									)}
									{formData.selectedPlatforms.length > 0 && (
										<p className="text-sm text-white/60">
											{formData.selectedPlatforms.length} platform
											{formData.selectedPlatforms.length > 1 ? "s" : ""}{" "}
											selected
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Navigation Buttons */}
				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant="ghost"
						onClick={handleBack}
						disabled={currentStep === 1}
						className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all duration-200"
					>
						<ChevronLeft className="w-4 h-4 mr-2" />
						Back
					</Button>

					<div className="flex items-center gap-3">
						{currentStep < 3 ? (
							<Button
								type="button"
								onClick={handleNext}
								disabled={!canProceedFromStep(currentStep)}
								className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
							>
								Continue
								<ChevronRight className="w-4 h-4 ml-2" />
							</Button>
						) : (
							<Button
								type="submit"
								disabled={!canProceedFromStep(3) || isLoading}
								className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] transition-all duration-200"
							>
								{isLoading ? (
									<>
										<div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Sparkles className="w-4 h-4 mr-2" />
										Generate Ads
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
