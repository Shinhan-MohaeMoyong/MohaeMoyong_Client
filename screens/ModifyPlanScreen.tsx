import { RowItem } from '@/hooks/useFriends';
import { useModifyPlanScreen } from '@/hooks/useModifyPlanScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function ModifyPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
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
    handleModifyPlan 
  } = useModifyPlanScreen(
    params.planId ? parseInt(params.planId as string) : undefined, 
    params.postData ? JSON.parse(params.postData as string) : undefined
  );

    // URL 파라미터에서 받은 데이터를 formData에 매핑
  useEffect(() => {
    console.log('ModifyPlanScreen: params.postData', params.postData);
    if (params.planId) {
      // startTime과 endTime을 파싱하여 날짜와 시간 분리
      const startTimeStr = params.startTime as string;
      const endTimeStr = params.endTime as string;
      
      let selectedDate = '';
      let startTime = '09:00';
      let endTime = '10:00';
      let selectedYear = new Date().getFullYear();
      let selectedMonth = new Date().getMonth() + 1;
      
      if (startTimeStr) {
        try {
          const startDate = new Date(startTimeStr);
          selectedYear = startDate.getFullYear();
          selectedMonth = startDate.getMonth() + 1;
          selectedDate = startDate.getDate().toString();
          startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('startTime 파싱 오류:', error);
        }
      }
      
      if (endTimeStr) {
        try {
          const endDate = new Date(endTimeStr);
          endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('endTime 파싱 오류:', error);
        }
      }
      
      const initialData = {
        title: params.title as string || '',
        content: params.content as string || '',
        place: params.place as string || '',
        selectedYear,
        selectedMonth,
        selectedDate,
        startTime,
        endTime,
        isPublic: (params.privacyLevel === 'PERSONAL_PUBLIC' || params.privacyLevel === 'GROUP_PUBLIC'),
        eventType: (params.type === 'GROUP') ? 'group' : 'personal' as 'group' | 'personal',
        hasSavingsGoal: params.hasSavingsGoal === 'true',
        savingsAmount: params.savingsAmount ? parseFloat(params.savingsAmount as string) : 0,
        imageUrl: params.imageUrl as string || '',
        photos: params.photos ? JSON.parse(params.photos as string) : []
      };
      
      updateFormData(initialData);
      console.log('ModifyPlanScreen: PostBottomSheetDTO에서 받은 데이터:', initialData);
      console.log('ModifyPlanScreen: 날짜/시간 파싱 결과:', { selectedYear, selectedMonth, selectedDate, startTime, endTime });
      
      // 이미지 파일들을 formData.files에 매핑
      const imageFiles: any[] = [];
      
      // 첫 번째 이미지는 imageUrl에서 로드
      if (initialData.imageUrl) {
        imageFiles.push({
          id: 'cover_image',
          uri: initialData.imageUrl,
          type: 'image/jpeg',
          name: 'cover_image.jpg',
          size: 0,
          isCover: true
        });
      }
      
      // 두 번째부터는 photos 배열의 url에서 로드
      if (initialData.photos && initialData.photos.length > 0) {
        initialData.photos.forEach((photo: any, index: number) => {
          imageFiles.push({
            id: `photo_${photo.photoId || index}`,
            uri: photo.url,
            type: 'image/jpeg',
            name: `photo_${index}.jpg`,
            size: 0,
            isCover: false
          });
        });
      }
      
      // formData.files 업데이트
      updateFormData({ files: imageFiles });
      console.log('ModifyPlanScreen: 이미지 파일 매핑 완료:', imageFiles);
      
      // participantIds를 기반으로 친구 목록 설정 (GROUP 타입인 경우)
      if (initialData.eventType === 'group' && params.participantIds) {
        const participantIds = JSON.parse(params.participantIds as string);
        if (participantIds.length > 0) {
          // TODO: participantIds를 기반으로 친구 정보를 가져와서 selectedFriends에 설정
          // 현재는 빈 배열로 설정 (실제로는 API를 통해 친구 정보를 가져와야 함)
          const selectedFriends = participantIds.map((userId: number) => ({
            id: userId,
            name: `User ${userId}`, // 임시 이름
            avatar: '' // 임시 아바타
          }));
          updateFormData({ selectedFriends });
          console.log('ModifyPlanScreen: 참여자 ID 기반 친구 목록 설정:', selectedFriends);
        }
      }
    }
  }, []);

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
        isModify={true}
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
            const result = await handleModifyPlan();
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
    paddingHorizontal: 13,
    backgroundColor: 'transparent',
  },
  // ✅ 카드만 흰색
  footerCard: {
    marginTop: 8,
    marginHorizontal: 12,
    //padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
});