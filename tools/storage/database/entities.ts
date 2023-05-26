export interface ProductEntity {
  id: string;
  manufacturer: string;
  name: string;
  description: string;
  image: string;
  owned: 0 | 1;
  wishlisted: 0 | 1;
}
