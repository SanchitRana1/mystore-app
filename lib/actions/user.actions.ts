'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { parseStringify } from '../utils';
import { cookies } from 'next/headers';
import { avatarPlaceholderUrl } from '@/constants';
import { redirect } from 'next/navigation';

// helper function for getting existing user
const handleError = async (error: unknown, message: string) => {
	console.log(error, message);
	throw error;
};

// helper function for getting existing user
const getUserByEmail = async (email: string) => {
	const { databases } = await createAdminClient(); // get access to databases
	const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, [Query.equal('email', [email])]);
	return result?.total > 0 ? result.documents[0] : null;
};

// helper function for sending OTP on Email
export const sendEmailOTP = async ({ email }: { email: string }) => {
	const { account } = await createAdminClient(); // get access to account

	try {
		const session = await account.createEmailToken(ID.unique(), email);
		return session.userId;
	} catch (error) {
		handleError(error, 'Failed to send email OTP');
	}
};

export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
	const existingUser = await getUserByEmail(email); // get existing user
	const accountId = await sendEmailOTP({ email }); // get accountId

	if (!accountId) throw new Error('Failed to sent an OTP');
	if (!existingUser) {
		const { databases } = await createAdminClient();
		const userData = {
			fullName,
			email,
			avatar: avatarPlaceholderUrl,
			accountId
		};
		await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, ID.unique(), userData);
	}
	return parseStringify({ accountId });
};

export const verifySecret = async ({ accountId, password }: { accountId: string; password: string }) => {
	const { account } = await createAdminClient();
	const session = await account.createSession(accountId, password);
	try {
		(await cookies()).set('appwrite-session', session.secret, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true
		});
		return parseStringify({ sessiodId: session.$id });
	} catch (error) {
		handleError(error, 'Failed to verify OTP!');
	}
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();
    const result = await account.get();
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );
    if (user.total <= 0) return null;
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const signOutUser = async () => {
	const { account } = await createSessionClient();

	try {
		// Delete the current session
		await account.deleteSession('current');
		// Remove the session cookie
		(await cookies().delete('appwrite-session'))

	} catch (err) {
		handleError(err, 'Failed to sign out user!')
	} finally{
		redirect('/sign-in')
	}
};

export const 	signInUser = async ({email}:{email:string}) => {
	
	try {
		const existingUser = await getUserByEmail(email);
		console.log(existingUser);
		// userExists ? send OTP
		if(existingUser){
			await sendEmailOTP({email})
			return parseStringify({ accountId: existingUser?.accountId });
		}

		return parseStringify({accountId: null, error:'User not Found'})
	} catch (err) {
		handleError(err, 'Failed to sign in user!')
	}
};
