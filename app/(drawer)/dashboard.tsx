import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import Colors from "../../constants/Colors";

const API_URL = "http://localhost:5000";

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Resumen = {
  potencia_mw: number;
  energia_dia_mwh: number;
  energia_mes_mwh: number;
  set_point_mw: number;
};

type Tab = "dia" | "mes" | "anio";

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = width - 48;

  // Fecha base (ayer para asegurar datos)
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const [fechaBase, setFechaBase] = useState<Date>(ayer);
  const [tabActivo, setTabActivo] = useState<Tab>("dia");

  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [graficaDia, setGraficaDia] = useState<{ hora: string; mw: number }[]>(
    [],
  );
  const [graficaMeteo, setGraficaMeteo] = useState<
    { hora: string; irrad: number }[]
  >([]);
  const [graficaMes, setGraficaMes] = useState<{ dia: string; mwh: number }[]>(
    [],
  );
  const [graficaAnio, setGraficaAnio] = useState<
    { mes: string; mwh: number }[]
  >([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const fechaStr = fechaBase.toISOString().split("T")[0];

  // Label de navegación según el tab
  const labelFecha = () => {
    if (tabActivo === "dia") return fechaStr;
    if (tabActivo === "mes")
      return `${MESES_ES[fechaBase.getMonth()]} ${fechaBase.getFullYear()}`;
    return `${fechaBase.getFullYear()}`;
  };

  // Navegación: cambia día / mes / año según tab activo
  const navAnterior = () => {
    const nueva = new Date(fechaBase);
    if (tabActivo === "dia") nueva.setDate(nueva.getDate() - 1);
    if (tabActivo === "mes") nueva.setMonth(nueva.getMonth() - 1);
    if (tabActivo === "anio") nueva.setFullYear(nueva.getFullYear() - 1);
    setFechaBase(nueva);
  };

  const navSiguiente = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nueva = new Date(fechaBase);
    if (tabActivo === "dia") nueva.setDate(nueva.getDate() + 1);
    if (tabActivo === "mes") nueva.setMonth(nueva.getMonth() + 1);
    if (tabActivo === "anio") nueva.setFullYear(nueva.getFullYear() + 1);
    if (nueva <= hoy) setFechaBase(nueva);
  };

  // Re-fetch cuando cambia fecha o tab
  useEffect(() => {
    fetchTodo();
  }, [fechaStr, tabActivo]);

  const fetchTodo = async () => {
    setCargando(true);
    setError("");
    try {
      // 1. Resumen
      const resRes = await fetch(
        `${API_URL}/dashboard/resumen?fecha=${fechaStr}`,
      );
      if (resRes.ok) {
        const resData = await resRes.json();
        setResumen(resData);
      }

      // 2. Gráficas según tab
      if (tabActivo === "dia") {
        const [eRes, mRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/grafica-energia?fecha=${fechaStr}`),
          fetch(`${API_URL}/dashboard/grafica-meteo?fecha=${fechaStr}`),
        ]);

        if (eRes.ok) {
          const eData = await eRes.json();
          setGraficaDia(
            eData.datos?.filter((_: any, i: number) => i % 2 === 0) ?? [],
          );
        }
        if (mRes.ok) {
          const mData = await mRes.json();
          setGraficaMeteo(
            mData.datos?.filter((_: any, i: number) => i % 2 === 0) ?? [],
          );
        }
      } else if (tabActivo === "mes") {
        const mRes = await fetch(
          `${API_URL}/dashboard/grafica-mes?fecha=${fechaStr}`,
        );
        if (mRes.ok) {
          const mData = await mRes.json();
          setGraficaMes(mData.datos ?? []);
        } else {
          setError("Error al cargar datos del mes");
        }
      } else {
        const aRes = await fetch(
          `${API_URL}/dashboard/grafica-anio?fecha=${fechaStr}`,
        );
        if (aRes.ok) {
          const aData = await aRes.json();
          setGraficaAnio(aData.datos ?? []);
        } else {
          setError("Error al cargar datos del año");
        }
      }
    } catch (err) {
      console.error("Error en dashboard:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#EEF4FF",
    decimalPlaces: 0,
    color: () => Colors.light.background,
    labelColor: () => "#999",
    propsForLabels: { fontSize: 9 },
  };

  const chartConfigBar = {
    ...chartConfig,
    backgroundGradientTo: "#EEF4FF",
    fillShadowGradient: Colors.light.background,
    fillShadowGradientOpacity: 0.8,
  };

  const chartConfigAnio = {
    ...chartConfig,
    backgroundGradientTo: "#F0FFF4",
    fillShadowGradient: "#27AE60",
    fillShadowGradientOpacity: 0.8,
    color: () => "#27AE60",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text style={styles.plantName}>Tuli Solar Plant</Text>

        {/* NAVEGACIÓN DE FECHA */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={navAnterior} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.fecha}>{labelFecha()}</Text>
          <TouchableOpacity onPress={navSiguiente} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* LOADING */}
        {cargando && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.light.background} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        )}

        {/* ERROR */}
        {!cargando && error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTodo}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TARJETAS KPI */}
        {!cargando && resumen && (
          <>
            <View style={styles.energyCard}>
              <View style={styles.energyRow}>
                <Text style={styles.energyValue}>
                  {resumen.energia_dia_mwh.toFixed(1)}
                </Text>
                <View style={styles.labelCol}>
                  <Text style={styles.energyUnit}>MWh</Text>
                  <Text style={styles.energyHint}>Energía del día</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.energyRow}>
                <Text style={styles.energyValueMes}>
                  {resumen.energia_mes_mwh.toLocaleString("es-MX", {
                    maximumFractionDigits: 0,
                  })}
                </Text>
                <View style={styles.labelCol}>
                  <Text style={styles.energyUnit}>MWh</Text>
                  <Text style={styles.energyHint}>Energía del mes</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.energyRow}>
                <Text style={styles.energyValueMW}>
                  {resumen.potencia_mw.toFixed(2)}
                </Text>
                <View style={styles.labelCol}>
                  <Text style={styles.energyUnit}>MW</Text>
                  <Text style={styles.energyHint}>Potencia actual</Text>
                </View>
                <View style={styles.setPointBox}>
                  <Text style={styles.setPoint}>{resumen.set_point_mw}</Text>
                  <Text style={styles.setPointLabel}>Set Point</Text>
                </View>
              </View>
            </View>

            {/* TABS */}
            <View style={styles.tabsRow}>
              {(["dia", "mes", "anio"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={tab === tabActivo ? styles.tabActive : styles.tab}
                  onPress={() => setTabActivo(tab)}
                >
                  <Text
                    style={
                      tab === tabActivo ? styles.tabTextActive : styles.tabText
                    }
                  >
                    {tab === "dia" ? "Día" : tab === "mes" ? "Mes" : "Año"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── TAB DÍA ── */}
            {tabActivo === "dia" && (
              <>
                <View style={styles.chartCard}>
                  <Text style={styles.chartLabel}>⚡ Energía (MW)</Text>
                  {graficaDia.length > 1 ? (
                    <LineChart
                      data={{
                        labels: graficaDia
                          .filter((_, i) => i % 6 === 0)
                          .map((d) => d.hora),
                        datasets: [{ data: graficaDia.map((d) => d.mw) }],
                      }}
                      width={chartWidth}
                      height={200}
                      withDots={false}
                      withInnerLines={false}
                      bezier
                      chartConfig={chartConfig}
                      style={styles.chart}
                    />
                  ) : (
                    <Text style={styles.chartEmpty}>
                      Sin datos para este día
                    </Text>
                  )}
                </View>

                <View style={styles.chartCard}>
                  <Text style={styles.chartLabel}>☀️ METEO avg (W/m²)</Text>
                  {graficaMeteo.length > 1 ? (
                    <LineChart
                      data={{
                        labels: graficaMeteo
                          .filter((_, i) => i % 6 === 0)
                          .map((d) => d.hora),
                        datasets: [{ data: graficaMeteo.map((d) => d.irrad) }],
                      }}
                      width={chartWidth}
                      height={200}
                      withDots={false}
                      withInnerLines={false}
                      bezier
                      chartConfig={{
                        ...chartConfig,
                        backgroundGradientTo: "#FFFBEE",
                        color: () => "#F5A623",
                      }}
                      style={styles.chart}
                    />
                  ) : (
                    <Text style={styles.chartEmpty}>
                      Sin datos de irradiancia
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* ── TAB MES ── */}
            {tabActivo === "mes" && (
              <View style={styles.chartCard}>
                <Text style={styles.chartLabel}>
                  Energía diaria — {MESES_ES[fechaBase.getMonth()]}{" "}
                  {fechaBase.getFullYear()}
                </Text>
                {graficaMes.length > 0 ? (
                  <BarChart
                    data={{
                      labels: graficaMes.map((d, i) =>
                        i % 5 === 0 ? d.dia : "",
                      ),
                      datasets: [{ data: graficaMes.map((d) => d.mwh) }],
                    }}
                    width={width - 48}
                    height={240}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yLabelsOffset={0} // 0 absoluto para que los números no toquen ni crucen la barra
                    chartConfig={{
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
                      labelColor: () => "#888",
                      propsForLabels: { fontSize: 8 },
                      fillShadowGradientOpacity: 1,
                      barPercentage: 0.15, // Suficientemente delgadas
                    }}
                    style={{
                      ...styles.chart,
                      marginLeft: 0,
                      paddingRight: 20,
                    }}
                    showValuesOnTopOfBars={false}
                    withInnerLines={true}
                    fromZero
                  />
                ) : (
                  <Text style={styles.chartEmpty}>Sin datos para este mes</Text>
                )}
              </View>
            )}

            {/* ── TAB AÑO ── */}
            {tabActivo === "anio" && (
              <View style={styles.chartCard}>
                <Text style={styles.chartLabel}>
                  Energía mensual — {fechaBase.getFullYear()}
                </Text>
                {graficaAnio.length > 0 ? (
                  <BarChart
                    data={{
                      labels: graficaAnio.map((d) => d.mes),
                      datasets: [{ data: graficaAnio.map((d) => d.mwh) }],
                    }}
                    width={chartWidth}
                    height={240}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
                      labelColor: () => "#999",
                      propsForLabels: { fontSize: 9 },
                      fillShadowGradientOpacity: 1,
                      barPercentage: 0.8, // Un poco más anchas que el mes porque son solo 12
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars={false}
                    withInnerLines={true}
                    fromZero
                  />
                ) : (
                  <Text style={styles.chartEmpty}>Sin datos para este año</Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 40 },
  plantName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.background,
    textAlign: "center",
    marginBottom: 2,
    marginTop: 4,
  },
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  dateArrow: { paddingHorizontal: 12, paddingVertical: 4 },
  dateArrowText: {
    fontSize: 28,
    color: Colors.light.background,
    fontWeight: "bold",
  },
  fecha: { fontSize: 13, color: "#666", fontWeight: "500" },
  centered: { alignItems: "center", marginTop: 40, gap: 12 },
  loadingText: { color: "#888", fontSize: 14 },
  errorBox: {
    backgroundColor: "#FFF3F3",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
    gap: 10,
  },
  errorText: { color: "#D32F2F", fontSize: 13, textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: "white", fontWeight: "bold", fontSize: 13 },
  energyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  energyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  labelCol: { marginLeft: 8, flex: 1 },
  energyUnit: { fontSize: 13, color: "#666", fontWeight: "600" },
  energyHint: { fontSize: 11, color: "#aaa" },
  energyValue: {
    fontSize: 38,
    fontWeight: "bold",
    color: Colors.light.background,
  },
  energyValueMes: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.background,
  },
  energyValueMW: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.botonRojo,
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 4 },
  setPointBox: {
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setPoint: { fontSize: 22, fontWeight: "bold", color: "#333" },
  setPointLabel: { fontSize: 10, color: "#999" },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabActive: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  tabTextActive: { color: "white", fontWeight: "bold", fontSize: 14 },
  tabText: { color: "#666", fontSize: 14 },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: { borderRadius: 12, marginTop: 8 },
  chartLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  chartEmpty: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});
