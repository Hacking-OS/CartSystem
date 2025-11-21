// API Data Transfer Objects (DTOs) for type safety across the application

// User DTOs
export interface UserSignupDTO {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface UserLoginDTO {
  email: string;
  token: string;
  userRole: string;
  userId: number;
  refreshToken: string;
  userName: string;
  userStatus: number;
}

export interface UserSignupResponseDTO {
  message: string;
}

export interface UserInfoDTO {
  id: number;
  email: string;
  name: string;
  phone: string;
}

export interface EmailValidationResponseDTO {
  recieved?: UserInfoDTO[];
  message?: string;
}

export interface PasswordRecoveryResponseDTO {
  message: string;
}

// Cart DTOs
export interface CartItemDTO {
  id: number;
  userId: number;
  productId: number;
  productPrice: number;
  quantity?: number;
  product?: ProductDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponseDTO {
  cart?: CartItemDTO[];
  message?: string;
}

// For checkout - cart items as array of objects
export type CartItemsArray = Array<{
  id: number;
  productId: number;
  productPrice: number;
  quantity?: number;
  [key: string]: unknown;
}>;

// Product DTOs
export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  status: number;
  image?: string;
  category?: string | null; // Backend returns category name as string, not CategoryDTO
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductResponseDTO {
  products?: ProductDTO[];
  message?: string;
}

// Category DTOs
export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryResponseDTO {
  categories?: CategoryDTO[];
  message?: string;
}

// Checkout DTOs
export interface CheckoutResponseDTO {
  message: string;
  orderId?: number;
  billId?: number;
}

// Bill DTOs
export interface BillDTO {
  id?: number;
  uuid?: string;
  userId?: number | string;
  totalAmount?: number;
  total?: number;
  status?: string;
  paymentMethod?: string;
  email?: string;
  name?: string;
  phone?: string;
  createdAt?: string;
  items?: BillItemDTO[];
}

export interface BillItemDTO {
  id: number;
  billId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: ProductDTO;
}

export interface BillResponseDTO {
  bills?: BillDTO[];
  message?: string;
}

// Generic API Response DTO
export interface ApiResponseDTO<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  success?: boolean;
}

// Cart Item with Product Details (from backend)
export interface CartItemWithProductDTO {
  cartId: number;
  user_id: number;
  total: number;
  quantity: number;
  id: number;
  name: string;
  price: number;
  description?: string;
  categoryId: number;
  category?: string;
  status: number;
}

export interface CheckoutCartResponseDTO {
  result: CartItemWithProductDTO[];
  resultPriceTotal: number;
}

