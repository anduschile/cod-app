/**
 * ESTE MÓDULO ESTÁ PREPARADO PARA UNA FUTURA INTEGRACIÓN CON SHOPIFY.
 * EN LA FASE DE MVP (VERSIÓN 1), NO SE REALIZA NINGÚN FETCH A LA API REAL.
 * 
 * Propósito: 
 * Mantener la arquitectura lista para sincronizar automáticamente el 
 * "Orders Manual Hub" con los pedidos entrantes de Shopify.
 */

export interface ShopifyOrder {
    id: number;
    name: string;
    email: string | null;
    created_at: string;
    total_price: string;
    currency: string;
    financial_status: string | null;
    fulfillment_status: string | null;
    shipping_address: {
        first_name: string;
        last_name: string;
        address1: string;
        city: string;
        province: string;
        country: string;
        zip: string;
        phone: string;
    } | null;
    line_items: Array<{
        id: number;
        title: string;
        quantity: number;
        price: string;
        sku: string;
    }>;
}

// Ejemplo de función (dummy) que se implementaría a futuro
export async function syncShopifyOrders(): Promise<ShopifyOrder[]> {
    // TODO: Implementar lógica de autenticación y fetch API GraphQL/REST de Shopify
    console.log("Mock: Syncing Shopify Orders...");
    return [];
}
