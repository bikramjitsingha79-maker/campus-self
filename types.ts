
export enum BookCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export enum UserRole {
  STUDENT = 'Student (Donor/Borrower)',
  INSTITUTION = 'Institution Partner'
}

export enum Language {
  ENGLISH = 'English',
  BENGALI = 'Bengali',
  HINDI = 'Hindi',
  GUJARATI = 'Gujarati',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu'
}

export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  role: UserRole;
  donationScore: number;
  campusCoins: number;
  phoneNumber?: string;
  altPhoneNumber?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  condition: BookCondition;
  isUrgent: boolean;
  isInstitutionDonated: boolean;
  donorId: string;
  college: string;
  branch: string; 
  location: string;
  area: string; // New field
  phoneNumber: string; // New field
  contactNumber: string; // New field
  altContactNumber: string; // New field
  pickupDate?: string;
  pickupTime?: string;
  imageUrl?: string;
  marketPrice?: number;
  currentPrice?: number;
}

export interface BookRequest {
  id: string;
  bookId: string;
  borrowerId: string;
  donorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: Date;
  preferredDeliveryDate?: string;
  preferredDeliveryTime?: string;
  borrowerContact?: string;
  borrowerAltContact?: string;
}

export type ThemePalette = 'CLASSIC' | 'CYBERPUNK' | 'OCEAN' | 'MIDNIGHT';
export type Segment = 'BUYER' | 'SELLER' | 'LIBRARY';
export type ViewState = 'LOGIN' | 'EXPLORE' | 'MY_REQUESTS' | 'MY_LISTINGS' | 'PROFILE' | 'ADD_BOOK' | 'FEEDBACK' | 'SETTINGS' | 'LANGUAGE_PICKER' | 'AI_SUGGEST' | 'BOOK_PREVIEW' | 'E_BOOKS' | 'CAMPUS_HUB' | 'CAMPUS_COIN' | 'AI_ASSISTANT';
