'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createAccount, signInUser } from '@/lib/actions/user.actions';
import OTPModal from './OTPModal';

type FormType = 'sign-in' | 'sign-up';
const authFormSchema = (formType: FormType) => {
	return z.object({
		fullname: formType === 'sign-up' ? z.string().min(3, { message: 'Full Name must be at least 3 characters.' }).max(50) : z.string().optional(),
		email: z.string().email('This is not a valid email.')
	});
};

const AuthForm = ({ type }: { type: FormType }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [accountId, setAccountId] = useState(null);
	const formSchema = authFormSchema(type);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullname: '',
			email: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log('Submitted values:', values); // Check values in console
		setIsLoading(true);
		setErrorMessage('');
		try {
			const user = type==='sign-up' ? await createAccount({
				fullName: values.fullname || 'dafaultUser',
				email: values.email
			}) : await signInUser({email: values.email})

			console.log('User:',user);
			setAccountId(user?.accountId);
		} catch (error) {
			console.log(error);
			setErrorMessage('Failed to create an account, please try again!');
		} finally {
			setIsLoading(false);
		}
	};
	const onError = (errors: unknown) => {
		console.log('Validation errors:', errors);
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit, onError)} className="auth-form">
					<h1 className="form-title">{type === 'sign-in' ? 'Sign In' : 'Sign Up'}</h1>
					{type === 'sign-up' && (
						<FormField
							control={form.control}
							name="fullname"
							render={({ field }) => (
								<FormItem>
									<div className="shad-form-item">
										<FormLabel className="shad-form-label">Full Name</FormLabel>
										<FormControl>
											<Input className="shad-input" placeholder="Enter full Name" {...field} />
										</FormControl>
									</div>
									<FormMessage className="shad-form-message" />
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<div className="shad-form-item">
									<FormLabel className="shad-form-label">Email</FormLabel>
									<FormControl>
										<Input className="shad-input" placeholder="Enter Email" {...field} />
									</FormControl>
								</div>
								<FormMessage className="shad-form-message" />
							</FormItem>
						)}
					/>
					<Button type="submit" className="form-submit-button" disabled={isLoading}>
						{type === 'sign-in' ? 'Sign In' : 'Sign Up'}
						{isLoading && <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin"></Image>}
					</Button>
					{errorMessage && <p className="error-message">*{errorMessage}</p>}
					<div className="body-2 flex justify-center">
						<p className="text-light-100">{type === 'sign-in' ? "don't have an account ?" : 'Already have an account ?'}</p>
						<Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="ml-1 font-medium text-brand">
							{type === 'sign-in' ? 'Sign Up' : 'Sign In'}
						</Link>
					</div>
				</form>
			</Form>
			{/* OTP verification */}
			{accountId && <OTPModal email={form.getValues('email')} accountId={accountId}/>}
		</>
	);
};

export default AuthForm;
