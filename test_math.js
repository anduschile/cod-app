require('dotenv').config({path: '.env.local'}); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); async function run() { 
const data = [
  {
    \
id\: \7bb07aff-4e3b-4903-ad19-0d5bf0cf4be7\,
    \product_id\: \9e413d59-57d9-4a89-8209-383a044990b8\,
    \estado\: \cobrado\,
    \precio_venta_unidad\: 7900,
    \cantidad\: 1,
    \costo_producto_unidad\: 0,
    \costo_envio\: 0,
    \costo_recaudo\: 0,
    \codpi_products\: {
      \id\: \9e413d59-57d9-4a89-8209-383a044990b8\,
      \nombre\: \Picadora
Electrica
Dos
Velocidades\,
      \costo_embalaje\: 0,
      \costo_producto\: 7990,
      \comision_pasarela\: 0,
      \costo_envio_estimado\: 7500,
      \costo_recaudo_estimado\: 0
    }
  }
];

let ingresosCobrados = 0;
let costoMercaderiaVendida = 0;
let despachosTotales = 0;
let costoCodTotal = 0;
let comisionesTotales = 0;

data.forEach(o => {
    const product = o.codpi_products;
    const isMissingOrZero = (val) => val === null || val === undefined || val === 0;
    const cantidad = o.cantidad || 1;
    
    const costoProveedorUnidad = !isMissingOrZero(o.costo_producto_unidad) ? Number(o.costo_producto_unidad) : (!isMissingOrZero(product?.costo_producto) ? Number(product.costo_producto) : 0);
    const costoEnvio = !isMissingOrZero(o.costo_envio) ? Number(o.costo_envio) : (!isMissingOrZero(product?.costo_envio_estimado) ? Number(product.costo_envio_estimado) : 0);
    
    const costoCod = !isMissingOrZero(o.costo_recaudo) ? Number(o.costo_recaudo) : (!isMissingOrZero(product?.costo_recaudo_estimado) ? Number(product.costo_recaudo_estimado) : 0);
    
    const costoEmbalaje = !isMissingOrZero(product?.costo_embalaje) ? Number(product.costo_embalaje) : 0;
    const comisionPasarela = !isMissingOrZero(product?.comision_pasarela) ? Number(product.comision_pasarela) : 0;

    if (o.estado === 'cobrado') {
        ingresosCobrados += (!isMissingOrZero(o.precio_venta_unidad) ? Number(o.precio_venta_unidad) : 0) * cantidad;
        costoMercaderiaVendida += costoProveedorUnidad * cantidad;
        despachosTotales += costoEnvio;
        costoCodTotal += costoCod * cantidad;
        comisionesTotales += (comisionPasarela + costoEmbalaje) * cantidad;
    }
});

console.log('Ingresos:', ingresosCobrados);
console.log('CMV:', costoMercaderiaVendida);
console.log('Despachos:', despachosTotales);
console.log('Comisiones/COD:', comisionesTotales + costoCodTotal);

const utilidadBruta = ingresosCobrados - costoMercaderiaVendida - despachosTotales - comisionesTotales - costoCodTotal;
console.log('Utilidad Bruta:', utilidadBruta);
} run();
