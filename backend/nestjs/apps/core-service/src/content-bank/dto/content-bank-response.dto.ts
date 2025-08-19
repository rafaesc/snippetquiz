export class ContentBankResponseDto {
  id: number; // BigInt as string
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  entry_count?: number;
}

export class PaginatedContentBanksResponseDto {
  content_banks: ContentBankResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
