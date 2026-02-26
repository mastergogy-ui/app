export type Ad = {
  _id: string;
  title: string;
  description: string;
  category: 'Rent a Friend' | 'Rent a Bike' | 'Rent a Car' | 'Rent a Property';
  price: number;
  images: string[];
  location: { city?: string; state?: string; country?: string; coordinates?: { lat?: number; lng?: number } };
  user: { _id: string; name: string; profileImage?: string; email?: string; phone?: string };
  createdAt: string;
};
