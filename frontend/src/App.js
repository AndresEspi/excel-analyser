import React, { useState, useEffect } from 'react';
import { ShoppingBag, Box, Droplet, Sun, Zap, Leaf, ChevronLeft } from 'lucide-react';

// Define la URL base de tu backend desplegado en Render
const API_BASE_URL = 'https://excel-analyser-backend.onrender.com';

// Datos de productos consolidados y categorizados.
const CATEGORIZED_PRODUCT_DATA = {
    'FRASCO SHAMPOO COLOR PROTECT TONO SOBRE TONO': [
        { cod: 'NC16', description: 'SH.COLOR PROTECT BEIGE PERLA X 285', unitPrice: 11300 },
        { cod: 'NC18', description: 'SH.COLOR PROTECT CHOCOLATE LIGTH X 285', unitPrice: 11300 },
        { cod: 'NC12', description: 'SH.COLOR PROTECT GRIS SILVER X 285', unitPrice: 11300 },
        { cod: 'NC14', description: 'SH.COLOR PROTECT NEGRO NIGHT X 285', unitPrice: 11300 },
        { cod: 'NC9', description: 'SH.COLOR PROTECT ROJO INTENSE X 285', unitPrice: 11300 },
        { cod: 'NC10', description: 'SH.COLOR PROTECT VIOLETA ULTRA X 285', unitPrice: 11300 },
    ],
    'FRASCO MASCARILLA COLOR PROTECT TONO SOBRE TONO': [
        { cod: 'NC15', description: 'MASC. COLOR PROTECT BEIGE PERLA X 285', unitPrice: 11300 },
        { cod: 'NC17', description: 'MASC. COLOR PROTECT CHOCOLATE LIGTH X 285', unitPrice: 11300 },
        { cod: 'NC11', description: 'MASC. COLOR PROTECT GRIS SILVER X 285', unitPrice: 11300 },
        { cod: 'NC13', description: 'MASC. COLOR PROTECT NEGRO NIGHT X 285', unitPrice: 11300 },
        { cod: 'NC24', description: 'MASC. COLOR PROTECT ROJO INTENSE X 285', unitPrice: 11300 },
        { cod: 'NC27', description: 'MASC. COLOR PROTECT VIOLETA ULTRA X 285', unitPrice: 11300 },
    ],
    'DISPLAY SHAMPOO COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID': [
        { cod: 'NC35', description: 'DISPLAY SH. NEGRO NIGHT 14UX30ML', unitPrice: 34500 },
        { cod: 'NC43', description: 'DISPLAY SH. ROJO INTENSE 14UX30ML', unitPrice: 34500 },
        { cod: 'NC45', description: 'DISPLAY SH. CHOCOLATE LIGHT 14UX30ML', unitPrice: 34500 },
        { cod: 'NC108', description: 'DISPLAY SH. BEIGE PERLA 14UX30ML', unitPrice: 34500 },
    ],
    'DISPLAY MASCARILLA COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID': [
        { cod: 'NC21', description: 'DISPLAY MASC. NEGRO NIGTH 14U X30ML', unitPrice: 28700 },
        { cod: 'NC25', description: 'DISPLAY MASC. BEIGE PERLA 14UX30ML', unitPrice: 28700 },
        { cod: 'NC26', description: 'DISPLAY MASC. CHOCOLATE LIGTH X 14', unitPrice: 28700 },
        { cod: 'NC22', description: 'DISPLAY MASC. GRIS SILVER X 14', unitPrice: 28700 },
        { cod: 'NC24', description: 'DISPLAY MASC. ROJO ULTRA x 14', unitPrice: 28700 },
        { cod: 'NC23', description: 'DISPLAY MASC. VIOLETA ULTRA X 14', unitPrice: 28700 },
        { cod: 'NC19', description: 'DISPLAY MASC. CENIZO ESPECIAL X 14', unitPrice: 28700 },
        { cod: 'NC69', description: 'DISPLAY MASC. AZUL PLATINO X 14', unitPrice: 28700 },
        { cod: 'NC68', description: 'DISPLAY MASC. COBRE DEEP X 14', unitPrice: 28700 },
    ],
    'DOYPACK MASCARILLA COLOR PROTECT TONO SOBRE TONO X 100 ML': [
        { cod: 'NC39', description: 'DOY PACK MASC. COLOR BEIGE PERLA X100ML', unitPrice: 4500 },
        { cod: 'NC40', description: 'DOY PACK MASC. COLOR CHOCOLATE X100ML', unitPrice: 4500 },
        { cod: 'NC41', description: 'DOY PACK MASC. COLOR GRIS SILVER X100ML', unitPrice: 4500 },
        { cod: 'NC42', description: 'DOY PACK MASC. COLOR NEGRO NIGHT X100ML', unitPrice: 4500 },
        { cod: 'NC43', description: 'DOY PACK MASC. COLOR ROJO INTENSE X100ML', unitPrice: 4500 },
        { cod: 'NC44', description: 'DOY PACK MASC. COLOR VIOLETA ULTRA X100ML', unitPrice: 4500 },
    ],
    'MANTEQUILLA CORPORAL X 370 ML': [
      { cod: 'NC65', description: 'MANTEQUILLA CORPORAL MARACUYA X 370', unitPrice: 16000 },
      { cod: 'NC66', description: 'MANTEQUILLA CORPORAL SANDIA X 370', unitPrice: 16000 },
    ],
    'FRASCO MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 160 ML': [
      { cod: 'NC71', description: 'FANTASY AZUL X160ML', unitPrice: 11000 },
      { cod: 'NC72', description: 'FANTASY VIOLETA X160ML', unitPrice: 11000 },
      { cod: 'NC73', description: 'FANTASY GREEN PASTEL X160ML', unitPrice: 11000 },
      { cod: 'NC74', description: 'FANTASY ORANGE X160ML', unitPrice: 11000 },
      { cod: 'NC75', description: 'FANTASY MAGENTA PASTEL X160ML', unitPrice: 11000 },
    ],
    'DISPLAY MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 30 ML': [
      { cod: 'NC158', description: 'MSC AZUL FANTASY', unitPrice: 34500 },
      { cod: 'NC156', description: 'MSC MAGENTA FANTASY', unitPrice: 34500 },
      { cod: 'NC159', description: 'MSC ORANGE PASTEL FANTASY', unitPrice: 34500 },
      { cod: 'NC155', description: 'MSC VERDE FANTASY', unitPrice: 34500 },
      { cod: 'NC157', description: 'MSC VIOLETA FANTASY', unitPrice: 34500 },
    ],
    'LINEA PREMIUM HIDATACIÓN EXTREMA': [
        { cod: 'NC3', description: 'SHAMPOO KERA-MILK X 325', unitPrice: 13000 },
        { cod: 'NC4', description: 'TRATAMIENTO KERA-MILK X 325', unitPrice: 12500 },
    ],
    'LINEA PREMIUM SOS': [
      { cod: 'NC52', description: 'SOS CAPILAR X370ML', unitPrice: 18000 },
    ],
    'LINEA FASTMEN': [
        { cod: 'NC50', description: 'FAST MEN X160ML', unitPrice: 7800 },
    ],
    'LINEA RIZOS': [
      { cod: 'NC58', description: 'RIZOS DEFINIDOS X325ML', unitPrice: 14000 },
    ],
    'LINEA PLUS CAPILAR': [
      { cod: 'NC51', description: 'PLUS CAPILAR X325ML', unitPrice: 14000 },
    ],
    'LINEA SHAMPOO NEUTRO': [
        { cod: 'NC87', description: 'DOYPACK SHAMPOO NEUTRO X100ML', unitPrice: 6000 },
        { cod: 'NC63', description: 'SH. NEUTRO SPECIAL X300 ML', unitPrice: 18750 },
    ],
    'LINEA UÑAS REMOVEDOR ECOLOGICO': [
        { cod: 'NC54', description: 'REMOVEDOR ECOLOGICO X60ML', unitPrice: 3800 },
        { cod: 'NC48', description: 'REMOVEDOR ECOLOGICO X120ML', unitPrice: 6200 },
        { cod: 'NC47', description: 'REMOVEDOR ECOLOGICO X 250ML', unitPrice: 10500 },
    ]
};

// Objeto para mapear categorías a iconos
const categoryIcons = {
    'FRASCO SHAMPOO COLOR PROTECT TONO SOBRE TONO': <Droplet />,
    'FRASCO MASCARILLA COLOR PROTECT TONO SOBRE TONO': <Box />,
    'DISPLAY SHAMPOO COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID': <Droplet />,
    'DISPLAY MASCARILLA COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID': <Box />,
    'DOYPACK MASCARILLA COLOR PROTECT TONO SOBRE TONO X 100 ML': <ShoppingBag />,
    'MANTEQUILLA CORPORAL X 370 ML': <Sun />,
    'FRASCO MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 160 ML': <Box />,
    'DISPLAY MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 30 ML': <Box />,
    'LINEA PREMIUM HIDATACIÓN EXTREMA': <Droplet />,
    'LINEA PREMIUM SOS': <Zap />,
    'LINEA FASTMEN': <Zap />,
    'LINEA RIZOS': <Droplet />,
    'LINEA PLUS CAPILAR': <Droplet />,
    'LINEA SHAMPOO NEUTRO': <Droplet />,
    'LINEA UÑAS REMOVEDOR ECOLOGICO': <Leaf />,
};

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
        descuento: '0',
        barrio: '',
        cel: '',
        correo: ''
    });

    const [orderItems, setOrderItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(CATEGORIZED_PRODUCT_DATA)[0]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [bonus, setBonus] = useState(0);

    const [subtotal, setSubtotal] = useState(0);
    const [descuentoCalculado, setDescuentoCalculado] = useState(0);
    const [iva, setIva] = useState(0);
    const [total, setTotal] = useState(0);

    const availableProducts = CATEGORIZED_PRODUCT_DATA[selectedCategory] || [];

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
            const product = availableProducts.find(p => p.cod === selectedProduct);
            if (product) {
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
        }
    };

    const handleRemoveProduct = (index) => {
        const newItems = orderItems.filter((_, i) => i !== index);
        setOrderItems(newItems);
    };

    const handleDownload = () => {
        const csvRows = [];
        const numColumns = 12;

        const emptyRow = () => ','.repeat(numColumns - 1) + '\n';

        csvRows.push(emptyRow());
        csvRows.push(emptyRow());
        csvRows.push(emptyRow());
        csvRows.push(emptyRow());
        csvRows.push(
            `FECHA: ${clientInfo.fecha},,NIT: ${clientInfo.nit},,,,,,NOMBRE VENDEDOR: ${clientInfo.vendedor},,,\n`
        );
        csvRows.push(
            `CLIENTE: ${clientInfo.cliente},,TEL: ${clientInfo.telefono},,,,,,CONTADO: ${clientInfo.contado} CRÉDITO: ${clientInfo.credito},,,\n`
        );
        csvRows.push(
            `DIRECCION: ${clientInfo.direccion},,CIUDAD: ${clientInfo.ciudad},,,,,,% DESCUENTO: ${clientInfo.descuento},,,\n`
        );
        csvRows.push(
            `BARRIO: ${clientInfo.barrio},,CEL: ${clientInfo.cel},,CORREO: ${clientInfo.correo},,,,,\n`
        );
        csvRows.push(
            `CÓDIGO INT.,PRODUCTO,CANT,BONIF,V.U,V.TOTAL,CÓDIGO,PRODUCTO,CANT,BONIF,V.U,V.TOTAL\n`
        );

        const productsInTwoColumns = [];
        for (let i = 0; i < orderItems.length; i += 2) {
            productsInTwoColumns.push([orderItems[i], orderItems[i + 1]]);
        }

        productsInTwoColumns.forEach(pair => {
            const product1 = pair[0];
            const product2 = pair[1];
            let rowString = '';

            if (product1) {
                rowString += `${product1.cod},"${product1.description}",${product1.quantity},${product1.bonus},${product1.unitPrice},${product1.totalValue}`;
            } else {
                rowString += ',,,,,';
            }

            if (product2) {
                rowString += `,${product2.cod},"${product2.description}",${product2.quantity},${product2.bonus},${product2.unitPrice},${product2.totalValue}`;
            }
            csvRows.push(rowString + '\n');
        });

        csvRows.push(emptyRow());
        csvRows.push(emptyRow());
        csvRows.push(',,,,,,,,,SUBTOTAL:,,' + subtotal + '\n');
        csvRows.push(',,,,,,,,,DESCUENTO:,,' + descuentoCalculado + '\n');
        csvRows.push(',,,,,,,,,IVA:,,' + iva + '\n');
        csvRows.push(',,,,,,,,,TOTAL:,,' + total + '\n');

        const csvContent = csvRows.join('');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'remision.csv');
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
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Panel de Categorías */}
                        <div className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow-inner overflow-y-auto max-h-96 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 sticky top-0 bg-white z-10">Categorías</h3>
                            <ul className="space-y-2">
                                {Object.keys(CATEGORIZED_PRODUCT_DATA).map((category) => (
                                    <li key={category}>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setSelectedProduct('');
                                                setQuantity(0);
                                                setBonus(0);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ease-in-out
                                                ${selectedCategory === category
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {categoryIcons[category]}
                                            <span className="font-medium text-sm sm:text-base">{category}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Panel de Productos por Categoría */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                Productos en "{selectedCategory}"
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableProducts.map((product) => (
                                    <button
                                        key={product.cod}
                                        onClick={() => setSelectedProduct(product.cod)}
                                        className={`p-4 rounded-lg border text-left transition-all duration-200 ease-in-out
                                            ${selectedProduct === product.cod
                                            ? 'border-blue-600 bg-blue-50 shadow-md'
                                            : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900">{product.description}</p>
                                        <p className="text-sm text-gray-600">Código: {product.cod}</p>
                                        <p className="text-md font-bold text-gray-800">
                                            Precio: ${product.unitPrice.toLocaleString('es-CO')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Formulario para añadir al pedido */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
                                <h4 className="text-md font-semibold mb-2">Añadir al pedido</h4>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="0"
                                        placeholder="Cantidad"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="number"
                                        value={bonus}
                                        onChange={(e) => setBonus(e.target.value)}
                                        min="0"
                                        placeholder="Bonificación"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleAddProduct}
                                        disabled={!selectedProduct || quantity <= 0}
                                        className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300
                                            ${!selectedProduct || quantity <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`
                                        }
                                    >
                                        Añadir
                                    </button>
                                </div>
                            </div>
                        </div>
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
    const [activeOption, setActiveOption] = useState(null);

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