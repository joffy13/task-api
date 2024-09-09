export abstract class ListResultType<T> {
  entities: T[];
  pagination: PaginationResultType;
}

export abstract class PaginationResultType {
  page: number | 1;
  perPage: number | 10;
  totalPages: number | 0;
  totalItems: number | 0;
}
