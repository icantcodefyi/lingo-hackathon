import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	const handleGoogleSignIn = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard",
		});
	};

	return (
		<div className="fade-in slide-in-from-bottom-8 mx-auto mt-10 w-full max-w-md animate-in rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl duration-700">
			<h1 className="mb-6 text-center font-bold text-3xl text-white">
				Create Account
			</h1>

			<Button
				type="button"
				variant="outline"
				className="mb-4 w-full border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
				onClick={handleGoogleSignIn}
			>
				<svg
					className="mr-2 h-4 w-4"
					viewBox="0 0 24 24"
					role="img"
					aria-label="Google logo"
				>
					<title>Google logo</title>
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Continue with Google
			</Button>

			<div className="relative mb-4">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-white/20 border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-transparent px-2 text-white/60">
						Or continue with email
					</span>
				</div>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-white/90">
									Name
								</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="border-white/20 bg-white/10 text-white transition-all duration-200 placeholder:text-white/40 focus:border-purple-500 focus:bg-white/15"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error?.message}
										className="fade-in slide-in-from-top-2 animate-in text-red-400 text-sm duration-200"
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-white/90">
									Email
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="border-white/20 bg-white/10 text-white transition-all duration-200 placeholder:text-white/40 focus:border-purple-500 focus:bg-white/15"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error?.message}
										className="fade-in slide-in-from-top-2 animate-in text-red-400 text-sm duration-200"
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-white/90">
									Password
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="border-white/20 bg-white/10 text-white transition-all duration-200 placeholder:text-white/40 focus:border-purple-500 focus:bg-white/15"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error?.message}
										className="fade-in slide-in-from-top-2 animate-in text-red-400 text-sm duration-200"
									>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-50"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? (
								<>
									<div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Creating Account...
								</>
							) : (
								"Sign Up"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignIn}
					className="text-white/70 transition-all duration-200 hover:text-white"
				>
					Already have an account? Sign In
				</Button>
			</div>
		</div>
	);
}
