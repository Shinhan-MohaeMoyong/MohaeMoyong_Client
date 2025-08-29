import { getToken } from '@/contexts/tokenManager';
import { PostBottomSheetDTO } from '@/types/dto/PostBottomSheetDTO';
import { useEffect, useState } from 'react';
import type { RepeatConfig } from '../components/addPlan/RepeatOption';
import { SERVER_URL } from '../constants/server';
import type { AddPlanRequestEntity, PhotoInfo, RecurrenceConfig } from '../types/entity/AddPlanRequestEntity';

export type ImageFileInfo = {
  uri: string;
  type: string;
  name: string;
  size?: number;
  photoId?: number | null; // 기존 사진의 ID (새로 업로드된 사진은 undefined)
  isExisting?: boolean; // 기존 사진인지 여부
  isCover?: boolean; // 커버 이미지인지 여부
  width?: number; // 사진 너비
  height?: number; // 사진 높이
  orderNo?: number; // 사진 순서 번호
};

export type AccountInfo = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance?: number;
};

export type ImageUploadResponse = {
  url: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  objectKey: string;
};

export type AddPlanFormData = {
  // 기본 정보
  title: string;
  place: string;
  content: string;
  
  // 사진
  files: ImageFileInfo[];
  
  // 날짜/시간
  selectedYear: number; // 선택된 연도
  selectedMonth: number; // 선택된 월 (1-12)
  selectedDate: string;
  startTime: string;
  endTime: string;
  
  // 이벤트 타입
  eventType: 'group' | 'personal';
  
  // 단체 일정 참여자
  selectedFriends: { id: number; name: string; avatar: string }[];
  
  // 공개/비공개
  isPublic: boolean;
  
  // 반복 설정
  repeatConfig: RepeatConfig;
  
  // 저축 옵션
  saveOption: boolean;
  withdrawalAccount: AccountInfo | null;
  depositAccount: AccountInfo | null;
  savingAmount: string;
};

export function useModifyPlanScreen(
  planId?: number, 
  postData?: PostBottomSheetDTO,
  onModifySuccess?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddPlanFormData>({
    title: '',
    place: '',
    content: '',
    files: [],
    selectedYear: new Date().getFullYear(), // 현재 연도를 기본값으로
    selectedMonth: new Date().getMonth() + 1, // 현재 월을 기본값으로
    selectedDate: new Date().getDate().toString(), // 오늘 날짜를 기본값으로
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'personal',
    selectedFriends: [],
    isPublic: true,
    repeatConfig: {
      enabled: false,
      freq: 'WEEKLY',
      interval: 1,
      byDays: [],
      until: null,
      count: null,
      exceptions: null
    },
    saveOption: false,
    withdrawalAccount: null,
    depositAccount: null,
    savingAmount: ''
  });

  useEffect(() => {
    console.log('formData', formData);
  }, [formData]);

         // planId와 postData가 있을 때 기존 일정 데이터 가져오기
   useEffect(() => {
     if (planId && postData) {
       console.log('useModifyPlanScreen: postData로 기존 일정 데이터 설정:', postData);
       
       // 기존 사진들을 formData.files에 매핑
       const existingPhotos: any[] = [];
       
       // imageUrl과 photos를 통합하여 중복 제거
       const allPhotos = [];
       
       // 첫 번째 이미지는 imageUrl에서 로드 (커버 이미지)
       if (postData.imageUrl) {
         allPhotos.push({
           url: postData.imageUrl,
           photoId: null,
           width: 0,
           height: 0,
           isCover: true
         });
       }
       
       // photos 배열 추가
       if (postData.photos && postData.photos.length > 0) {
         allPhotos.push(...postData.photos);
       }
       
       // 중복 제거 후 순서대로 매핑
       const uniquePhotos = allPhotos.filter((photo, index, self) => 
         index === self.findIndex(p => p.url === photo.url)
       );
       
       uniquePhotos.forEach((photo: any, index: number) => {
         existingPhotos.push({
           id: photo.isCover ? 'cover_image' : `photo_${photo.photoId || index}`,
           uri: photo.url,
           type: 'image/jpeg',
           name: photo.isCover ? 'cover_image.jpg' : `photo_${index}.jpg`,
           size: 0,
           isCover: photo.isCover || false,
           photoId: photo.photoId, // 기존 photoId 보존
           isExisting: true, // 기존 이미지 표시
           orderNo: index, // 순서 번호 (0부터 시작)
           width: photo.width || 0, // 기존 사진 크기 정보
           height: photo.height || 0
         });
       });
       
       // formData.files 업데이트
       updateFormData({ files: existingPhotos });
       console.log('useModifyPlanScreen: 기존 사진 매핑 완료 (중복 제거):', existingPhotos);
     }
   }, [planId, postData]);

  const updateFormData = (updates: Partial<AddPlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleWithdrawalAccountSelect = (account: AccountInfo) => {
    updateFormData({ withdrawalAccount: account });
  };

  const handleDepositAccountSelect = (account: AccountInfo) => {
    updateFormData({ depositAccount: account });
  };

  const handleSavingAmountChange = (amount: string) => {
    // 숫자만 입력 가능하도록 필터링
    const numericAmount = amount.replace(/[^0-9]/g, '');
    updateFormData({ savingAmount: numericAmount });
  };

  const handlePhotoUpload = (files: ImageFileInfo[]) => {
    // 기존 사진들과 새로 추가된 사진들을 구분하여 처리
    const updatedFiles = files.map(file => {
      if (file.uri.startsWith('http') && !file.isExisting) {
        // 새로 추가된 사진이지만 URL이 http로 시작하는 경우 (이미 업로드된 새 사진)
        return {
          ...file,
          isExisting: false,
        };
      }
      return file;
    });
    
    updateFormData({ files: updatedFiles });
    console.log('handlePhotoUpload: 사진 업로드 처리 완료:', updatedFiles);
  };

  const handlePhotoRemove = () => {
    updateFormData({ files: [] });
  };

  // 시간 업데이트 함수들
  const handleStartTimeChange = (time: string) => {
    console.log('🕐 시작 시간 변경:', time);
    updateFormData({ startTime: time });
  };

  const handleEndTimeChange = (time: string) => {
    console.log('🕐 종료 시간 변경:', time);
    updateFormData({ endTime: time });
  };

  // 이미지 업로드 함수
  const uploadImages = async (): Promise<string[]> => {
    if (formData.files.length === 0) {
      return [];
    }

    try {
      console.log('📤 === 이미지 업로드 시작 ===');
      console.log(`총 ${formData.files.length}장의 이미지를 처리합니다.`);

      const imageUrls: string[] = [];
      const newFiles: any[] = [];

      // 이미 업로드된 이미지와 새로 추가된 이미지 분리
      formData.files.forEach((file, index) => {
        if (file.isExisting && file.uri.startsWith('http')) {
          // 기존 이미지: URL을 그대로 사용하고 photoId 정보 보존
          imageUrls.push(file.uri);
          console.log(`기존 이미지 ${index + 1}: ${file.uri} (photoId: ${file.photoId}, orderNo: ${index})`);
        } else if (!file.isExisting) {
          // 새로 추가된 이미지: 업로드 대상에 추가
          newFiles.push(file);
          console.log(`새로 추가된 이미지 ${index + 1}: ${file.uri}`);
        }
      });

      // 새로 추가된 이미지가 있는 경우에만 업로드
      if (newFiles.length > 0) {
        console.log(`새로 추가된 ${newFiles.length}장의 이미지를 업로드합니다.`);

        // FormData 생성
        const uploadFormData = new FormData();
        newFiles.forEach((file, index) => {
          uploadFormData.append('files', {
            uri: file.uri,
            type: file.type,
            name: file.name
          } as any);
        });

        // 서버로 업로드 요청
        const response = await fetch(`${SERVER_URL}/api/v1/uploads/media/direct/batch`, {
          method: 'POST',
          body: uploadFormData,
          headers: {
            'Authorization': `Bearer ${await getToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error(`업로드 실패: ${response.status} ${response.statusText}`);
        }

        const uploadResults: ImageUploadResponse[] = await response.json();
        console.log('📤 === 새 이미지 업로드 완료 ===');
        console.log('업로드된 이미지 정보:', uploadResults);

        // 새로 업로드된 URL들을 imageUrls 배열에 추가
        const newImageUrls = uploadResults.map(result => result.url);
        imageUrls.push(...newImageUrls);
        console.log('새로 업로드된 이미지 URL들:', newImageUrls);
      }

      console.log('📤 === 전체 이미지 처리 완료 ===');
      console.log('최종 이미지 URL들:', imageUrls);

      return imageUrls;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  // AddPlanRequestEntity 생성
  const createAddPlanRequest = async (): Promise<AddPlanRequestEntity> => {
    // 날짜와 시간을 YYYY-MM-DDTHH:MM:SS 형식으로 변환
    // 사용자가 선택한 연도, 월, 일을 사용
    const selectedDay = parseInt(formData.selectedDate);

    console.log(formData.selectedDate)
    
    // 시작 시간과 종료 시간을 YYYY-MM-DDTHH:MM:SS 형식으로 변환
    const startDateTime = new Date(formData.selectedDate);
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(formData.selectedDate);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // YYYY-MM-DDTHH:MM:SS 형식으로 변환하는 함수
    const formatToLocalISOString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    
         // 반복 설정을 RecurrenceConfig 형식으로 변환
     let count: number | undefined = formData.repeatConfig.count || undefined;
     
     // 반복 옵션이 활성화되어 있고 count가 설정되지 않은 경우, 종료일을 기준으로 자동 계산
     if (formData.repeatConfig.enabled && !count && formData.repeatConfig.until) {
       try {
         const startDate = new Date(formData.selectedYear, formData.selectedMonth - 1, parseInt(formData.selectedDate));
         const endDate = new Date(formData.repeatConfig.until);
         
         if (endDate > startDate) {
           // 반복 주기와 간격에 따라 count 계산
           const timeDiff = endDate.getTime() - startDate.getTime();
           const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
           
           switch (formData.repeatConfig.freq) {
             case 'DAILY':
               count = Math.floor(daysDiff / formData.repeatConfig.interval) + 1;
               break;
             case 'WEEKLY':
               count = Math.floor(daysDiff / (7 * formData.repeatConfig.interval)) + 1;
               break;
             case 'MONTHLY':
               count = Math.floor(daysDiff / (30 * formData.repeatConfig.interval)) + 1;
               break;
             case 'YEARLY':
               count = Math.floor(daysDiff / (365 * formData.repeatConfig.interval)) + 1;
               break;
             default:
               count = 1;
           }
           
           console.log('📅 반복 횟수 자동 계산:', {
             startDate: startDate.toISOString(),
             endDate: endDate.toISOString(),
             freq: formData.repeatConfig.freq,
             interval: formData.repeatConfig.interval,
             calculatedCount: count
           });
         }
       } catch (error) {
         console.error('반복 횟수 계산 오류:', error);
         count = 1; // 오류 시 기본값
       }
     }
     
     const recurrenceConfig: RecurrenceConfig = {
       enabled: formData.repeatConfig.enabled,
       freq: formData.repeatConfig.freq as any,
       interval: formData.repeatConfig.interval,
       byDays: formData.repeatConfig.byDays as any,
       count: count,
       exceptions: formData.repeatConfig.exceptions || undefined
     };
    
    // 이미지 업로드 처리
    let imageUrls: string[] = [];
    if (formData.files.length > 0) {
      try {
        imageUrls = await uploadImages();
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw new Error('이미지 업로드에 실패했습니다.');
      }
    }

                                       // 사진 정보를 올바른 구조로 구성 (커버 이미지 제외)
       const photos: PhotoInfo[] = formData.files
         .filter((file, index) => index > 1) // 0번째(커버 이미지) 제외
         .map((file, index) => {
           if (file.isExisting && file.photoId) {
             // 기존 사진: photoId, url, width, height, orderNo 포함
             return {
               photoId: file.photoId,
               url: file.uri,
               width: file.width || 0,
               height: file.height || 0,
               orderNo: index // 원래 인덱스 유지
             };
           } else {
             // 새로 업로드된 사진: url, orderNo만 포함 (photoId 없음)
             return {
               url: file.uri,
               orderNo: index // 원래 인덱스 유지
             };
           }
         });

     // AddPlanRequestEntity 생성
     const requestEntity: AddPlanRequestEntity = {
       type: formData.eventType === 'group' ? 'GROUP' : 'PERSONAL',
       privacyLevel: formData.eventType === 'group' 
         ? (formData.isPublic ? 'GROUP_PUBLIC' : 'GROUP_PRIVATE')
         : (formData.isPublic ? 'PERSONAL_PUBLIC' : 'PERSONAL_PRIVATE'),
       title: formData.title || '',
       content: formData.content || '',
       place: formData.place || '',
       imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined, // 첫 번째 URL을 대표 이미지로
       startTime: formatToLocalISOString(startDateTime),
       endTime: formatToLocalISOString(endDateTime),
       hasSavingsGoal: formData.saveOption,
       savingsAmount: formData.saveOption && formData.savingAmount ? parseInt(formData.savingAmount) : null,
       depositAccountNo: formData.saveOption && formData.depositAccount ? formData.depositAccount.accountNumber : null,
       withdrawalAccountNo: formData.saveOption && formData.withdrawalAccount ? formData.withdrawalAccount.accountNumber : null,
       participantIds: formData.eventType === 'group' ? formData.selectedFriends.map(friend => friend.id.toString()) : null,
       photos: photos, // 구조화된 사진 정보 배열
       recurrence: recurrenceConfig
     };
    
    return requestEntity;
  };

  // CommentInput 참고하여 FormData 생성
  const createFormData = () => {
    const planFormData = new FormData();
    
    // 기본 정보 추가
    planFormData.append('title', formData.title || '');
    planFormData.append('place', formData.place || '');
    planFormData.append('content', formData.content || '');
    planFormData.append('selectedDate', formData.selectedDate || '');
    planFormData.append('startTime', formData.startTime || '');
    planFormData.append('endTime', formData.endTime || '');
    planFormData.append('eventType', formData.eventType || 'personal');
    planFormData.append('isPublic', (formData.isPublic || false).toString());
    planFormData.append('repeatConfig', JSON.stringify(formData.repeatConfig || {}));
    planFormData.append('saveOption', (formData.saveOption || false).toString());
    
    if (formData.saveOption) {
      if (formData.withdrawalAccount) {
        planFormData.append('withdrawalAccount', JSON.stringify(formData.withdrawalAccount));
      }
      if (formData.depositAccount) {
        planFormData.append('withdrawalAccount', JSON.stringify(formData.depositAccount));
      }
      planFormData.append('savingAmount', formData.savingAmount || '');
    }
    
    // 이미지 파일들 추가 (CommentInput 방식 참고)
    if (formData.files && formData.files.length > 0) {
      formData.files.forEach((file, index) => {
        planFormData.append(`files`, {
          uri: file.uri,
          type: file.type,
          name: file.name
        } as any);
      });
    }
    
    return planFormData;
  };

  const handleModifyPlan = async () => {
    setIsLoading(true);
    console.log('🚀 === 일정 추가하기 버튼 클릭 === 🚀');
    console.log('');
    
    console.log('📝 === 기본 정보 ===');
    console.log('제목:', formData.title);
    console.log('장소:', formData.place);
    console.log('내용:', formData.content);
    console.log('');
    
    console.log('📸 === 사진 정보 ===');
    if (formData.files.length > 0) {
      console.log(`총 ${formData.files.length}장의 사진이 선택되었습니다.`);
      formData.files.forEach((file, index) => {
        console.log(`사진 ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : '크기 정보 없음',
          uri: file.uri
        });
      });
    } else {
      console.log('선택된 사진이 없습니다.');
    }
    console.log('');
    
    console.log('📅 === 날짜/시간 정보 ===');
    console.log('연도:', formData.selectedYear);
    console.log('월:', formData.selectedMonth);
    console.log('날짜:', formData.selectedDate);
    console.log('시작 시간:', formData.startTime);
    console.log('종료 시간:', formData.endTime);
    console.log('');
    
    console.log('🎯 === 이벤트 설정 ===');
    console.log('일정 유형:', formData.eventType === 'group' ? 'GROUP (단체 일정)' : 'PERSONAL (개인 일정)');
    console.log('공개 여부:', formData.isPublic ? '공개' : '비공개');
    console.log('Privacy Level:', formData.eventType === 'group' 
      ? (formData.isPublic ? 'GROUP_PUBLIC' : 'GROUP_PRIVATE')
      : (formData.isPublic ? 'PERSONAL_PUBLIC' : 'PERSONAL_PRIVATE'));
    console.log('');
    
    console.log('🔄 === 반복 설정 ===');
    console.log('반복 활성화:', formData.repeatConfig.enabled ? '✅ 활성화' : '❌ 비활성화');
    if (formData.repeatConfig.enabled) {
      console.log('반복 주기:', formData.repeatConfig.freq);
      console.log('반복 간격:', formData.repeatConfig.interval);
      console.log('반복 요일:', formData.repeatConfig.byDays);
      console.log('종료일:', formData.repeatConfig.until);
      console.log('반복 횟수:', formData.repeatConfig.count);
      console.log('예외일:', formData.repeatConfig.exceptions);
    }
    console.log('');
    
    console.log('💰 === 저축 옵션 ===');
    console.log('저축 옵션:', formData.saveOption ? '✅ 활성화' : '❌ 비활성화');
    if (formData.saveOption) {
      console.log('출금계좌:', formData.withdrawalAccount ? 
        `${formData.withdrawalAccount.bankName} - ${formData.withdrawalAccount.accountNumber}` : '선택되지 않음');
      console.log('입금계좌:', formData.depositAccount ? 
        `${formData.depositAccount.bankName} - ${formData.depositAccount.accountNumber}` : '선택되지 않음');
      console.log('저축금액:', formData.savingAmount ? `${Number(formData.savingAmount).toLocaleString()}원` : '0원');
    }
    console.log('');
    
    console.log('🔧 === FormData 생성 ===');
    const planFormData = createFormData();
    console.log('FormData 객체 생성 완료!');
    
    // FormData 내용을 자세히 출력
    console.log('📋 FormData 내용:');
    console.log('FormData 객체가 생성되었습니다. (React Native에서는 entries() 메서드를 지원하지 않습니다)');
    console.log('');
    
    console.log('🚀 === AddPlanRequestEntity 생성 ===');
    let requestEntity: AddPlanRequestEntity;
    try {
      requestEntity = await createAddPlanRequest();
      console.log('AddPlanRequestEntity 객체 생성 완료!');
      console.log('📋 Request Entity 내용:');
      console.log(JSON.stringify(requestEntity, null, 2));
      console.log('');
    } catch (error) {
      console.error('❌ AddPlanRequestEntity 생성 실패:', error);
      return;
    }
    
    console.log('📊 === 전체 데이터 요약 ===');
    console.log('제목 길이:', formData.title.length, '자');
    console.log('내용 길이:', formData.content.length, '자');
    console.log('사진 개수:', formData.files.length, '장');
    console.log('저축 옵션:', formData.saveOption ? '활성화' : '비활성화');
    console.log('반복 설정:', formData.repeatConfig.enabled ? '활성화' : '비활성화');
    console.log('');
    
    console.log('✅ === 일정 추가 준비 완료 ===');
    console.log('이제 서버로 전송할 준비가 되었습니다!');
    console.log('');
    
    // TODO: 실제 API 호출 로직 추가
    // 여기에 서버로 데이터를 전송하는 로직을 추가할 예정
    try {
      console.log('📤 === 서버로 전송할 데이터 ===');
      console.log(JSON.stringify(requestEntity, null, 2));
      
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify(requestEntity),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`일정 추가 실패: ${response.status} ${response.statusText}`);
      }
      
             const responseData = await response.json();
       console.log('📤 === 일정 수정 완료 ===');
       console.log('응답 데이터:', responseData);
       
       // 성공 시 로딩 해제
       setIsLoading(false);
       
       // 수정 성공 시 PostBottomSheet refresh 콜백 호출
       if (onModifySuccess) {
         onModifySuccess();
       }
       
       return { success: true, data: responseData };
    } catch (error) {
      console.error('❌ 일정 추가 실패:', error);
      setIsLoading(false);
      return { success: false, error };
    }
  };

  return {
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
    uploadImages,
    createFormData,
    createAddPlanRequest,
    handleModifyPlan
  };
}
