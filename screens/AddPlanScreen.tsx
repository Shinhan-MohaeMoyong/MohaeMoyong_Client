import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddButton from "../components/addPlan/AddButton";
import AddPlanHeader from "../components/addPlan/AddPlanHeader";
import DateTimeSelector from "../components/addPlan/DateTimeSelector";
import EventTypeSelector from "../components/addPlan/EventTypeSelector";
import PhotoUpload from "../components/addPlan/PhotoUpload";
import PlanInputFields from "../components/addPlan/PlanInputFields";
import RepeatOption from "../components/addPlan/RepeatOption";
import SaveOption from "../components/addPlan/SaveOption";
import { useAddPlanScreen } from "../hooks/useAddPlanScreen";

export default function AddPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
    handleAddPlan,
  } = useAddPlanScreen();

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
              router.push("/(tabs)");
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
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
