import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddButton from '../components/addPlan/AddButton';
import AddPlanHeader from '../components/addPlan/AddPlanHeader';
import DateTimeSelector from '../components/addPlan/DateTimeSelector';
import EventTypeSelector from '../components/addPlan/EventTypeSelector';
import PlanInputFields from '../components/addPlan/PlanInputFields';
import RepeatOption from '../components/addPlan/RepeatOption';
import SaveOption from '../components/addPlan/SaveOption';
import { useAddPlanScreen } from '../hooks/useAddPlanScreen';

export default function AddPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    formData, 
    updateFormData, 
    handleWithdrawalAccountSelect,
    handleDepositAccountSelect,
    handleSavingAmountChange,
    handleAddPlan 
  } = useAddPlanScreen();

  const handleWithdrawalAccountPress = () => {
    // 출금계좌 선택 화면으로 이동
    router.push('/account-select?type=withdrawal');
  };

  const handleDepositAccountPress = () => {
    // 입금계좌 선택 화면으로 이동
    router.push('/account-select?type=deposit');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AddPlanHeader 
        isPublic={formData.isPublic} 
        onTogglePublic={() => updateFormData({ isPublic: !formData.isPublic })} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
        
        <DateTimeSelector
          selectedDate={formData.selectedDate}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDateSelect={(selectedDate) => updateFormData({ selectedDate })}
          onStartTimeChange={(startTime) => updateFormData({ startTime })}
          onEndTimeChange={(endTime) => updateFormData({ endTime })}
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
      
      <AddButton onPress={handleAddPlan} />
    </View>
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
