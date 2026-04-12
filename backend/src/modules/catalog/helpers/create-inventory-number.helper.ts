function buildCategoryCode(categoryName: string): string {
  return categoryName.trim().replace(/\s+/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
}

function buildBookCode(bookId: string): string {
  return bookId.replace(/-/g, '').slice(0, 5).toUpperCase();
}

function buildCopyCode(copyNumber: number): string {
  return String(copyNumber).padStart(3, '0');
}

export function createInventoryNumber(
  categoryName: string,
  year: number,
  bookId: string,
  copyNumber: number,
): string {
  return `${buildCategoryCode(categoryName)}-${year}-${buildBookCode(bookId)}-${buildCopyCode(copyNumber)}`;
}
