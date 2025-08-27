import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  okText?: string;
  onClose?: () => void;
  onOk?: () => void;
};

export default function NoticeModal({
  visible,
  title = "알림",
  message,
  okText = "확인",
  onClose,
  onOk,
}: Props) {
  const handleOk = () => {
    try {
      onOk?.();
    } finally {
      onClose?.();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.msg}>{message}</Text>}
          <TouchableOpacity style={styles.okBtn} onPress={handleOk}>
            <Text style={styles.okText}>{okText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  msg: { marginTop: 10, fontSize: 14, color: "#4B5563", lineHeight: 20 },
  okBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#8C93FF",
    alignItems: "center",
    justifyContent: "center",
  },
  okText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});