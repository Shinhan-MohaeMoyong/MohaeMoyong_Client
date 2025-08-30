import { StyleSheet, Text, View } from "react-native";
import type { PlanEntity } from "../types";

type Props = {
  events: PlanEntity[];
};

export default function DailyScheduleList({ events }: Props) {
  if (!events || events.length === 0) {
    return null;
  }
  return (
    <View style={styles.listWrap}>
      {events.map((p) => (
        <PlanCard key={p.planId} plan={p} />
      ))}
    </View>
  );
}

function PlanCard({ plan }: { plan: PlanEntity }) {
  const start = new Date(plan.startTime);
  const end = new Date(plan.endTime || plan.startTime);
  const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return (
    <View style={styles.card}>
      <View style={styles.timeCol}>
        <Text style={styles.timeText}>{hhmm(start)}</Text>
        <Text style={styles.timeTo}>~</Text>
        <Text style={styles.timeText}>{hhmm(end)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{plan.title}</Text>
        {!!plan.place && <Text style={styles.cardMeta}>{plan.place}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: { paddingHorizontal: 16, marginTop: 12, gap: 12 },
  emptyText: { color: "#9AA0A6", textAlign: "center", marginTop: 24 },
  card: { flexDirection: "row", backgroundColor: "#8C93FF", borderRadius: 16, padding: 16, alignItems: "center" },
  timeCol: { width: 56 },
  timeText: { color: "#5E6B7D", fontSize: 12 },
  timeTo: { color: "#5E6B7D", fontSize: 12, textAlign: "center" },
  cardBody: { flex: 1, backgroundColor: "transparent" },
  cardTitle: { color: "#fff", fontSize: 14, fontWeight: "800", marginBottom: 6 },
  cardMeta: { color: "#F2ECFF", fontSize: 12, fontWeight: "600" },
});


