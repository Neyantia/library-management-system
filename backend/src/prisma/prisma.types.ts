import { $Enums, PrismaClient } from '../../generated/prisma/client.js';

export { PrismaClient };

export const Role = $Enums.Role;
export type Role = $Enums.Role;

export const BookStatus = $Enums.BookStatus;
export type BookStatus = $Enums.BookStatus;

export const BorrowingStatus = $Enums.BorrowingStatus;
export type BorrowingStatus = $Enums.BorrowingStatus;
