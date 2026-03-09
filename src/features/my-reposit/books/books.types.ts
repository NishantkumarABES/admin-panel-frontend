export type BookStatus = "pending" | "approved" | "rejected" | "in_review";

export type BookType = "textbook" | "handbook" | "guideline" | "review";

export type AccessLevel = "public" | "institutional" | "physicians" | "private";

export type CopyrightStatus = "open" | "author" | "institutional" | "publisher" | "fair_use";

export interface Book {
    id: string;
    uploaded_by: string;
    title: string;
    authors: string;
    publisher: string;
    edition: string;
    publication_year: number;
    isbn: string;
    speciality: string | null;
    book_type: BookType;
    description: string;
    rating: string;
    views: number;
    downloads: number;
    status: BookStatus;
    rejection_reason: string | null;
    is_editor_curated: boolean;
    access_level: AccessLevel;
    copyright_status: CopyrightStatus;
    price: number;
    file_url: string | null;
    book_cover: string | null;
    collections: string[];
    is_deleted: boolean;
    created_at: string;
}

export interface BookFilters {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    speciality?: string;
    book_type?: BookType;
    status?: BookStatus;
}

export interface ReviewBookDTO {
    status: "approved" | "rejected" | "in_review";
    rejection_reason?: string;
}

export interface BookAnalytics {
    total_books: number;
    approved_books: number;
    pending_books: number;
    in_review_books: number;
    rejected_books: number;
}

export interface CreateBookDTO {
    user_id: string;
    title: string;
    authors: string;
    publisher: string;
    edition: string;
    publication_year: number;
    isbn: string;
    speciality: string;
    book_type: BookType;
    access_level: AccessLevel;
    copyright_status: CopyrightStatus;
    description: string;
    price: number;
    book_file?: File;
    book_cover?: File;
}

export interface UpdateBookDTO {
    title?: string;
    authors?: string;
    publisher?: string;
    edition?: string;
    publication_year?: number;
    isbn?: string;
    speciality?: string;
    book_type?: BookType;
    access_level?: AccessLevel;
    copyright_status?: CopyrightStatus;
    description?: string;
    price?: number;
    book_file?: File;
    book_cover?: File;
}

export const BOOK_TYPES: { value: BookType; label: string }[] = [
    { value: "textbook", label: "Textbook" },
    { value: "handbook", label: "Handbook" },
    { value: "guideline", label: "Guideline" },
    { value: "review", label: "Review" },
];

export const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
    { value: "public", label: "Public" },
    { value: "institutional", label: "Institutional" },
    { value: "physicians", label: "Verified Physicians" },
    { value: "private", label: "Private" },
];

export const COPYRIGHT_STATUSES: { value: CopyrightStatus; label: string }[] = [
    { value: "open", label: "Open Access / Public Domain" },
    { value: "author", label: "Author Owned" },
    { value: "institutional", label: "Institutional License" },
    { value: "publisher", label: "Publisher Authorization" },
    { value: "fair_use", label: "Educational Fair Use" },
];


export type PurchaseStatus = "paid" | "pending_payment";
export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";


export interface BookPurchase {
    id: string;
    buyer_name: string;
    buyer_email: string;
    book_title: string;
    book_author: string;
    amount: number;
    payment_method: PaymentMethod;
    transaction_id: string | null;
    purchase_date: string;
    order_status: PurchaseStatus;
}

export interface BookPurchaseFilters {
    page?: number;
    page_size?: number;
    search?: string;
    order_status?: PurchaseStatus;
    payment_method?: PaymentMethod;
}

export interface BookPurchaseStats {
    totalRevenue: number;
    totalPurchases: number;
    activeBuyers: number;
    avgOrderValue: number;
    refundRequests: number;
}


// ─── Mock Data ───────────────────────────────────────────────────────────
export const MOCK_PURCHASES: BookPurchase[] = [
    {
        id: "p1",
        buyer_name: "Ankit Sharma",
        buyer_email: "ankit.sharma@hospital.in",
        book_title: "Harrison's Principles of Internal Medicine",
        book_author: "J. Larry Jameson",
        amount: 1499,
        payment_method: "upi",
        transaction_id: "TXN20260201A1",
        purchase_date: "2026-02-17T10:30:00Z",
        order_status: "paid",
    },
    {
        id: "p2",
        buyer_name: "Priya Menon",
        buyer_email: "priya.menon@clinic.in",
        book_title: "Robbins & Cotran Pathologic Basis of Disease",
        book_author: "Vinay Kumar",
        amount: 1250,
        payment_method: "card",
        transaction_id: "TXN20260201B2",
        purchase_date: "2026-02-17T14:20:00Z",
        order_status: "paid",
    },
    {
        id: "p3",
        buyer_name: "R. Iyer",
        buyer_email: "r.iyer@medcenter.in",
        book_title: "Guyton and Hall Textbook of Medical Physiology",
        book_author: "John E. Hall",
        amount: 899,
        payment_method: "netbanking",
        transaction_id: null,
        purchase_date: "2026-02-16T09:15:00Z",
        order_status: "pending_payment",
    },
];