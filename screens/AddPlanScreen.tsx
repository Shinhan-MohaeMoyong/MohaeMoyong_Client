import { RowItem } from '@/hooks/useFriends';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddButton from '../components/addPlan/AddButton';
import AddPlanHeader from '../components/addPlan/AddPlanHeader';
import DateTimeSelector from '../components/addPlan/DateTimeSelector';
import DepositAccountSelection from '../components/addPlan/DepositAccountSelection';
import EventTypeSelector from '../components/addPlan/EventTypeSelector';
import FriendListSection from '../components/addPlan/FriendListSection';
import GroupScheduleSelectionScreen from '../components/addPlan/GroupScheduleSelectionScreen';
import PhotoUpload from '../components/addPlan/PhotoUpload';
import PlanInputFields from '../components/addPlan/PlanInputFields';
import RepeatOption from '../components/addPlan/RepeatOption';
import SaveOption from '../components/addPlan/SaveOption';
import { useAddPlanScreen } from '../hooks/useAddPlanScreen';

export default function AddPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showFriendSelection, setShowFriendSelection] = useState(false);
  const [showDepositAccountSelection, setShowDepositAccountSelection] = useState(false);
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
    setShowDepositAccountSelection(true);
  };

  const handleDepositAccountSelection = (account: any) => {
    updateFormData({ 
      depositAccount: {
        id: account.id,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountType: '입금계좌'
      }
    });
  };

  const handleEventTypeChange = (type: 'group' | 'personal') => {
    updateFormData({ eventType: type });
  };

  const handleFriendSelectionConfirm = (selectedFriends: RowItem[]) => {
    updateFormData({ selectedFriends });
    setShowFriendSelection(false);
  };

  const handleFriendSelectionClose = () => {
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor:'FFFFFF'}]}>
      <AddPlanHeader
        isPublic={formData.isPublic}
        onTogglePublic={() => updateFormData({ isPublic: !formData.isPublic })}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16, // 과도한 120 제거
        }}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'} // ✅ 핵심!
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <EventTypeSelector
            selectedType={formData.eventType}
            onSelectType={(type) => updateFormData({ eventType: type })}
          />

          {/* 단체일정일 때만 FriendListSection 표시 */}
          {formData.eventType === 'group' && (
            <FriendListSection
              selectedFriends={formData.selectedFriends}
              onFriendToggle={handleFriendToggle}
              onEditPress={handleEditFriends}
            />
          )}

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
            onWithdrawalAccountSelect={handleWithdrawalAccountPress}
            onDepositAccountSelect={handleDepositAccountPress}
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

        {/* GroupScheduleSelectionScreen 모달 */}
        <GroupScheduleSelectionScreen
          visible={showFriendSelection}
          onClose={handleFriendSelectionClose}
          onConfirm={handleFriendSelectionConfirm}
          maxSelection={100}
          initialSelectedFriends={formData.selectedFriends}
        />

        {/* DepositAccountSelection 모달 */}
        <DepositAccountSelection
          visible={showDepositAccountSelection}
          onClose={() => setShowDepositAccountSelection(false)}
          onAccountSelect={handleDepositAccountSelection}
        />
        </ScrollView>

      </View>
  );
}

const styles = StyleSheet.create({
  // ✅ 페이지 배경(연회색) — 흰 바닥이 올라오지 않게
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // ✅ 스크롤뷰는 투명
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  // ✅ 카드만 흰색
  footerCard: {
    marginTop: 8,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
});