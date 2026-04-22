import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          router.replace("/auth/login");
        });
      }, 1500);
    });
  }, []);

  return (
    <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require("../assets/images/EDF-Aerogenerador.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("../assets/images/EDF-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  background: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: height * 0.08,
  },
  logo: {
    width: width * 0.75,
    height: height * 0.22,
  },
});
