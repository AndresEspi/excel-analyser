from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import json
import os # Importar para leer variables de entorno
import requests # Necesario para hacer llamadas HTTP a la API de Gemini

# Inicializa la aplicación Flask
app = Flask(__name__)
# Habilita CORS para permitir solicitudes desde el frontend (que estará en un puerto diferente)
CORS(app)

# Variable global para almacenar los datos del archivo Excel
excel_data = None

@app.route('/')
def home():
    """Ruta de inicio para verificar que el servidor está funcionando."""
    return "Servidor de Análisis de Excel funcionando. ¡Sube un archivo a /upload!"

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Maneja la subida de archivos Excel.
    Recibe el archivo, lo lee con pandas y lo almacena en memoria.
    """
    if 'excelFile' not in request.files:
        return jsonify({"error": "No se encontró el archivo en la solicitud."}), 400

    file = request.files['excelFile']

    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo."}), 400

    if file:
        try:
            file_content = io.BytesIO(file.read())

            if file.filename.endswith('.xlsx'):
                df = pd.read_excel(file_content, header=2) 
            elif file.filename.endswith('.xls'):
                df = pd.read_excel(file_content, header=2)
            elif file.filename.endswith('.csv'):
                try:
                    df = pd.read_csv(file_content, encoding='utf-8', header=2)
                except UnicodeDecodeError:
                    file_content.seek(0)
                    df = pd.read_csv(file_content, encoding='latin1', header=2)
            else:
                return jsonify({"error": "Tipo de archivo no soportado. Por favor, sube .xlsx, .xls o .csv."}), 400

            global excel_data
            excel_data = df
            
            print("Archivo subido y procesado con éxito.")
            print("Columnas:", df.columns.tolist())
            print("Primeras 5 filas:\n", df.head())

            return jsonify({
                "message": "Archivo procesado con éxito.",
                "filename": file.filename,
                "columns": df.columns.tolist(),
                "rows_count": len(df)
            }), 200

        except Exception as e:
            print(f"Error al procesar el archivo: {e}")
            return jsonify({"error": f"Error al procesar el archivo: {str(e)}"}), 500
    
    return jsonify({"error": "Ocurrió un error inesperado."}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """
    Recibe una pregunta del usuario, la procesa usando el LLM y los datos cargados,
    y devuelve una respuesta utilizando la API de Google Gemini.
    """
    global excel_data

    if excel_data is None:
        return jsonify({"error": "No se ha cargado ningún archivo Excel. Por favor, sube uno primero."}), 400

    data = request.get_json()
    user_question = data.get('question')

    if not user_question:
        return jsonify({"error": "No se proporcionó ninguna pregunta."}), 400

    try:
        # Prepara el prompt para el LLM
        columns_info = ", ".join(excel_data.columns.astype(str).tolist())
        
        # CAMBIO CLAVE AQUÍ: Enviar todo el DataFrame a string
        # ADVERTENCIA: Si el archivo es muy grande, esto podría exceder el límite de tokens del LLM.
        full_data_string = excel_data.to_string() 

        prompt_content = (
            f"Tienes los siguientes datos de clientes:\n"
            f"Columnas disponibles: {columns_info}\n"
            f"Datos del Excel:\n{full_data_string}\n\n" # <--- Ahora se envía todo el contenido
            f"Basado en estos datos, por favor responde a la siguiente pregunta del usuario:\n"
            f"Pregunta: {user_question}\n\n"
            f"Si la pregunta requiere un cálculo o resumen de los datos, proporciona el resultado. "
            f"Si la pregunta no se puede responder con los datos proporcionados, indícalo claramente. "
            f"Mantén la respuesta concisa y directa."
        )

        # Llama al LLM (Gemini 2.0 Flash)
        # IMPORTANTE: Necesitas tu propia API Key de Google AI Studio aquí.
        # Obtén una en https://aistudio.google.com/app/apikey
        api_key = os.getenv("GEMINI_API_KEY") # Lee la clave de una variable de entorno # <--- ¡Inserta tu API Key de Gemini aquí!
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

        chat_history = []
        chat_history.append({"role": "user", "parts": [{"text": prompt_content}]}) 
        payload = {"contents": chat_history}

        # Realiza la solicitud HTTP al LLM
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))
        response.raise_for_status() # Lanza una excepción para errores HTTP

        result = response.json()

        if result.get('candidates') and len(result['candidates']) > 0 and \
           result['candidates'][0].get('content') and result['candidates'][0]['content'].get('parts') and \
           len(result['candidates'][0]['content']['parts']) > 0:
            llm_response_text = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({"answer": llm_response_text}), 200
        else:
            print(f"Respuesta inesperada del modelo: {result}")
            return jsonify({"error": "No se pudo obtener una respuesta del modelo de lenguaje."}), 500

    except requests.exceptions.RequestException as req_err:
        print(f"Error al conectar con la API de Gemini: {req_err}")
        return jsonify({"error": f"Error al conectar con el servicio de IA: {str(req_err)}"}), 500
    except Exception as e:
        print(f"Error al procesar la pregunta: {e}")
        return jsonify({"error": f"Error interno al procesar la pregunta: {str(e)}"}), 500

if __name__ == '__main__':
    # El servicio de hosting proporcionará el puerto a través de una variable de entorno 'PORT'
    port = int(os.environ.get("PORT", 5000))
    # host='0.0.0.0' para que el servidor escuche conexiones desde cualquier IP externa
    app.run(debug=True, host='0.0.0.0', port=port)
