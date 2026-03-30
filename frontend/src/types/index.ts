// Types pour TogoEvents - Inspiré de Tikerama

export interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: Category;
  organizer: Organizer;
  venue: Venue;
  start_date: string;
  end_date: string;
  is_free: boolean;
  min_price: number;
  max_price: number;
  cover_image: string;
  is_featured: boolean;
  is_promo?: boolean;
  is_sold_out?: boolean;
  is_early_bird?: boolean;
  total_capacity?: number;
  sold_tickets?: number;
  interested_count?: number;
  ticket_types?: TicketType[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color?: string;
}

export interface Organizer {
  id: string;
  company_name: string;
  is_verified: boolean;
  rating: number;
  description?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: City;
  capacity: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  totalAvailable: number;
  totalSold: number;
  isOnSale: boolean;
  saleStartDate: string;
  saleEndDate: string;
  priority: number; // Pour ordonner (T-Money prioritaire)
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  whatsapp?: string;
  is_organizer?: boolean;
  is_verified?: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  qr_code: string;
  ticket_type: TicketType;
  event: Event;
  purchase: TicketPurchase;
  status: 'valid' | 'used' | 'expired';
  created_at: string;
}

export interface TicketPurchase {
  id: string;
  user: User;
  event: Event;
  tickets: Ticket[];
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'card' | 'bank_transfer';
  provider: 'tmoney' | 'flooz' | 'wave' | 'orange_money' | 'mtn_momo' | 'visa' | 'mastercard';
  icon: string;
  is_active: boolean;
  priority: number; // Pour ordonner (T-Money prioritaire)
}

export interface RetailPoint {
  id: string;
  name: string;
  address: string;
  city: City;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone: string;
  whatsapp?: string;
  opening_hours: string;
}

export interface Subscription {
  id: string;
  user: User;
  organizer: Organizer;
  created_at: string;
  is_active: boolean;
}

export interface EventFilter {
  category?: string;
  city?: string;
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
  price_range?: {
    min: number;
    max: number;
  };
  is_free?: boolean;
  is_featured?: boolean;
}

export interface ApiResponse<T> {
  count: number;
  results: T[];
  next?: string;
  previous?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Types pour le panier
export interface CartItem {
  event: Event;
  ticket_type: TicketType;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
  currency: string;
}

// Types pour le paiement
export interface PaymentRequest {
  event_id: string;
  ticket_types: {
    ticket_type_id: string;
    quantity: number;
  }[];
  payment_method: string;
  user_info: {
    first_name: string;
    last_name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
  };
}

export interface PaymentResponse {
  payment_id: string;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  payment_method: string;
  message: string;
  redirect_url?: string;
}

// Types pour la recherche
export interface SearchRequest {
  query: string;
  filters?: EventFilter;
  sort_by?: 'date' | 'price' | 'popularity' | 'relevance';
  order?: 'asc' | 'desc';
}

export interface SearchResult {
  events: Event[];
  total: number;
  query: string;
  suggestions?: string[];
}
