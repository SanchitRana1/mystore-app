'use server'

import { Client, Account, Databases, Storage, Avatars } from 'node-appwrite';
import { appwriteConfig } from './config';
import { cookies } from 'next/headers';
// node-appwrite
export const createSessionClient = async () => {
	const client = new Client().setEndpoint(appwriteConfig.endpointUrl).setProject(appwriteConfig.projectId);
    const session = (await cookies()).get('appwrite-session')
    
    if(!session || !session.value) throw new Error('No Session') // throw error is no session found
    
    client.setSession(session.value); // set session if found

    return{
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client)
        }

    }
};

export const createAdminClient = async () => {
	const client = new Client().setEndpoint(appwriteConfig.endpointUrl).setProject(appwriteConfig.projectId).setKey(appwriteConfig.secretKey);
    
    return{
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client)
        },
        get storage(){
            return new Storage(client)
        },
        get avatars(){
            return new Avatars(client)
        }
    }
};
