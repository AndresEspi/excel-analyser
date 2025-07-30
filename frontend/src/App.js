import React, { useState } from 'react';

// Define la URL base de tu backend desplegado en Render
// ¡Esta es la URL que proporcionaste!
const API_BASE_URL = 'https://excel-analyser-backend.onrender.com';

// Componente principal de la aplicación
const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false); // Nuevo estado para controlar si el archivo fue subido
  const [question, setQuestion] = useState(''); // Estado para la pregunta del usuario
  const [answer, setAnswer] = useState(''); // Estado para la respuesta del LLM
  const [loadingAnswer, setLoadingAnswer] = useState(false); // Estado para indicar que se está cargando la respuesta

  // Maneja la selección de archivo por parte del usuario
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verifica si el archivo es un tipo de Excel válido
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'text/csv') { // Agregamos soporte para CSV
        setSelectedFile(file);
        setMessage(`Archivo seleccionado: ${file.name}`);
        setFileUploaded(false); // Reiniciar estado de subida al seleccionar nuevo archivo
        setAnswer(''); // Limpiar respuesta anterior
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

  // Maneja la subida del archivo (aquí se enviará al backend)
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecciona un archivo primero.');
      return;
    }

    setMessage('Subiendo archivo...');
    setLoadingAnswer(true); // Usamos este para el estado de subida también temporalmente
    
    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile); // 'excelFile' debe coincidir con el nombre esperado en el backend (request.files['excelFile'])

      // === CAMBIO AQUÍ: Usar la URL de Render para el backend ===
      const response = await fetch(`${API_BASE_URL}/upload`, { 
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`"${selectedFile.name}" subido y procesado con éxito. Columnas: ${data.columns.join(', ')}. Filas: ${data.rows_count}`);
        setFileUploaded(true); // Marcar como subido
        setAnswer(''); // Limpiar respuesta anterior
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
      setLoadingAnswer(false); // Finalizar estado de carga
    }
  };

  // Maneja el envío de la pregunta al backend
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
      // === CAMBIO AQUÍ: Usar la URL de Render para el backend ===
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
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
            accept=".xlsx, .xls, .csv" // Actualizado para aceptar CSV
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

        {/* Sección de Preguntas y Respuestas (visible solo después de subir un archivo) */}
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
      </div>
    </div>
  );
};

export default App;
