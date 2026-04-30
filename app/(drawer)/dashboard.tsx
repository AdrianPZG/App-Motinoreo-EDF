import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/Colors";

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.plantName}>BlueMex Power 1</Text>

      {/* TARJETAS DE ENERGÍA */}
      <View style={styles.energyCard}>
        <View style={styles.energyRow}>
          <Text style={styles.energyValue}>495.7</Text>
          <Text style={styles.energyLabel}>MWh</Text>
        </View>
        <View style={styles.energyRow}>
          <Text style={styles.energyValueMes}>15,438.95</Text>
          <Text style={styles.energyLabel}>MWh/Mes</Text>
        </View>
        <View style={styles.energyRow}>
          <Text style={styles.energyValueMW}>70.99</Text>
          <Text style={styles.energyLabelSmall}>MW</Text>
          <Text style={styles.setPoint}>90</Text>
          <Text style={styles.setPointLabel}>Set Point</Text>
        </View>
      </View>

      {/* TABS DÍA / MES / AÑO */}
      <View style={styles.tabsRow}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Día</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Año</Text>
        </TouchableOpacity>
      </View>

      {/* PLACEHOLDER GRÁFICA */}
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartLabel}>Energía</Text>
        <Text style={styles.chartComingSoon}>📊 Gráfica próximamente</Text>
      </View>

      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartLabel}>METEO avg</Text>
        <Text style={styles.chartComingSoon}>📈 Gráfica próximamente</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  plantName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.background,
    textAlign: "center",
    marginBottom: 20,
  },
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
  energyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  energyValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.light.background,
    marginRight: 8,
  },
  energyValueMes: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.background,
    marginRight: 8,
  },
  energyValueMW: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.botonRojo,
    marginRight: 8,
  },
  energyLabel: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  energyLabelSmall: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-end",
    marginBottom: 4,
    flex: 1,
  },
  setPoint: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginRight: 4,
  },
  setPointLabel: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
    marginBottom: 4,
  },
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
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabTextActive: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  tabText: {
    color: "#666",
    fontSize: 14,
  },
  chartPlaceholder: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  chartComingSoon: {
    fontSize: 16,
    color: "#aaa",
  },
});
