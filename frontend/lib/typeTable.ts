export type BookItem = {
  id: string;
  title: string;
  subtitle?: string;
  authors?: AuthorItem[];
  coverImageUrl: string;
  category?: CategoryItem;
  isbn: string;
  language: string;
  publicationYear: number;
  description: string;
  copiesCount: number;
  availableCopiesCount: number;
  rating: number;
  reviewsCount: number;
  reviews?: ReviewsItem[];
};

export type AuthorItem = {
  id: string;
  firstName: string;
  lastName: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  description: string;
};

export type UserItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

export type BorrowingsItem = {
  id: string;
  bookId: string;
  status: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  bookTitle: string;
  inventoryNumber: string;
  bookCopyStatus: string;

  book?: BookItem;
};

export type ReviewsItem = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  bookId: string;
}

export type AuthResponse = {
  accessToken: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
};

export type MeResponse = {
  userId: string;
  role: string;
  jti: string;
};