import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Loader2, Plus, X } from "lucide-react";

interface AdGeneratorFormProps {
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

export function AdGeneratorForm({
  onGenerate,
  isLoading,
  supportedLocales = [],
  supportedPlatforms = [],
}: AdGeneratorFormProps) {
  const [baseCopy, setBaseCopy] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleAddBenefit = () => setBenefits([...benefits, ""]);
  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleLocaleToggle = (locale: string) => {
    setSelectedLocales((prev) =>
      prev.includes(locale)
        ? prev.filter((l) => l !== locale)
        : [...prev, locale]
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      baseCopy,
      productDetails: {
        name: productName,
        category: productCategory,
        features: features.filter((f) => f.trim()),
        benefits: benefits.filter((b) => b.trim()),
      },
      targetLocales: selectedLocales,
      targetPlatforms: selectedPlatforms,
      industry,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Ad Copy</CardTitle>
          <CardDescription>
            Enter your original ad copy in English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={baseCopy}
            onChange={(e) => setBaseCopy(e.target.value)}
            placeholder="e.g., Boost your productivity with our AI-powered writing assistant. Try it free today!"
            className="min-h-[100px]"
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Provide information about your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., AI Writer Pro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g., Productivity Software"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., SaaS, finance, health, crypto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="e.g., AI-powered content generation"
                />
                {features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFeature}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Benefits</Label>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="e.g., Save 10 hours per week"
                />
                {benefits.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveBenefit(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBenefit}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Markets</CardTitle>
          <CardDescription>
            Select the countries/regions you want to target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supportedLocales.map((locale) => (
              <Badge
                key={locale.code}
                variant={
                  selectedLocales.includes(locale.code) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => handleLocaleToggle(locale.code)}
              >
                {locale.code} {locale.name && `- ${locale.name}`}{" "}
                {locale.region && `(${locale.region})`}
              </Badge>
            ))}
          </div>
          {selectedLocales.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Please select at least one target market
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ad Platforms</CardTitle>
          <CardDescription>
            Select the platforms where you want to run ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supportedPlatforms.map((platform) => (
              <Badge
                key={platform.id}
                variant={
                  selectedPlatforms.includes(platform.id)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => handlePlatformToggle(platform.id)}
              >
                {platform.name}
              </Badge>
            ))}
          </div>
          {selectedPlatforms.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Please select at least one platform
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          isLoading ||
          !baseCopy ||
          !productName ||
          !productCategory ||
          !industry ||
          selectedLocales.length === 0 ||
          selectedPlatforms.length === 0
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Ads...
          </>
        ) : (
          "Generate Localized Ads"
        )}
      </Button>
    </form>
  );
}
