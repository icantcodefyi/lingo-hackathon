import {
	Check,
	ChevronLeft,
	ChevronRight,
	Plus,
	Sparkles,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

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

// Steps will be translated dynamically
const getSteps = (t: (key: string) => string) => [
	{
		id: 1,
		title: t("adGenerator.steps.productInfo.title"),
		description: t("adGenerator.steps.productInfo.description"),
	},
	{
		id: 2,
		title: t("adGenerator.steps.adCopy.title"),
		description: t("adGenerator.steps.adCopy.description"),
	},
	{
		id: 3,
		title: t("adGenerator.steps.targetMarkets.title"),
		description: t("adGenerator.steps.targetMarkets.description"),
	},
];

export function AdGeneratorStepper({
	onGenerate,
	isLoading,
	supportedLocales = [],
	supportedPlatforms = [],
}: AdGeneratorStepperProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [_language, setLanguage] = useState(i18n.language);
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

	useEffect(() => {
		const handleLanguageChanged = (lng: string) => {
			setLanguage(lng);
		};

		i18n.on("languageChanged", handleLanguageChanged);
		return () => {
			i18n.off("languageChanged", handleLanguageChanged);
		};
	}, []);

	const t = (key: string) => i18n.t(key);
	const steps = getSteps(t);

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
		<div className="mx-auto max-w-3xl">
			{/* Progress Steps */}
			<div className="mb-12">
				<div className="relative flex items-center justify-between">
					{/* Progress Line */}
					<div className="absolute top-5 right-0 left-0 h-[2px] bg-white/10">
						<div
							className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
							style={{
								width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
							}}
						/>
					</div>

					{/* Step Indicators */}
					{steps.map((step, _index) => {
						const isCompleted = currentStep > step.id;
						const isCurrent = currentStep === step.id;

						return (
							<div
								key={step.id}
								className="relative z-10 flex flex-col items-center"
							>
								<div
									className={cn(
										"mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
										isCompleted && "bg-primary",
										isCurrent &&
											"bg-white/20 ring-2 ring-white/40 backdrop-blur-sm",
										!isCompleted && !isCurrent && "bg-white/5 backdrop-blur-sm",
									)}
								>
									{isCompleted ? (
										<Check className="zoom-in h-5 w-5 animate-in text-white duration-300" />
									) : (
										<span className="font-medium text-white">{step.id}</span>
									)}
								</div>
								<div className="text-center">
									<p
										className={cn(
											"font-medium text-sm transition-all duration-300",
											isCurrent ? "text-white" : "text-white/50",
										)}
									>
										{step.title}
									</p>
									<p className="mt-1 hidden text-white/30 text-xs transition-opacity duration-300 sm:block">
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
				<div className="min-h-[500px] rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
					{/* Step 1: Product Details */}
					{currentStep === 1 && (
						<div
							className="fade-in slide-in-from-right-4 animate-in space-y-6 duration-500"
							key="step-1"
						>
							<div>
								<h2 className="mb-2 font-semibold text-2xl text-white">
									{t("adGenerator.productInfo.title")}
								</h2>
								<p className="text-sm text-white/60">
									{t("adGenerator.productInfo.subtitle")}
								</p>
							</div>

							<div className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="productName" className="text-white/90">
										{t("adGenerator.productInfo.productName")}
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
										placeholder={t(
											"adGenerator.productInfo.productNamePlaceholder",
										)}
										className="border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="category" className="text-white/90">
										{t("adGenerator.productInfo.category")}
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
										placeholder={t(
											"adGenerator.productInfo.categoryPlaceholder",
										)}
										className="border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="industry" className="text-white/90">
										{t("adGenerator.productInfo.industry")}
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
										placeholder={t(
											"adGenerator.productInfo.industryPlaceholder",
										)}
										className="border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
									/>
								</div>

								<div className="space-y-2">
									<Label className="text-white/90">
										{t("adGenerator.productInfo.features")}
									</Label>
									<div className="space-y-2">
										{formData.features.map((feature, index) => (
											<div
												key={`feature-${index}-${feature}`}
												className="flex gap-2"
											>
												<Input
													value={feature}
													onChange={(e) =>
														handleFeatureChange(index, e.target.value)
													}
													placeholder={t(
														"adGenerator.productInfo.featurePlaceholder",
													)}
													className="border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
												/>
												{formData.features.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => handleRemoveFeature(index)}
														className="text-white/60 hover:bg-white/10 hover:text-white"
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
											className="text-white/60 hover:bg-white/10 hover:text-white"
										>
											<Plus className="mr-2 h-4 w-4" />
											{t("adGenerator.productInfo.addFeature")}
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label className="text-white/90">
										{t("adGenerator.productInfo.benefits")}
									</Label>
									<div className="space-y-2">
										{formData.benefits.map((benefit, index) => (
											<div
												key={`benefit-${index}-${benefit}`}
												className="flex gap-2"
											>
												<Input
													value={benefit}
													onChange={(e) =>
														handleBenefitChange(index, e.target.value)
													}
													placeholder={t(
														"adGenerator.productInfo.benefitPlaceholder",
													)}
													className="border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
												/>
												{formData.benefits.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => handleRemoveBenefit(index)}
														className="text-white/60 hover:bg-white/10 hover:text-white"
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
											className="text-white/60 hover:bg-white/10 hover:text-white"
										>
											<Plus className="mr-2 h-4 w-4" />
											{t("adGenerator.productInfo.addBenefit")}
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Ad Copy */}
					{currentStep === 2 && (
						<div
							className="fade-in slide-in-from-right-4 animate-in space-y-6 duration-500"
							key="step-2"
						>
							<div>
								<h2 className="mb-2 font-semibold text-2xl text-white">
									{t("adGenerator.adCopy.title")}
								</h2>
								<p className="text-sm text-white/60">
									{t("adGenerator.adCopy.subtitle")}
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="baseCopy" className="text-white/90">
									{t("adGenerator.adCopy.label")}
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
									placeholder={t("adGenerator.adCopy.placeholder")}
									className="min-h-[300px] resize-none border-white/20 bg-white/10 text-white transition-colors placeholder:text-white/40 focus:bg-white/15"
								/>
								<p className="text-white/40 text-xs">
									{formData.baseCopy.length}{" "}
									{t("adGenerator.adCopy.characters")}
								</p>
							</div>
						</div>
					)}

					{/* Step 3: Target Markets & Platforms */}
					{currentStep === 3 && (
						<div
							className="fade-in slide-in-from-right-4 animate-in space-y-6 duration-500"
							key="step-3"
						>
							<div>
								<h2 className="mb-2 font-semibold text-2xl text-white">
									{t("adGenerator.targetMarkets.title")}
								</h2>
								<p className="text-sm text-white/60">
									{t("adGenerator.targetMarkets.subtitle")}
								</p>
							</div>

							<div className="space-y-5">
								<div className="space-y-3">
									<Label className="text-white/90">
										{t("adGenerator.targetMarkets.markets")}
									</Label>
									<div className="flex max-h-[200px] flex-wrap gap-2 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-4">
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
														? "fade-in animate-in border-0 bg-primary text-white duration-200"
														: "border-white/20 bg-white/10 text-white/70 hover:border-white/30 hover:bg-white/20",
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
											{t("adGenerator.targetMarkets.selectAtLeastOneMarket")}
										</p>
									)}
									{formData.selectedLocales.length > 0 && (
										<p className="text-sm text-white/60">
											{formData.selectedLocales.length}{" "}
											{formData.selectedLocales.length > 1
												? t("adGenerator.targetMarkets.marketsSelectedPlural")
												: t("adGenerator.targetMarkets.marketsSelected")}{" "}
											{t("adGenerator.targetMarkets.selected")}
										</p>
									)}
								</div>

								<div className="space-y-3">
									<Label className="text-white/90">
										{t("adGenerator.targetMarkets.platforms")}
									</Label>
									<div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
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
														? "fade-in animate-in border-0 bg-primary text-white duration-200"
														: "border-white/20 bg-white/10 text-white/70 hover:border-white/30 hover:bg-white/20",
												)}
												onClick={() => handlePlatformToggle(platform.id)}
											>
												{platform.name}
											</Badge>
										))}
									</div>
									{formData.selectedPlatforms.length === 0 && (
										<p className="text-sm text-white/40">
											{t("adGenerator.targetMarkets.selectAtLeastOnePlatform")}
										</p>
									)}
									{formData.selectedPlatforms.length > 0 && (
										<p className="text-sm text-white/60">
											{formData.selectedPlatforms.length}{" "}
											{formData.selectedPlatforms.length > 1
												? t("adGenerator.targetMarkets.platformsSelectedPlural")
												: t("adGenerator.targetMarkets.platformsSelected")}{" "}
											{t("adGenerator.targetMarkets.selected")}
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
						className="text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-30"
					>
						<ChevronLeft className="mr-2 h-4 w-4" />
						{t("adGenerator.navigation.back")}
					</Button>

					<div className="flex items-center gap-3">
						{currentStep < 3 ? (
							<Button
								type="button"
								onClick={handleNext}
								disabled={!canProceedFromStep(currentStep)}
								className="bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{t("adGenerator.navigation.continue")}
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Button
								type="submit"
								disabled={!canProceedFromStep(3) || isLoading}
								className="min-w-[180px] bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isLoading ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										{t("adGenerator.navigation.generating")}
									</>
								) : (
									<>
										<Sparkles className="mr-2 h-4 w-4" />
										{t("adGenerator.navigation.generateAds")}
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
