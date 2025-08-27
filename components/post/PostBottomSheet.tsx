import { usePostBottomSheet } from '@/hooks/usePostBottomSheet';
import type { PlanEntity } from "@/types/entity/PlanEntity";
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import PostHeader from './PostHeader';

const dummyComments = [
  { id: '1', user: '송성현', time: '3시간 전', text: '오 벌써 운동운동하는 날이야?' },
  { id: '2', user: '정원석', time: '2시간 전', text: '이번엔 작심삼일 아니지? ㅋㅋ' },
  { id: '3', user: '김철수', time: '1시간 전', text: '운동 화이팅!' },
  { id: '4', user: '이영희', time: '30분 전', text: '저도 같이 할까요?' },
  { id: '5', user: '박민수', time: '20분 전', text: '오늘 날씨가 좋네요' },
  { id: '6', user: '최지영', time: '15분 전', text: '건강한 하루 되세요' },
  { id: '7', user: '강동원', time: '10분 전', text: '운동은 꾸준함이 최고' },
  { id: '8', user: '윤서연', time: '5분 전', text: '저도 운동하고 싶어요' },
  { id: '9', user: '한지민', time: '방금 전', text: '오늘도 파이팅!' },
  { id: '10', user: '송혜교', time: '방금 전', text: '건강한 모습 멋져요' },
  { id: '11', user: '김태희', time: '방금 전', text: '운동 루틴 공유해주세요' },
  { id: '12', user: '전지현', time: '방금 전', text: '오늘도 힘내세요!' },
  { id: '13', user: '손예진', time: '방금 전', text: '건강한 하루 되세요' },
  { id: '14', user: '김혜수', time: '방금 전', text: '운동은 꾸준함이 최고예요' },
  { id: '15', user: '한가인', time: '방금 전', text: '오늘도 파이팅!' },
  { id: '16', user: '이효리', time: '방금 전', text: '건강한 모습 멋져요' },
  { id: '17', user: '보아', time: '방금 전', text: '운동 루틴 공유해주세요' },
  { id: '18', user: '아이유', time: '방금 전', text: '오늘도 힘내세요!' },
  { id: '19', user: '태연', time: '방금 전', text: '건강한 하루 되세요' },
  { id: '20', user: '윤아', time: '방금 전', text: '운동은 꾸준함이 최고예요' },
  { id: '21', user: '수영', time: '방금 전', text: '오늘도 파이팅!' },
  { id: '22', user: '효연', time: '방금 전', text: '건강한 모습 멋져요' },
  { id: '23', user: '서현', time: '방금 전', text: '운동 루틴 공유해주세요' },
  { id: '24', user: '티파니', time: '방금 전', text: '오늘도 힘내세요!' },
];

type Props = {
    plan: PlanEntity,
    onClose: () => void;
};

export default function PostBottomSheet({
    plan,
    onClose
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['35%', '70%', '95%'], []);
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const footerHeightRef = useRef(0);
  
  // usePostBottomSheet 훅 사용
  const { planDetail, isLoadingDetail } = usePostBottomSheet();

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onDismiss={onClose}
      // 입력창은 항상 표시
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backdropComponent={(props) => {
        return (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
            />
            );
        }}
        footerComponent={(footerProps) => (
          <BottomSheetFooter {...footerProps} bottomInset={insets.bottom}>
            <View
              style={styles.footer}
              onLayout={(e: any) => {
                // ✅ 푸터 실제 높이 + safe area inset 을 합산
                const measured = e.nativeEvent.layout.height;
                const h = measured + insets.bottom;   // <- 핵심
                if (Math.abs(footerHeightRef.current - h) > 1) {
                  footerHeightRef.current = h;
                  setFooterHeight(h);
                }
              }}
            >
              <CommentInput onFocusExpand={() => sheetRef.current?.snapToIndex(1)} />
            </View>
          </BottomSheetFooter>
        )}
      >
        <BottomSheetScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: footerHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          scrollIndicatorInsets={{ bottom: footerHeight}}
          bounces={true}
        >
          <PostHeader 
            plan={plan} 
            planDetail={planDetail}
            isLoadingDetail={isLoadingDetail}
            images={planDetail?.photos?.map(photo => photo.url) || []} 
            description={planDetail?.content || '설명 없음'} 
            user={{ id: 1, name: '조현우', email: 'me@example.com', imageUrl: null }} 
            loggedUser={{ id: 1, name: '조현우', email: 'me@example.com', imageUrl: null }}
          />
          
                     {dummyComments.map((item) => (
             <CommentItem 
               key={item.id} 
               {...item} 
               loggedUser={{ id: 1, name: '조현우', email: 'me@example.com', imageUrl: null }}
               isAfterPlanEnd={planDetail?.completed}
             />
           ))}
        </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  sheetContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    minHeight: 0,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
});
