import type { PlanEntity } from "@/types/entity/PlanEntity";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    >
      <BottomSheetView style={styles.sheetContent}>
        <BottomSheetScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: footerHeight + 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          bounces={true}
        >
          <PostHeader />
          {dummyComments.map((item) => (
            <CommentItem key={item.id} {...item} />
          ))}
        </BottomSheetScrollView>
        <View
          style={[styles.footer, { paddingBottom: 8 + insets.bottom }]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height + 8; // include shadow/spacing
            if (Math.abs(footerHeightRef.current - h) > 1) {
              footerHeightRef.current = h;
              setFooterHeight(h);
            }
          }}
        >
          <CommentInput onFocusExpand={() => sheetRef.current?.snapToIndex(1)} />
        </View>
      </BottomSheetView>
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
    minHeight: 0,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
});
