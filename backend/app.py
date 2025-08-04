from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
import json
import os
import requests
import csv

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
    Maneja la subida de archivos Excel para la Opción 1 (Analizador).
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

            if file.filename.endswith(('.xlsx', '.xls')):
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
        # Prepara un extracto de los datos en lugar de todo el DataFrame
        columns_info = ", ".join(excel_data.columns.astype(str).tolist())
        data_sample_string = excel_data.head(10).to_string() 

        prompt_content = (
            f"Tienes los siguientes datos de clientes, que consisten en el nombre de las columnas y una pequeña muestra de los datos:\n"
            f"Columnas disponibles: {columns_info}\n"
            f"Muestra de los datos del Excel:\n{data_sample_string}\n\n"
            f"Basado en estos datos y la muestra, por favor responde a la siguiente pregunta del usuario:\n"
            f"Pregunta: {user_question}\n\n"
            f"Si la pregunta requiere un cálculo o resumen que no se puede realizar con la muestra, indica que se necesita un análisis más profundo del conjunto de datos completo. "
            f"Mantén la respuesta concisa y directa."
        )

        api_key = os.getenv("GEMINI_API_KEY", "") 
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}"

        chat_history = []
        chat_history.append({"role": "user", "parts": [{"text": prompt_content}]})
        payload = {"contents": chat_history}

        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))
        response.raise_for_status()

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

@app.route('/fill-pedido-template', methods=['POST'])
def fill_pedido_template():
    """
    Maneja la subida de un archivo de plantilla CSV y los datos del formulario 
    para la Opción 2 (Llenado de Pedido), llena la plantilla y devuelve el archivo completo.
    """
    try:
        # 1. Obtener los datos del formulario y el archivo
        template_file = request.files.get('templateFile')
        client_info_str = request.form.get('clientInfo')
        order_items_str = request.form.get('orderItems')

        if not template_file:
            return jsonify({'error': 'No se encontró el archivo de plantilla.'}), 400

        # Convertir los datos de texto a objetos Python
        client_info = json.loads(client_info_str)
        order_items = json.loads(order_items_str)

        # 2. Leer el archivo CSV de la plantilla
        file_stream = io.StringIO(template_file.read().decode('utf-8-sig'))
        reader = csv.reader(file_stream)
        rows = list(reader)

        # 3. Llenar la información del cliente en las filas correctas (basado en la imagen)
        rows[4][0] = f"FECHA: {client_info.get('fecha', '')}"
        rows[4][2] = f"NIT: {client_info.get('nit', '')}"
        rows[4][7] = f"NOMBRE VENDEDOR: {client_info.get('vendedor', '')}"

        rows[5][0] = f"CLIENTE: {client_info.get('cliente', '')}"
        rows[5][2] = f"TEL: {client_info.get('telefono', '')}"
        rows[5][7] = f"CONTADO: {client_info.get('contado', '')} CRÉDITO: {client_info.get('credito', '')}"

        rows[6][0] = f"DIRECCION: {client_info.get('direccion', '')}"
        rows[6][2] = f"CIUDAD: {client_info.get('ciudad', '')}"
        rows[6][7] = f"LISTA PRECIOS: {client_info.get('listaPrecios', '')}"
        
        rows[7][0] = f"BARRIO: {client_info.get('barrio', '')}"
        rows[7][2] = f"CEL: {client_info.get('cel', '')}"
        rows[7][4] = f"CORREO: {client_info.get('correo', '')}"

        # 4. Llenar los productos a partir de la fila 10 (índice 9)
        start_row_index = 9
        current_row = start_row_index
        
        products_per_row = 2
        for i in range(0, len(order_items), products_per_row):
            product1 = order_items[i]
            if current_row >= len(rows):
                rows.append([''] * 12)
            
            rows[current_row][0] = product1.get('cod', '')
            rows[current_row][1] = product1.get('description', '')
            rows[current_row][2] = product1.get('quantity', '')
            rows[current_row][3] = product1.get('bonus', '')
            rows[current_row][4] = product1.get('unitPrice', '')
            rows[current_row][5] = product1.get('totalValue', '')

            if i + 1 < len(order_items):
                product2 = order_items[i + 1]
                rows[current_row][6] = product2.get('cod', '')
                rows[current_row][7] = product2.get('description', '')
                rows[current_row][8] = product2.get('quantity', '')
                rows[current_row][9] = product2.get('bonus', '')
                rows[current_row][10] = product2.get('unitPrice', '')
                rows[current_row][11] = product2.get('totalValue', '')
            
            current_row += 1

        # 5. Escribir el contenido modificado a un archivo en memoria
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(rows)
        output.seek(0)
        
        # 6. Enviar el archivo como descarga
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='pedido_diligenciado.csv'
        )

    except Exception as e:
        print(f"Error en fill_pedido_template: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)