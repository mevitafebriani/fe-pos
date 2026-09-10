export interface TransactionItem {
    id: number;
    transaction_id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product?: {
        id: number;
        name: string;
    };
}

export interface Transaction {
    id: number;
    code: string;
    customer_id: number;
    subtotal: number;
    tax: number;
    total: number;
    created_at?: string;
    updated_at?: string;
    customer?: {
        id: number;
        name: string;
        phone: string;
    } | null;
    items?: TransactionItem[];
}
