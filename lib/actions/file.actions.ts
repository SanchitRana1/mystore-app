'use server';

import { createAdminClient } from '@/lib/appwrite';
import { InputFile } from 'node-appwrite/file';
import { appwriteConfig } from '@/lib/appwrite/config';
import { ID, Models, Query } from 'node-appwrite';
import { constructFileUrl, getFileType, parseStringify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { DeleteFileProps, GetFilesProps, RenameFileProps, UpdateFileUsersProps, UploadFileProps } from '@/types';
import { getCurrentUser } from './user.actions';
// import fs from 'fs/promises'; // For reading file content asynchronously

const handleError = (error: unknown, message: string) => {
	console.log(error, message);
	throw error;
};

const createQueries = (currentUser: Models.Document, types: string[], searchText: string, sort: string, limit: number | undefined) => {
	const queries = [Query.or([Query.equal('owner', [currentUser.$id]), Query.contains('users', [currentUser.email])])];

	// TODO: Search , Sort, Limits ...4
	if (types.length > 0) queries.push(Query.equal('type', types));
	if (searchText) queries.push(Query.contains('name', searchText));
	if (limit) queries.push(Query.limit(limit));
	if (sort) {
		const [sortBy, orderBy] = sort.split('-');
		queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
	}
	return queries;
};
export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
	const { storage, databases } = await createAdminClient();

	try {
		// Convert the object to a File instance and wait for it
		// Decode base64 string into a buffer
		const base64Data = file.base64String.split(';base64,').pop() as string;
		const buffer = Buffer.from(base64Data, 'base64');

		// Use buffer with Appwrite (or similar) SDK
		const inputFile = InputFile.fromBuffer(buffer, file.fileName);

		// Upload the file to Appwrite storage
		const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile);

		// Create metadata document for the file
		const fileDocument = {
			type: getFileType(bucketFile.name).type,
			name: bucketFile.name,
			url: constructFileUrl(bucketFile.$id),
			extension: getFileType(bucketFile.name).extension,
			size: bucketFile.sizeOriginal,
			owner: ownerId,
			accountId,
			users: [],
			bucketFileId: bucketFile.$id
		};

		// Store metadata in the database
		const newFile = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, ID.unique(), fileDocument);

		revalidatePath(path); // Optional, for cache revalidation
		return JSON.parse(JSON.stringify(newFile)); // Ensure proper serialization
	} catch (error) {
		handleError(error, 'Failed to upload file');
	}
};

export const getFiles = async ({ types = [], searchText = '', sort = '$createdAt-desc', limit }: GetFilesProps) => {
	const { databases } = await createAdminClient();
	// get files for all the files which the current user have access to
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser) {
			throw new Error('User not found !');
		}
		const queries = createQueries(currentUser, types, searchText, sort, limit);
		// call to databse
		const files = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, queries);

		return parseStringify(files);
	} catch (error) {
		handleError(error, 'Failed to fetch files !');
	}
};

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
	const { databases } = await createAdminClient();
	console.log({ fileId, name, extension, path });
	try {
		const newName = `${name}.${extension}`;
		const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId, {
			name: newName
		});
		revalidatePath(path);
		return parseStringify(updatedFile);
	} catch (error) {
		handleError(error, 'Failed to rename file');
	}
};

export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
	const { databases } = await createAdminClient();
	try {
		const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId, {
			users: emails
		});
		revalidatePath(path);
		console.log(updatedFile);
		return parseStringify(updatedFile);
	} catch (error) {
		handleError(error, 'Failed to rename file');
	}
};

export const deleteFile = async ({ fileId, bucketFileId, path }: DeleteFileProps) => {
	const { databases, storage } = await createAdminClient();
	try {
		const deletedFile = await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId);
		revalidatePath(path);
		console.log(deletedFile);
		if (deletedFile) {
			await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
		}
		return parseStringify({ status: 'success' });
	} catch (error) {
		handleError(error, 'Failed to rename file');
	}
};
