import { CurrencyCode } from "./constants";

// The Database Shape
export interface ProductType {
  _id: string;
  title: string;
  description: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  category: string;
  fileUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// The Cart Shape (A lightweight subset of Product)
export type CartItemType = Pick<ProductType, '_id' | 'title' | 'priceNGN' | 'priceUSD' | 'image' | 'fileUrl'> & {
  quantity?: number;
};

// The Daily Drop Shape
export interface DailyDropType {
  audioUrl: string;
  title?: string;
  transcript?: string;
  date: string;
}