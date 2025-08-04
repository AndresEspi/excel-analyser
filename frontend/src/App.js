import React, { useState, useEffect } from 'react';

// Define la URL base de tu backend desplegado en Render
const API_BASE_URL = 'https://excel-analyser-backend.onrender.com';

// Datos de productos consolidados de los archivos CSV.
// ¡ADVERTENCIA! Si faltan productos, por favor, dime cuáles son para agregarlos aquí.
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

// Componente para la funcionalidad de Analizar Excel
const ExcelAnalyser = ({ onReturnToMenu }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'text/csv') {
        setSelectedFile(file);
        setMessage(`Archivo seleccionado: ${file.name}`);
        setFileUploaded(false);
        setAnswer('');
      } else {
        setSelectedFile(null);
        setMessage('Por favor, sube un archivo Excel o CSV válido (.xlsx, .xls o .csv).');
        setFileUploaded(false);
        setAnswer('');
      }
    } else {
      setSelectedFile(null);
      setMessage('');
      setFileUploaded(false);
      setAnswer('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecciona un archivo primero.');
      return;
    }

    setMessage('Subiendo archivo...');
    setLoadingAnswer(true);
    
    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, { 
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`"${selectedFile.name}" subido y procesado con éxito. Columnas: ${data.columns.join(', ')}. Filas: ${data.rows_count}`);
        setFileUploaded(true);
        setAnswer('');
      } else {
        const errorData = await response.json();
        setMessage(`Error al subir el archivo: ${errorData.error}`);
        setFileUploaded(false);
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setMessage('Hubo un problema de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
      setFileUploaded(false);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setAnswer('Por favor, escribe una pregunta.');
      return;
    }
    if (!fileUploaded) {
      setAnswer('Por favor, sube un archivo Excel primero para hacer preguntas.');
      return;
    }

    setLoadingAnswer(true);
    setAnswer('Obteniendo respuesta...');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
      } else {
        const errorData = await response.json();
        setAnswer(`Error al obtener respuesta: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al enviar la pregunta:', error);
      setAnswer('Hubo un problema de conexión al intentar obtener la respuesta.');
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Analizador de Archivos Excel
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Sube tu archivo .xlsx, .xls o .csv para empezar a analizar tus datos.
      </p>

      {/* Sección de Subida de Archivos */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar archivo Excel/CSV:
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {message && (
          <p className={`text-sm mt-4 text-center ${fileUploaded ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <button
          onClick={handleFileUpload}
          disabled={!selectedFile || loadingAnswer}
          className={`w-full mt-4 py-3 px-4 rounded-lg text-white font-semibold
                       transition duration-300 ease-in-out
                       ${(!selectedFile || loadingAnswer)
                         ? 'bg-gray-400 cursor-not-allowed'
                         : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                       }`}
        >
          {loadingAnswer && !fileUploaded ? 'Subiendo...' : 'Subir y Analizar Archivo'}
        </button>
      </div>

      {/* Sección de Preguntas y Respuestas */}
      {fileUploaded && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Haz una Pregunta sobre los Datos
          </h2>
          <div className="mb-4">
            <label htmlFor="question-input" className="block text-sm font-medium text-gray-700 mb-2">
              Tu pregunta:
            </label>
            <textarea
              id="question-input"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
              rows="3"
              placeholder="Ej: ¿Cuántos clientes hay en Bogotá?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loadingAnswer}
            ></textarea>
          </div>
          <button
            onClick={handleAskQuestion}
            disabled={loadingAnswer || !question.trim()}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold
                         transition duration-300 ease-in-out
                         ${(loadingAnswer || !question.trim())
                           ? 'bg-gray-400 cursor-not-allowed'
                           : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                         }`}
          >
            {loadingAnswer ? 'Procesando...' : 'Obtener Respuesta'}
          </button>

          {answer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Respuesta:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
      )}
      <button onClick={onReturnToMenu} className="mt-6 w-full py-3 px-4 rounded-lg text-white font-semibold bg-gray-500 hover:bg-gray-600 transition duration-300 ease-in-out">
        Regresar al Menú
      </button>
    </div>
  );
};

// Componente para la funcionalidad de Llenado de Toma de Pedido
const PedidoForm = ({ onReturnToMenu }) => {
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
    descuento: '0', // Valor inicial de descuento
    barrio: '',
    cel: '',
    correo: ''
  });

  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [bonus, setBonus] = useState(0);

  const [subtotal, setSubtotal] = useState(0);
  const [descuentoCalculado, setDescuentoCalculado] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);

  // Hook para recalcular los valores cada vez que el pedido o el descuento cambian
  useEffect(() => {
    const newSubtotal = orderItems.reduce((sum, item) => sum + item.totalValue, 0);
    const newDescuento = newSubtotal * (parseFloat(clientInfo.descuento) / 100);
    const newIva = newSubtotal * 0.19;
    const newTotal = newSubtotal + newIva - newDescuento;

    setSubtotal(newSubtotal);
    setDescuentoCalculado(newDescuento);
    setIva(newIva);
    setTotal(newTotal);
  }, [orderItems, clientInfo.descuento]);

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

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

  const handleRemoveProduct = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleDownload = () => {
    const csvRows = [];

    // --- Plantilla del encabezado CSV (hardcodeada en el frontend) ---
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(`FECHA: ${clientInfo.fecha},,NIT: ${clientInfo.nit},,,,,NOMBRE VENDEDOR: ${clientInfo.vendedor},,,\n`);
    csvRows.push(`CLIENTE: ${clientInfo.cliente},,TEL: ${clientInfo.telefono},,,,,CONTADO: ${clientInfo.contado} CRÉDITO: ${clientInfo.credito},,,\n`);
    csvRows.push(`DIRECCION: ${clientInfo.direccion},,CIUDAD: ${clientInfo.ciudad},,,,,% DESCUENTO: ${clientInfo.descuento},,,\n`);
    csvRows.push(`BARRIO: ${clientInfo.barrio},,CEL: ${clientInfo.cel},,CORREO: ${clientInfo.correo},,,,,,,,,,\n`);
    csvRows.push('CÓDIGO INT.,PRODUCTO,CANT,BONIF,V.U,V.TOTAL,CÓDIGO,PRODUCTO,CANT,BONIF,V.U,V.TOTAL\n');
    
    // Rellena las filas con los productos del pedido
    const productsInTwoColumns = orderItems.reduce((acc, current, index) => {
      const colIndex = Math.floor(index / 2);
      if (!acc[colIndex]) acc[colIndex] = [];
      acc[colIndex].push(current);
      return acc;
    }, []);

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

    // Agrega el resumen de totales al final del CSV
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(',,,,,,,,,,,\n');
    csvRows.push(`,,,,,SUBTOTAL:,,${subtotal},,,,,\n`);
    csvRows.push(`,,,,,DESCUENTO:,,${descuentoCalculado},,,,,\n`);
    csvRows.push(`,,,,,IVA:,,${iva},,,,,\n`);
    csvRows.push(`,,,,,TOTAL:,,${total},,,,,\n`);

    const csvContent = csvRows.join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'remision.csv'); // Cambiado a 'remision.csv'
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
              <label className="text-sm font-medium text-gray-600 mb-1">Descuento (%):</label>
              <input type="number" name="descuento" value={clientInfo.descuento} onChange={handleClientInfoChange} min="0" max="100" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
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
        
        {/* Sección de Resumen de Totales */}
        {orderItems.length > 0 && (
          <div className="bg-gray-100 p-6 rounded-lg mt-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Resumen del Pedido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p className="flex justify-between font-bold text-gray-800">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </p>
              <p className="flex justify-between text-gray-700">
                <span>Descuento ({clientInfo.descuento}%):</span>
                <span>-${descuentoCalculado.toLocaleString('es-CO')}</span>
              </p>
              <p className="flex justify-between text-gray-700">
                <span>IVA (19%):</span>
                <span>+${iva.toLocaleString('es-CO')}</span>
              </p>
              <p className="flex justify-between font-bold text-green-600 text-2xl">
                <span>Total:</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </p>
            </div>
          </div>
        )}

        {/* Botón de descarga y regresar */}
        <div className="flex justify-center space-x-4 mt-8">
          <button onClick={handleDownload} className="bg-green-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105" disabled={orderItems.length === 0}>
            Descargar Remisión
          </button>
          <button onClick={onReturnToMenu} className="bg-gray-500 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105">
            Regresar al Menú
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal que maneja el menú y la renderización condicional
const App = () => {
  const [activeOption, setActiveOption] = useState(null); // Empezamos con null para que se muestre el menú

  const renderContent = () => {
    switch (activeOption) {
      case 'analizar-excel':
        return <ExcelAnalyser onReturnToMenu={() => setActiveOption(null)} />;
      case 'llenado-pedido':
        return <PedidoForm onReturnToMenu={() => setActiveOption(null)} />;
      default:
        return (
          <div className="w-full max-w-2xl">
            <nav className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveOption('analizar-excel')}
                className="py-3 px-6 rounded-lg font-semibold text-lg transition duration-300 ease-in-out bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              >
                Analizar Excel
              </button>
              <button
                onClick={() => setActiveOption('llenado-pedido')}
                className="py-3 px-6 rounded-lg font-semibold text-lg transition duration-300 ease-in-out bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              >
                Llenado de Toma de Pedido
              </button>
              <button
                disabled
                className="py-3 px-6 rounded-lg font-semibold text-lg bg-gray-300 text-gray-600 cursor-not-allowed"
              >
                Próximamente
              </button>
            </nav>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
