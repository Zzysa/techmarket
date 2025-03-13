import pool from "../config/db";

export interface Product {
    id?: number;
    name: string;
    category: string;
    description: string;
    price: number;
    stockCount: number;
    brand: string;
    imageUrl?: string;
    isAvailable: boolean;
    createdAt?: Date;
}

const productModel = {
    async getAll(filters: { sortByPrice?: 'ASC' | 'DESC'; isAvailable?: boolean }) {
        let query = "SELECT * FROM products";
        const values: any[] = [];
    
        if (filters.isAvailable !== undefined) {
            query += " WHERE isAvailable = $1";
            values.push(filters.isAvailable);
        }
    
        if (filters.sortByPrice) {
            query += values.length ? ` ORDER BY price ${filters.sortByPrice}` : ` ORDER BY price ${filters.sortByPrice}`;
        }
    
        const { rows } = await pool.query(query, values);
        return rows;
    },
    
    async getById(id: string) {
        const { rows } = await pool.query("SELECT * FROM products WHERE id = $1;", [id]);
        return rows[0];
    },

    async create(product: Omit<Product, "id">) {
        const { rows } = await pool.query(
            `INSERT INTO products (name, category, description, price, stockCount, brand, imageUrl, isAvailable)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
            [product.name, product.category, product.description, product.price, product.stockCount, product.brand, product.imageUrl, product.isAvailable]
        );
        return rows[0];
    },

    async update(id: string, updates: Partial<Product>) {
        const { name, category, description, price, stockCount, brand, imageUrl, isAvailable } = updates;
      
        const { rows } = await pool.query(
          `UPDATE products 
           SET name = COALESCE($1, name), 
               category = COALESCE($2, category), 
               description = COALESCE($3, description),
               price = COALESCE($4, price), 
               stockCount = COALESCE($5, stockCount),
               brand = COALESCE($6, brand),
               imageUrl = COALESCE($7, imageUrl),
               isAvailable = COALESCE($8, isAvailable)
           WHERE id = $9 
           RETURNING *;`,
          [name, category, description, price, stockCount, brand, imageUrl, isAvailable, id]
        );
      
        return rows[0];
    },

    async delete(id: string) {
        const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1;", [id]);
        return rowCount ? rowCount > 0 : null;
    },
};

export default productModel;
