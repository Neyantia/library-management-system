export type SanitizedCreateBookData = {
  sanitizedTitle: string;
  sanitizedSubtitle?: string;
  sanitizedDescription?: string;
  sanitizedLanguage: string;
  sanitizedCoverImageUrl?: string;
  sanitizedIsbn: string;
  publicationYear: number;
};
