import React, { useState } from 'react';

// Se ha consolidado la lista de productos y precios de los archivos CSV.
// NOTA: Se ha tomado como referencia principal el archivo "FORMATO PEDIDO.csv".
const PRODUCT_DATA = [
  { cod: 'NC16', description: 'SH.COLOR PROTECT BEIGE PERLA', unitPrice: 11300 },
  { cod: 'NC18', description: 'SH.COLOR PROTECT CHOCOLATE LIGTH', unitPrice: 11300 },
  { cod: 'NC12', description: 'SH.COLOR PROTECT GRIS SILVER', unitPrice: 11300 },
  { cod: 'NC14', description: 'SH.COLOR PROTECT NEGRO NIGHT', unitPrice: 11300 },
  { cod: 'NC9', description: 'SH.COLOR PROTECT ROJO INTENSE', unitPrice: 11300 },
  { cod: 'NC10', description: 'SH.COLOR PROTECT VIOLETA ULTRA', unitPrice: 11300 },
  { cod: 'NC15', description: 'MASC. COLOR PROTECT BEIGE PERLA', unitPrice: 11300 },
  { cod: 'NC17', description: 'MASC. COLOR PROTECT CHOCOLATE LIGTH', unitPrice: 11300 },
  { cod: 'NC11', description: 'MASC. COLOR PROTECT GRIS SILVER', unitPrice: 11300 },
  { cod: 'NC13', description: 'MASC. COLOR PROTECT NEGRO NIGHT', unitPrice: 11300 },
  { cod: 'NC24', description: 'MASC. COLOR PROTECT ROJO INTENSE', unitPrice: 11300 },
  { cod: 'NC27', description: 'MASC. COLOR PROTECT VIOLETA ULTRA', unitPrice: 11300 },
  { cod: 'NC3', description: 'SHAMPOO KERA-MILK X 325', unitPrice: 13000 },
  { cod: 'NC4', description: 'TRATAMIENTO KERA-MILK X 325', unitPrice: 12500 },
  { cod: 'NC1', description: 'FLUIDO FIJADOR X 325ML', unitPrice: 8000 },
  { cod: 'NC50', description: 'FAST MEN X160ML', unitPrice: 7800 },
  { cod: 'NC39', description: 'DOY PACK MASC. COLOR BEIGE PERLA X100ML', unitPrice: 4500 },
  { cod: 'NC40', description: 'DOY PACK MASC. COLOR CHOCOLATE X100ML', unitPrice: 4500 },
  { cod: 'NC41', description: 'DOY PACK MASC. COLOR GRIS SILVER X100ML', unitPrice: 4500 },
  { cod: 'NC42', description: 'DOY PACK MASC. COLOR NEGRO NIGHT X100ML', unitPrice: 4500 },
  { cod: 'NC43', description: 'DOY PACK MASC. COLOR ROJO INTENSE X100ML', unitPrice: 4500 },
  { cod: 'NC44', description: 'DOY PACK MASC. COLOR VIOLETA ULTRA X100ML', unitPrice: 4500 },
];

const App = () => {
  // Estado para la información del cliente
  const [clientInfo, setClientInfo] = useState({
    fecha: '',
    nit: '',
    vendedor: '',
    cliente: '',
    telefono: '',
    contado: '',
    credito: '',
    direccion: '',
    ciudad: '',
    listaPrecios: '',
    barrio: '',
    cel: '',
    correo: ''
  });

  // Estado para los productos en el pedido
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [bonus, setBonus] = useState(0);

  // Maneja cambios en los campos de información del cliente
  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  // Maneja la adición de un nuevo producto al pedido
  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const product = PRODUCT_DATA.find(p => p.cod === selectedProduct);
      const newItem = {
        ...product,
        quantity: parseInt(quantity),
        bonus: parseInt(bonus),
        totalValue: product.unitPrice * parseInt(quantity)
      };
      setOrderItems([...orderItems, newItem]);
      setSelectedProduct('');
      setQuantity(0);
      setBonus(0);
    }
  };

  // Maneja la eliminación de un producto del pedido
  const handleRemoveProduct = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  // Función para generar y descargar el archivo CSV
  const handleDownload = () => {
    const csvRows = [];

    // --- Encabezado de la plantilla CSV (según el archivo FORMATO PEDIDO.csv) ---
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(`FECHA: ${clientInfo.fecha},,NIT: ${clientInfo.nit},,,,,NOMBRE VENDEDOR: ${clientInfo.vendedor},,,\n`);
    csvRows.push(`CLIENTE: ${clientInfo.cliente},,TEL: ${clientInfo.telefono},,,,,CONTADO: ${clientInfo.contado} CRÉDITO: ${clientInfo.credito},,,\n`);
    csvRows.push(`DIRECCION: ${clientInfo.direccion},,CIUDAD: ${clientInfo.ciudad},,,,,LISTA PRECIOS: ${clientInfo.listaPrecios},,,\n`);
    csvRows.push(`BARRIO: ${clientInfo.barrio},,CEL: ${clientInfo.cel},,CORREO: ${clientInfo.correo},,,,,,,,,,\n`);
    csvRows.push('CÓDIGO INT.,PRODUCTO,CANT,BONIF,V.U,V.TOTAL,CÓDIGO,PRODUCTO,CANT,BONIF,V.U,V.TOTAL\n');
    
    // Asumimos que los productos se llenan de izquierda a derecha.
    const productsInTwoColumns = orderItems.reduce((acc, current, index) => {
      const colIndex = Math.floor(index / 2);
      if (!acc[colIndex]) acc[colIndex] = [];
      acc[colIndex].push(current);
      return acc;
    }, []);

    // Rellena las filas con los productos del pedido
    for (let i = 0; i < productsInTwoColumns.length; i++) {
      const row = productsInTwoColumns[i];
      const product1 = row[0];
      const product2 = row[1];

      let rowString = '';
      if (product1) {
        rowString += `${product1.cod},"${product1.description}",${product1.quantity},${product1.bonus},${product1.unitPrice},${product1.totalValue}`;
      }
      if (product2) {
        rowString += `,${product2.cod},"${product2.description}",${product2.quantity},${product2.bonus},${product2.unitPrice},${product2.totalValue}`;
      }
      csvRows.push(rowString + '\n');
    }

    const csvContent = csvRows.join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pedido_completado.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Generador de Toma de Pedido</h1>

        {/* Formulario de información del cliente */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Información del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Fecha:</label>
              <input type="date" name="fecha" value={clientInfo.fecha} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">NIT:</label>
              <input type="text" name="nit" value={clientInfo.nit} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Vendedor:</label>
              <input type="text" name="vendedor" value={clientInfo.vendedor} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Cliente:</label>
              <input type="text" name="cliente" value={clientInfo.cliente} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Teléfono:</label>
              <input type="text" name="telefono" value={clientInfo.telefono} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Forma de Pago:</label>
              <div className="flex space-x-4">
                <label className="flex items-center text-gray-700">
                  <input type="radio" name="pago" value="contado" checked={clientInfo.contado === 'X'} onChange={() => setClientInfo({ ...clientInfo, contado: 'X', credito: '' })} className="mr-1" /> Contado
                </label>
                <label className="flex items-center text-gray-700">
                  <input type="radio" name="pago" value="credito" checked={clientInfo.credito === 'X'} onChange={() => setClientInfo({ ...clientInfo, credito: 'X', contado: '' })} className="mr-1" /> Crédito
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Dirección:</label>
              <input type="text" name="direccion" value={clientInfo.direccion} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Ciudad:</label>
              <input type="text" name="ciudad" value={clientInfo.ciudad} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Lista de Precios:</label>
              <input type="text" name="listaPrecios" value={clientInfo.listaPrecios} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Barrio:</label>
              <input type="text" name="barrio" value={clientInfo.barrio} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Celular:</label>
              <input type="text" name="cel" value={clientInfo.cel} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Correo:</label>
              <input type="email" name="correo" value={clientInfo.correo} onChange={handleClientInfoChange} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Sección de agregar productos */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Agregar Productos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Producto:</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecciona un producto</option>
                {PRODUCT_DATA.map(product => (
                  <option key={product.cod} value={product.cod}>{product.cod} - {product.description}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Cantidad:</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Bonificación:</label>
              <input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} min="0" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button onClick={handleAddProduct} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de productos agregados */}
        {orderItems.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Productos en el pedido</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Código</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Descripción</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Cant</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Bonif</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">V.U</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">V.TOTAL</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{item.cod}</td>
                      <td className="py-2 px-4 border-b">{item.description}</td>
                      <td className="py-2 px-4 border-b">{item.quantity}</td>
                      <td className="py-2 px-4 border-b">{item.bonus}</td>
                      <td className="py-2 px-4 border-b">${item.unitPrice.toLocaleString('es-CO')}</td>
                      <td className="py-2 px-4 border-b">${item.totalValue.toLocaleString('es-CO')}</td>
                      <td className="py-2 px-4 border-b">
                        <button onClick={() => handleRemoveProduct(index)} className="text-red-500 hover:text-red-700 font-bold">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botón de descarga */}
        <div className="flex justify-center">
          <button onClick={handleDownload} className="bg-green-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105">
            Descargar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
