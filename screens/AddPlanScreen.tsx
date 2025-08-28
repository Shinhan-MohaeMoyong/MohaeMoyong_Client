import { RowItem } from '@/hooks/useFriends';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddButton from '../components/addPlan/AddButton';
import AddPlanHeader from '../components/addPlan/AddPlanHeader';
import DateTimeSelector from '../components/addPlan/DateTimeSelector';
import EventTypeSelector from '../components/addPlan/EventTypeSelector';
import PhotoUpload from '../components/addPlan/PhotoUpload';
import PlanInputFields from '../components/addPlan/PlanInputFields';
import RepeatOption from '../components/addPlan/RepeatOption';
import SaveOption from '../components/addPlan/SaveOption';
import { useAddPlanScreen } from '../hooks/useAddPlanScreen';

export default function AddPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showFriendSelection, setShowFriendSelection] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<RowItem[]>([]);
  const { 
    formData, 
    isLoading,
    updateFormData, 
    handleWithdrawalAccountSelect,
    handleDepositAccountSelect,
    handleSavingAmountChange,
    handlePhotoUpload,
    handlePhotoRemove,
    handleStartTimeChange,
    handleEndTimeChange,
    handleAddPlan 
  } = useAddPlanScreen();

  const handleWithdrawalAccountPress = () => {
    // 출금계좌 선택 화면으로 이동
    //router.push('/account-select?type=withdrawal');
  };

  const handleDepositAccountPress = () => {
    // 입금계좌 선택 화면으로 이동
    //router.push('/account-select?type=deposit');
  };

  const handleEventTypeChange = (type: 'group' | 'personal') => {
    updateFormData({ eventType: type });
  };

  const handleFriendSelectionConfirm = (selectedFriends: RowItem[]) => {
    updateFormData({ selectedFriends });
    setSelectedFriends(selectedFriends);
    console.log('selectedFriends', selectedFriends);
    setShowFriendSelection(false);
  };

  const handleFriendSelectionClose = () => {
    // 모달을 닫을 때는 선택된 친구 목록을 유지
    setShowFriendSelection(false);
  };

  const handleEditFriends = () => {
    setShowFriendSelection(true);
  };

  const handleFriendToggle = (friend: { id: number; name: string; avatar: string }) => {
    const isSelected = formData.selectedFriends.some(f => f.id === friend.id);
    if (isSelected) {
      // 이미 선택된 친구라면 선택 해제
      updateFormData({ 
        selectedFriends: formData.selectedFriends.filter(f => f.id !== friend.id) 
      });
    } else {
      // 새로운 친구 선택
      updateFormData({ 
        selectedFriends: [...formData.selectedFriends, friend] 
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AddPlanHeader
          isPublic={formData.isPublic}
          onTogglePublic={() => updateFormData({ isPublic: !formData.isPublic })}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <EventTypeSelector
            selectedType={formData.eventType}
            onSelectType={(type) => updateFormData({ eventType: type })}
          />

          <PlanInputFields
            title={formData.title}
            location={formData.place}
            content={formData.content}
            onTitleChange={(title) => updateFormData({ title })}
            onLocationChange={(place) => updateFormData({ place })}
            onContentChange={(content) => updateFormData({ content })}
          />

          <PhotoUpload
            selectedFiles={formData.files}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={handlePhotoRemove}
          />

          <DateTimeSelector
            selectedDate={formData.selectedDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onDateSelect={(selectedDate) => updateFormData({ selectedDate })}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
          />

          <RepeatOption
            repeatConfig={formData.repeatConfig}
            onRepeatConfigChange={(repeatConfig) => updateFormData({ repeatConfig })}
          />

          <SaveOption
            isEnabled={formData.saveOption}
            onToggle={() => updateFormData({ saveOption: !formData.saveOption })}
            withdrawalAccount={formData.withdrawalAccount}
            depositAccount={formData.depositAccount}
            savingAmount={formData.savingAmount}
            onWithdrawalAccountSelect={handleWithdrawalAccountSelect}
            onDepositAccountSelect={handleDepositAccountSelect}
            onSavingAmountChange={handleSavingAmountChange}
          />
        </ScrollView>

        <AddButton
          onPress={async () => {
            const result = await handleAddPlan();
            if (result?.success) {
              router.replace("/(tabs)/Mohaeyoung");
            }
          }}
          disabled={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
