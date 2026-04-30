"""
API Flask - EDF Monitoreo Dashboard
Conecta con la BD SQL Server de la planta TULI y expone endpoints JSON para la app móvil.
Para migrar a producción: cambiar HOST y correr como servicio de Windows.
"""

import os
import pyodbc
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

# Carga las variables del archivo .env (nunca se sube a GitHub)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
CORS(app)  # Permite que la app React Native llame a esta API sin errores de seguridad

# =============================================================
# CONFIGURACIÓN DE LA BASE DE DATOS (leída desde .env)
# =============================================================
DB_SERVER   = os.getenv("DB_SERVER")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Horarios de generación por mes (igual que en el script original)
DICT_GEN_HOURS = {
    1:  (8, 18), 2:  (7, 19), 3:  (7, 19),
    4:  (6, 19), 5:  (6, 19), 6:  (6, 19),
    7:  (6, 20), 8:  (6, 19), 9:  (7, 19),
    10: (7, 18), 11: (7, 18), 12: (8, 18),
}

def get_connection():
    """Crea y retorna una conexión a SQL Server."""
    conn_str = (
        f"DRIVER={{SQL Server}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_DATABASE};"
        f"UID={DB_USERNAME};"
        f"PWD={DB_PASSWORD}"
    )
    return pyodbc.connect(conn_str)


# =============================================================
# ENDPOINT: Verificar que la API está viva
# =============================================================
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "API EDF Monitoreo corriendo ✅"})


# =============================================================
# ENDPOINT: Resumen del día (tarjetas principales del dashboard)
# GET /dashboard/resumen?fecha=2026-04-30
# =============================================================
@app.route("/dashboard/resumen", methods=["GET"])
def dashboard_resumen():
    from flask import request
    fecha_str = request.args.get("fecha", str(date.today()))
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    mes = fecha.month
    start_hour, end_hour = DICT_GEN_HOURS.get(mes, (7, 18))

    try:
        cnxn = get_connection()

        # 1. Potencia actual (MW) - último registro del día
        df_pow = pd.read_sql_query(f"""
            SELECT TOP 1 PPC_PM_P
            FROM Subestation_10MData
            WHERE Time_Stamp <= '{fecha} {end_hour}:00:00'
              AND PPC_PM_P IS NOT NULL
            ORDER BY Time_Stamp DESC
        """, cnxn)
        potencia_mw = round(max(0.0, float(df_pow["PPC_PM_P"].iloc[0])), 2) if not df_pow.empty else 0.0

        # 2. Energía del día (MWh) - integración de PPC_PM_P cada 10 minutos
        df_energia = pd.read_sql_query(f"""
            SELECT PPC_PM_P
            FROM Subestation_10MData
            WHERE Time_Stamp BETWEEN '{fecha} {start_hour:02}:00:00'
                              AND '{fecha} {end_hour:02}:00:00'
              AND PPC_PM_P IS NOT NULL
        """, cnxn)
        energia_dia = round(df_energia["PPC_PM_P"].abs().sum() / 6, 2) if not df_energia.empty else 0.0

        # 3. Energía del mes (MWh/Mes) - acumulado desde el día 1 del mes
        fecha_ini_mes = date(fecha.year, fecha.month, 1)
        df_mes = pd.read_sql_query(f"""
            SELECT PPC_PM_P
            FROM Subestation_10MData
            WHERE Time_Stamp BETWEEN '{fecha_ini_mes} {start_hour:02}:00:00'
                              AND '{fecha} {end_hour:02}:00:00'
              AND PPC_PM_P IS NOT NULL
        """, cnxn)
        energia_mes = round(df_mes["PPC_PM_P"].abs().sum() / 6, 2) if not df_mes.empty else 0.0

        # 4. Set Point (potencia contratada - fija para TULI)
        set_point = 90

        cnxn.close()

        return jsonify({
            "fecha": fecha_str,
            "potencia_mw": potencia_mw,
            "energia_dia_mwh": energia_dia,
            "energia_mes_mwh": energia_mes,
            "set_point_mw": set_point
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# ENDPOINT: Datos de la gráfica de Energía (Día)
# GET /dashboard/grafica-energia?fecha=2026-04-30
# =============================================================
@app.route("/dashboard/grafica-energia", methods=["GET"])
def grafica_energia():
    from flask import request
    fecha_str = request.args.get("fecha", str(date.today()))
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    mes = fecha.month
    start_hour, end_hour = DICT_GEN_HOURS.get(mes, (7, 18))

    try:
        cnxn = get_connection()
        df = pd.read_sql_query(f"""
            SELECT Time_Stamp, PPC_PM_P
            FROM Subestation_10MData
            WHERE Time_Stamp BETWEEN '{fecha} {start_hour:02}:00:00'
                              AND '{fecha} {end_hour:02}:00:00'
              AND PPC_PM_P IS NOT NULL
            ORDER BY Time_Stamp ASC
        """, cnxn)
        cnxn.close()

        datos = [
            {
                "hora": str(row["Time_Stamp"].strftime("%H:%M")),
                "mw": round(max(0.0, float(row["PPC_PM_P"])), 2)  # clip negativos a 0
            }
            for _, row in df.iterrows()
        ]
        return jsonify({"fecha": fecha_str, "datos": datos})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# ENDPOINT: Datos de la gráfica METEO (Irradiancia promedio del día)
# GET /dashboard/grafica-meteo?fecha=2026-04-30
# =============================================================
@app.route("/dashboard/grafica-meteo", methods=["GET"])
def grafica_meteo():
    from flask import request
    fecha_str = request.args.get("fecha", str(date.today()))
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    mes = fecha.month
    start_hour, end_hour = DICT_GEN_HOURS.get(mes, (7, 18))

    poa_cols = ["SUNST_1_CR11_POA", "SUNST_3_CR11_POA", "SUNST_5_CR11_POA",
                "SUNST_7_CR11_POA", "SUNST_9_CR11_POA", "SUNST_11_CR11_POA",
                "SUNST_15_CR11_POA", "SUNST_17_CR11_POA"]
    cols_str = ", ".join(poa_cols)

    try:
        cnxn = get_connection()
        df = pd.read_sql_query(f"""
            SELECT Time_Stamp, {cols_str}
            FROM Sun_St_10MData
            WHERE Time_Stamp BETWEEN '{fecha} {start_hour:02}:00:00'
                              AND '{fecha} {end_hour:02}:00:00'
            ORDER BY Time_Stamp ASC
        """, cnxn)
        cnxn.close()

        # Promedio de los 8 sensores (0 -> NaN para no bajar la media)
        df[poa_cols] = df[poa_cols].replace(0, pd.NA)
        df["irrad_avg"] = df[poa_cols].mean(axis=1, skipna=True).fillna(0)

        datos = [
            {
                "hora": str(row["Time_Stamp"].strftime("%H:%M")),
                "irrad": round(float(row["irrad_avg"]), 2)
            }
            for _, row in df.iterrows()
        ]
        return jsonify({"fecha": fecha_str, "datos": datos})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# ENDPOINT: Gráfica MES - Energía por día del mes
# GET /dashboard/grafica-mes?fecha=2026-04-30
# =============================================================
@app.route("/dashboard/grafica-mes", methods=["GET"])
def grafica_mes():
    from flask import request
    fecha_str = request.args.get("fecha", str(date.today()))
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    mes = fecha.month
    anio = fecha.year
    start_hour, end_hour = DICT_GEN_HOURS.get(mes, (7, 18))

    # Primer y último día del mes (sin pasar de hoy)
    fecha_ini = date(anio, mes, 1)
    if mes == 12:
        fecha_fin = date(anio + 1, 1, 1) - timedelta(days=1)
    else:
        fecha_fin = date(anio, mes + 1, 1) - timedelta(days=1)
    fecha_fin = min(fecha_fin, date.today())

    try:
        cnxn = get_connection()
        df = pd.read_sql_query(f"""
            SELECT
                CAST(Time_Stamp AS DATE) AS dia,
                SUM(ABS(PPC_PM_P)) / 6.0 AS energia_mwh
            FROM Subestation_10MData
            WHERE Time_Stamp >= '{fecha_ini} {start_hour:02}:00:00'
              AND Time_Stamp <  '{fecha_fin} {end_hour:02}:59:59'
              AND PPC_PM_P IS NOT NULL
            GROUP BY CAST(Time_Stamp AS DATE)
            ORDER BY dia ASC
        """, cnxn)
        cnxn.close()

        datos = [
            {
                "dia": str(pd.to_datetime(row["dia"]).day),   # número del día (1-31)
                "mwh": round(float(row["energia_mwh"]), 1)
            }
            for _, row in df.iterrows()
        ]
        return jsonify({"fecha": fecha_str, "datos": datos})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# ENDPOINT: Gráfica AÑO - Energía por mes del año
# GET /dashboard/grafica-anio?fecha=2026-04-30
# =============================================================
@app.route("/dashboard/grafica-anio", methods=["GET"])
def grafica_anio():
    from flask import request
    fecha_str = request.args.get("fecha", str(date.today()))
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    anio = fecha.year

    MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

    try:
        cnxn = get_connection()
        df = pd.read_sql_query(f"""
            SELECT
                DATEPART(MONTH, Time_Stamp) AS mes_num,
                SUM(ABS(PPC_PM_P)) / 6.0   AS energia_mwh
            FROM Subestation_10MData
            WHERE YEAR(Time_Stamp) = {anio}
              AND PPC_PM_P IS NOT NULL
            GROUP BY DATEPART(MONTH, Time_Stamp)
            ORDER BY mes_num ASC
        """, cnxn)
        cnxn.close()

        datos = [
            {
                "mes": MESES[int(row["mes_num"]) - 1],
                "mwh": round(float(row["energia_mwh"]), 1)
            }
            for _, row in df.iterrows()
        ]
        return jsonify({"anio": anio, "datos": datos})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# ARRANQUE
# =============================================================
if __name__ == "__main__":
    print("🚀 API EDF Monitoreo iniciando en http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
