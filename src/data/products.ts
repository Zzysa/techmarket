const products: {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number;
    stockCount: number;
    brand: string;
    imageUrl: string;
    isAvailable: boolean;
    createdAt: string;
}[] = [
    {
        id: 1,
        name: "MacBook Pro 16",
        category: "Laptopy",
        description: "Laptop Apple z procesorem M1 Pro, 16GB RAM, 512GB SSD",
        price: 9999.99,
        stockCount: 15,
        brand: "Apple",
        imageUrl: "https://example.com/macbook.jpg",
        isAvailable: true,
        createdAt: "2023-01-15T14:30:00Z"
    },
    {
        id: 2,
        name: "Dell XPS 15",
        category: "Laptopy",
        description: "Laptop Dell z procesorem Intel i7, 16GB RAM, 1TB SSD",
        price: 8499.99,
        stockCount: 10,
        brand: "Dell",
        imageUrl: "https://example.com/dellxps.jpg",
        isAvailable: true,
        createdAt: "2023-02-10T10:20:00Z"
    },
    {
        id: 3,
        name: "iPhone 14 Pro",
        category: "Smartfony",
        description: "Smartfon Apple z ekranem 6.1, A16 Bionic, 256GB",
        price: 6299.99,
        stockCount: 25,
        brand: "Apple",
        imageUrl: "https://example.com/iphone14pro.jpg",
        isAvailable: true,
        createdAt: "2023-03-05T08:15:00Z"
    },
    {
        id: 4,
        name: "Samsung Galaxy S23 Ultra",
        category: "Smartfony",
        description: "Smartfon Samsung z ekranem 6.8, Snapdragon 8 Gen 2, 512GB",
        price: 7199.99,
        stockCount: 12,
        brand: "Samsung",
        imageUrl: "https://example.com/galaxys23ultra.jpg",
        isAvailable: true,
        createdAt: "2023-04-12T12:45:00Z"
    },
    {
        id: 5,
        name: "Sony WH-1000XM5",
        category: "Słuchawki",
        description: "Bezprzewodowe słuchawki Sony z ANC, 30h pracy na baterii",
        price: 1799.99,
        stockCount: 30,
        brand: "Sony",
        imageUrl: "https://example.com/sonywh1000xm5.jpg",
        isAvailable: true,
        createdAt: "2023-05-20T15:00:00Z"
    }
];

export default products;
