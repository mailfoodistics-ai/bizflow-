import { useState, createContext, useContext, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image?: string;
}

export interface InvoiceItem {
  product: Product;
  quantity: number;
}

export interface Invoice {
  id: string;
  number: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customer?: Customer;
  date: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchases: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  gstNumber: string;
  upiId: string;
  invoicePrefix: string;
}

// Sample data
export const sampleProducts: Product[] = [
  { id: "1", name: "Milk (1L)", category: "Dairy", price: 60, stock: 50, barcode: "100001" },
  { id: "2", name: "Bread", category: "Bakery", price: 40, stock: 30, barcode: "100002" },
  { id: "3", name: "Rice (5kg)", category: "Grains", price: 350, stock: 25, barcode: "100003" },
  { id: "4", name: "Sugar (1kg)", category: "Grocery", price: 45, stock: 60, barcode: "100004" },
  { id: "5", name: "Tea (250g)", category: "Beverages", price: 120, stock: 40, barcode: "100005" },
  { id: "6", name: "Cooking Oil (1L)", category: "Grocery", price: 180, stock: 20, barcode: "100006" },
  { id: "7", name: "Eggs (12pc)", category: "Dairy", price: 80, stock: 35, barcode: "100007" },
  { id: "8", name: "Butter (500g)", category: "Dairy", price: 270, stock: 15, barcode: "100008" },
  { id: "9", name: "Biscuits", category: "Snacks", price: 30, stock: 80, barcode: "100009" },
  { id: "10", name: "Chips", category: "Snacks", price: 20, stock: 100, barcode: "100010" },
  { id: "11", name: "Soap", category: "Personal Care", price: 45, stock: 55, barcode: "100011" },
  { id: "12", name: "Shampoo", category: "Personal Care", price: 180, stock: 25, barcode: "100012" },
  { id: "13", name: "Dal (1kg)", category: "Grains", price: 130, stock: 40, barcode: "100013" },
  { id: "14", name: "Flour (5kg)", category: "Grains", price: 220, stock: 30, barcode: "100014" },
  { id: "15", name: "Coffee (100g)", category: "Beverages", price: 150, stock: 20, barcode: "100015" },
  { id: "16", name: "Curd (400g)", category: "Dairy", price: 35, stock: 45, barcode: "100016" },
];

export const sampleCustomers: Customer[] = [
  { id: "1", name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@email.com", totalPurchases: 12450 },
  { id: "2", name: "Priya Sharma", phone: "9876543211", email: "priya@email.com", totalPurchases: 8300 },
  { id: "3", name: "Amit Patel", phone: "9876543212", email: "amit@email.com", totalPurchases: 15600 },
  { id: "4", name: "Sunita Devi", phone: "9876543213", email: "sunita@email.com", totalPurchases: 4200 },
];

export const sampleInvoices: Invoice[] = [
  {
    id: "1", number: "INV-001",
    items: [
      { product: sampleProducts[0], quantity: 2 },
      { product: sampleProducts[1], quantity: 1 },
    ],
    subtotal: 160, tax: 8, discount: 0, total: 168,
    paymentMethod: "Cash", customer: sampleCustomers[0],
    date: new Date(2026, 2, 17, 9, 30),
  },
  {
    id: "2", number: "INV-002",
    items: [
      { product: sampleProducts[2], quantity: 1 },
      { product: sampleProducts[4], quantity: 2 },
    ],
    subtotal: 590, tax: 29.5, discount: 20, total: 599.5,
    paymentMethod: "UPI", customer: sampleCustomers[1],
    date: new Date(2026, 2, 17, 10, 15),
  },
  {
    id: "3", number: "INV-003",
    items: [
      { product: sampleProducts[5], quantity: 2 },
      { product: sampleProducts[6], quantity: 1 },
      { product: sampleProducts[8], quantity: 3 },
    ],
    subtotal: 530, tax: 26.5, discount: 0, total: 556.5,
    paymentMethod: "Card", customer: sampleCustomers[2],
    date: new Date(2026, 2, 17, 11, 0),
  },
];

export const defaultStoreSettings: StoreSettings = {
  name: "QuickMart Store",
  address: "123 Market Road, New Delhi",
  phone: "9876543200",
  gstNumber: "07AAACR5055K1Z5",
  upiId: "quickmart@upi",
  invoicePrefix: "INV",
};
