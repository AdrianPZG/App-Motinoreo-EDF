import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/Colors";

const PUESTOS = ["Técnico O&M", "Operador O&M", "Supervisor O&M"];
const ROLES = ["Operador", "Administrador", "Dirección"];
const PLANTAS = ["Bluemex Power 1", "Tuli", "Helios"];

export default function RegisterScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estado de cada campo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("");
  const [rol, setRol] = useState("");
  const [planta, setPlanta] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Errores por campo (aparecen al salir del input)
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nombreError, setNombreError] = useState("");

  // Funciones de validación
  const validateEmail = (val: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(
      valid ? "" : "Ingresa un correo válido (debe tener @ y dominio).",
    );
  };

  const validatePasswords = (pass: string, confirm: string) => {
    if (confirm !== "" && pass !== confirm)
      setPasswordError("Las contraseñas no coinciden.");
    else setPasswordError("");
  };

  const validateNombre = (val: string) => {
    if (/\d/.test(val)) {
      setNombreError("El nombre no puede contener números.");
    } else if (
      val
        .trim()
        .split(" ")
        .filter((w) => w.length > 0).length < 2
    ) {
      setNombreError("Ingresa nombre y apellido (al menos dos palabras).");
    } else {
      setNombreError("");
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  // El botón NEXT solo se activa si TODO está lleno Y los términos aceptados
  const fieldsComplete =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    nombre.trim() !== "" &&
    puesto !== "" &&
    rol !== "" &&
    planta !== "" &&
    emailError === "" &&
    passwordError === "" &&
    nombreError === "";

  const isFormValid = fieldsComplete && termsAccepted;

  // Lógica del botón NEXT con mensajes de error
  const handleNext = () => {
    if (!fieldsComplete) {
      setErrorMessage("Por favor llena todos los campos.");
      return;
    }
    if (!termsAccepted) {
      setErrorMessage("Debes aceptar los Términos de uso para continuar.");
      return;
    }
    setErrorMessage("");
  };

  // Componente de Dropdown reutilizable
  const Dropdown = ({
    placeholder,
    value,
    options,
    field,
  }: {
    placeholder: string;
    value: string;
    options: string[];
    field: string;
  }) => (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={() =>
          setActiveDropdown(activeDropdown === field ? null : field)
        }
      >
        <Text style={value ? styles.inputText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>{activeDropdown === field ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {activeDropdown === field && (
        <View style={styles.optionsList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.optionItem}
              onPress={() => {
                if (field === "puesto") setPuesto(opt);
                if (field === "rol") setRol(opt);
                if (field === "planta") setPlanta(opt);
                setActiveDropdown(null);
              }}
            >
              <Text style={styles.optionText}>• {opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Create account</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <TextInput
          style={[styles.inputBox, emailError ? styles.inputError : null]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          onBlur={() => validateEmail(email)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError !== "" && (
          <Text style={styles.fieldError}>{emailError}</Text>
        )}

        <TextInput
          style={styles.inputBox}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.inputBox, passwordError ? styles.inputError : null]}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            validatePasswords(password, val);
          }}
          secureTextEntry
        />
        {passwordError !== "" && (
          <Text style={styles.fieldError}>{passwordError}</Text>
        )}

        <TextInput
          style={[styles.inputBox, nombreError ? styles.inputError : null]}
          placeholder="Nombre"
          placeholderTextColor="#aaa"
          value={nombre}
          onChangeText={setNombre}
          onBlur={() => validateNombre(nombre)}
        />
        {nombreError !== "" && (
          <Text style={styles.fieldError}>{nombreError}</Text>
        )}

        {/* Dropdowns */}
        <Dropdown
          placeholder="Puesto"
          value={puesto}
          options={PUESTOS}
          field="puesto"
        />
        <Dropdown placeholder="ROL" value={rol} options={ROLES} field="rol" />
        <Dropdown
          placeholder="Planta"
          value={planta}
          options={PLANTAS}
          field="planta"
        />

        {/* TÉRMINOS */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View
            style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
          >
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>Términos de uso</Text>
        </TouchableOpacity>

        {/* MENSAJE DE ERROR */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMessage}</Text>
          </View>
        )}

        {/* NEXT Botoncito */}
        <TouchableOpacity
          style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>NEXT ›</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Título izquierda, Back derecha
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backText: {
    fontSize: 18,
    color: Colors.light.background,
    fontWeight: "600",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  form: {
    paddingHorizontal: 25,
  },
  // Un solo estilo para todos los campos: borde abajo, placeholder como etiqueta
  inputBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#aaa",
  },
  dropdownWrapper: {
    marginBottom: 5,
  },
  arrow: {
    fontSize: 11,
    color: "#999",
  },
  optionsList: {
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 5,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  optionText: {
    fontSize: 14,
    color: "#002E5D",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.botonVerde,
    borderColor: Colors.light.botonVerde,
  },
  checkmark: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  termsText: {
    color: "#555",
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: Colors.light.botonVerde,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 40,
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  inputError: {
    borderBottomColor: "#FF5252", // Borde rojo en campos con error
  },
  fieldError: {
    color: "#D32F2F",
    fontSize: 11,
    marginBottom: 6,
    marginTop: -2,
  },
  errorBox: {
    backgroundColor: "#FFF3F3",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "500",
  },
});
