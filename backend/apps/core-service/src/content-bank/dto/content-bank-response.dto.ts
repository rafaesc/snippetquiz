export class ContentBankResponseDto {
  id: string; // BigInt as string
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  entryCount?: number;
}

export class PaginatedContentBanksResponseDto {
  contentBanks: ContentBankResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
