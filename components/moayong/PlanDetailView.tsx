import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlanDetailViewProps {
  plan: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
  };
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PlanDetailView({ plan, onClose, onEdit, onDelete }: PlanDetailViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>시간</Text>
          <Text style={styles.timeText}>
            {plan.startTime} - {plan.endTime}
          </Text>
        </View>

        {plan.location && (
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>장소</Text>
            <Text style={styles.locationText}>{plan.location}</Text>
          </View>
        )}

        {plan.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>설명</Text>
            <Text style={styles.descriptionText}>{plan.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    marginBottom: 20,
  },
  timeSection: {
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
