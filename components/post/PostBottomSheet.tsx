import { usePostBottomSheet } from '@/hooks/usePostBottomSheet';
import type { PostBottomSheetDTO } from "@/types/dto/PostBottomSheetDTO";
import type { UserDTO } from "@/types/dto/UserDTO";
import type { PlanEntity } from "@/types/entity/PlanEntity";
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import PostHeader from './PostHeader';



type Props = {
    plan?: PlanEntity,
    postData?: PostBottomSheetDTO,
    friends?: UserDTO[],
    onClose: () => void;
};

export default function PostBottomSheet({
    plan,
    postData,
    friends = [],
    onClose
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%', '75%', '95%'], []);
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const footerHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // usePostBottomSheet 훅 사용
  const { comments, postBottomSheetData, isLoadingDetail, isLoadingComments, fetchComments } = usePostBottomSheet();

  // 컴포넌트 마운트 시 댓글 가져오기
  useEffect(() => {
    if (plan?.planId) {
      fetchComments(plan.planId);
    }
  }, [plan?.planId]);

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('[PostBottomSheet] === 댓글 정보 ===');
    console.log('comments length:', comments?.length || 0);
    console.log('comments:', JSON.stringify(comments, null, 2));
  }, [comments]);




  useEffect(() => {
    sheetRef.current?.present();
    console.log('[In Postbottmsheet] === 댓글 정보 변환 결과 ===');
    console.log(JSON.stringify(comments, null, 2));
  }, []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onDismiss={onClose}
      // 키보드 관련 설정 개선
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
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
                             <CommentInput 
                 onFocusExpand={() => {
                   // 키보드가 올라올 때 BottomSheet를 최대 높이로 확장하여 스크롤 가능하게 함
                   sheetRef.current?.snapToIndex(2);
                 }}
                 planId={postData?.planId}
                 onCommentSent={() => {
                   // 댓글 전송 후 댓글 목록 새로고침
                   if (postData?.planId) {
                     fetchComments(postData.planId);
                   }
                 }}
               />
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
           keyboardDismissMode="interactive"
           nestedScrollEnabled={true}
         >
                                           {postData && (
                            <PostHeader 
                 
                            postData={postData}
                            />
            )}
          
                                                                                     {isLoadingComments ? (
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>댓글을 불러오는 중...</Text>
               </View>
             ) : comments && comments.length > 0 && (
               [...comments].reverse().map((item) => (
                 <CommentItem 
                   key={item.id} 
                   id={item.id}
                   userDTO={item.userDTO}
                   time={item.time}
                   text={item.text}
                   isAfterPlanEnd={postData?.isCompleted}
                 />
               ))
             )}
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
  },
});
