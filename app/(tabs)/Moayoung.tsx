import ScheduleCalendarScreen from "@/screens/ScheduleCalendarScreen";
import { StyleSheet } from "react-native";

export default function ExploreScreen() {
  return <ScheduleCalendarScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
