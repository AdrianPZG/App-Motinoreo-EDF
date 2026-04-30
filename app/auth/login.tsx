import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image
        style={styles.logo}
        source={require("../../assets/images/EDF-logo-monocromatico.png")}
        resizeMode="contain"
      />

      <Text style={styles.title}>WELCOME</Text>
      <Text style={styles.subtitle}>Solicitudes de Licencia</Text>

      {/* Grupo de entrada de datos */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#DFDFDF"
        ></TextInput>

        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="••••••••"
          placeholderTextColor="#DFDFDF"
        />
      </View>

      {/* Botón LOGIN */}
      <TouchableOpacity
        style={styles.button1}
        onPress={() => router.replace("/(drawer)/dashboard")}
      >
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* REGISTRO - comentado temporalmente, descomentar cuando se implemente */}
      {/*
      <TouchableOpacity
        style={styles.button2}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={styles.buttonText}>Create an acound</Text>
      </TouchableOpacity>
      */}

      {/* Forgot Password - siempre visible */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Forgot Password? </Text>
        <TouchableOpacity>
          <Text style={styles.recoverText}>Recover</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.light.background,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.blanco,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "medium",
    color: Colors.light.blanco,
    padding: 5,
  },
  inputGroup: {
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 40,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.blanco,
    color: Colors.light.blanco,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button1: {
    backgroundColor: Colors.light.botonVerde,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 80,
    width: "40%",
    alignItems: "center",
  },
  button2: {
    backgroundColor: Colors.light.botonRojo,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    width: "40%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.light.blanco,
    fontSize: 14,
    fontWeight: "normal",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: Colors.light.blanco,
  },
  recoverText: {
    color: "#FFEB3B",
  },
});
