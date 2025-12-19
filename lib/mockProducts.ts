export type ProductCategory = "Handicrafts" | "Books" | "Electronics Accessories";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  priceInr: number;
  codAvailable: boolean;
  deliveredByIndiaPost: boolean;
  imageSrc: string;
  originCity: string;
};

export const mockProducts: Product[] = [
  {
    id: "hc-raj-001",
    name: "Jaipur Blue Pottery Coaster Set (4 pcs)",
    category: "Handicrafts",
    priceInr: 599,
    codAvailable: true,
    deliveredByIndiaPost: true,
    imageSrc: "/products/blue-pottery.svg",
    originCity: "Jaipur",
  },
  {
    id: "hc-assam-002",
    name: "Assam Handwoven Gamosa (Traditional)",
    category: "Handicrafts",
    priceInr: 749,
    codAvailable: true,
    deliveredByIndiaPost: true,
    imageSrc: "/products/gamosa.svg",
    originCity: "Guwahati",
  },
  {
    id: "bk-ind-003",
    name: "India Post: A Heritage of Service (Paperback)",
    category: "Books",
    priceInr: 349,
    codAvailable: true,
    deliveredByIndiaPost: true,
    imageSrc: "/products/book.svg",
    originCity: "New Delhi",
  },
  {
    id: "bk-tech-004",
    name: "Practical DIGIPIN & Address Intelligence (Guide)",
    category: "Books",
    priceInr: 399,
    codAvailable: false,
    deliveredByIndiaPost: true,
    imageSrc: "/products/book-2.svg",
    originCity: "Hyderabad",
  },
  {
    id: "el-usb-005",
    name: "Braided USB-C Cable (1.5m) — BIS-compliant",
    category: "Electronics Accessories",
    priceInr: 299,
    codAvailable: true,
    deliveredByIndiaPost: true,
    imageSrc: "/products/usb-c.svg",
    originCity: "Bengaluru",
  },
  {
    id: "el-pwr-006",
    name: "Travel Charger 20W (Type-C) — Safety Certified",
    category: "Electronics Accessories",
    priceInr: 899,
    codAvailable: true,
    deliveredByIndiaPost: true,
    imageSrc: "/products/charger.svg",
    originCity: "Pune",
  },
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}
