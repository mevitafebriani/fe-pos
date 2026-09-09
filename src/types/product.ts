export interface Product {
    id: number,
    product_category_id: number,
    image?: string | null,
    name: string,
    price: number,
    stock: number,
    category?: {
        id: number,
        name: string
    } | null
}
