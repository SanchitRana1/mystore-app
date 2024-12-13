import { Models } from 'node-appwrite';
import React from 'react';

/* eslint-disable no-unused-vars */
export interface FileWithPath extends File {
	path: string;
}

export interface FileObject {
	base64String: string;
	fileName: string;
	fileType: string;
}

export interface UploadFileProps {
	file: FileObject; // Accepts both File and Blob types
	ownerId: string;
	accountId: string;
	path: string;
}

/* eslint-disable no-unused-vars */

declare type FileType = 'document' | 'image' | 'video' | 'audio' | 'other';

declare interface ActionType {
	label: string;
	icon: string;
	value: string;
}

declare interface SearchParamProps {
	// eslint-disable-next-line no-undef
	params?: Promise<SegmentParams>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface GetFilesProps {
	types: FileType[];
	searchText?: string;
	sort?: string;
	limit?: number;
}
declare interface RenameFileProps {
	fileId: string;
	name: string;
	extension: string;
	path: string;
}
declare interface UpdateFileUsersProps {
	fileId: string;
	emails: string[];
	path: string;
}
declare interface DeleteFileProps {
	fileId: string;
	bucketFileId: string;
	path: string;
}

declare interface FileUploaderProps {
	ownerId: string;
	accountId: string;
	className?: string;
}

declare interface MobileNavigationProps {
	ownerId: string;
	accountId: string;
	fullName: string;
	avatar: string;
	email: string;
}
declare interface SidebarProps {
	fullName: string;
	avatar: string;
	email: string;
}

declare interface ThumbnailProps {
	type: string;
	extension: string;
	url: string;
	className?: string;
	imageClassName?: string;
}

declare interface ShareInputProps {
	file: Models.Document;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemove: (email: string) => void;
}
