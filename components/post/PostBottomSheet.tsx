import { SERVER_URL } from "@/constants/server";
import { getToken } from "@/contexts/tokenManager";
import { useUser } from "@/contexts/UserContext";
import { useMohaeyoung } from "@/hooks/useMohaeyoungScreen";
import { usePostBottomSheet } from "@/hooks/usePostBottomSheet";
import type { PostBottomSheetDTO } from "@/types/dto/PostBottomSheetDTO";
import type { UserDTO } from "@/types/dto/UserDTO";
import type { PlanEntity } from "@/types/entity/PlanEntity";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import PostHeader from "./PostHeader";

type Props = {
  plan?: PlanEntity;
  postData?: PostBottomSheetDTO;
  friends?: UserDTO[];
  onClose: () => void;
  onEdit?: (planId: number) => void;
  onDelete?: (planId: number) => void;
};

export default function PostBottomSheet({ 
  plan, 
  postData, 
  friends = [], 
  onClose,
  onEdit,
  onDelete 
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["40%", "75%", "95%"], []);
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const footerHeightRef = useRef(0);

  // usePostBottomSheet 훅 사용
  const router = useRouter();
  const { comments, isLoadingComments, fetchComments } = usePostBottomSheet();
  const { refetch, fetchPlans, refreshUserPlans } = useMohaeyoung();
  const { loggedUser } = useUser();

  // 컴포넌트 마운트 시 댓글 가져오기
  useEffect(() => {
    if (plan?.planId) {
      fetchComments(plan.planId);
    }
  }, [plan?.planId]);

  // 디버깅
  useEffect(() => {
    console.log("[PostBottomSheet] === 댓글 정보 ===");
    console.log("comments length:", comments?.length || 0);
  }, [comments]);

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const handleEdit = () => {
    if (postData) {
      // PostBottomSheetDTO 정보를 ModifyPlanScreen으로 전달
      router.push({
        pathname: '/modify-plan',
        params: {
          postData: JSON.stringify(postData),
          planId: postData.planId,
          title: postData.title,
          content: postData.content,
          place: postData.place,
          startTime: postData.startTime,
          endTime: postData.endTime,
          privacyLevel: postData.privacyLevel,
          type: postData.type,
          participantIds: JSON.stringify(postData.participantIds || []),
          hasSavingsGoal: postData.hasSavingsGoal ? 'true' : 'false',
          savingsAmount: postData.savingsAmount?.toString() || '',
          imageUrl: postData.imageUrl || '',
          photos: JSON.stringify(postData.photos || [])
        }
      });
      
      // onEdit 콜백이 있으면 호출하여 refresh 트리거
      if (onEdit) {
        onEdit(postData.planId);
      }
      
      onClose();
    }
  };

  const handleDelete = async () => {
    if (postData?.planId) {
      try {
        const response = await fetch(`${SERVER_URL}/api/v1/plans/${postData.planId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${await getToken()}`
          },
        });
        

        
        const responseData = await response;
        console.log('📤 === 일정 삭제 완료 ===');
        console.log('응답 데이터:', response.status);
        
                // 성공 시 로딩 해제
        console.log('loggedUser?.userId:', loggedUser?.userId);
        
        // 현재 사용자의 plan 데이터를 새로고침하여 MohaeyoungScreen 재렌더링
        await refreshUserPlans(loggedUser?.userId || 0);
        // 잠시 대기 후 전체 데이터도 새로고침
        setTimeout(() => {
          refetch();
        }, 200);
        
        onClose();
      } catch (error) {
        console.error('❌ 일정 삭제 실패:', error);
      }
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onDismiss={onClose}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
      )}
      footerComponent={(footerProps) => (
        <BottomSheetFooter {...footerProps} bottomInset={insets.bottom}>
          <View
            style={styles.footer}
            onLayout={(e: any) => {
              const measured = e.nativeEvent.layout.height;
              const h = measured + insets.bottom;
              if (Math.abs(footerHeightRef.current - h) > 1) {
                footerHeightRef.current = h;
                setFooterHeight(h);
              }
            }}
          >
            <CommentInput
              onFocusExpand={() => {
                sheetRef.current?.snapToIndex(2);
                setTimeout(() => {
                  sheetRef.current?.snapToIndex(2);
                }, 100);
              }}
              planId={postData?.planId}
              onCommentSent={() => {
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
        contentContainerStyle={{ paddingBottom: footerHeight, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        scrollIndicatorInsets={{ bottom: footerHeight }}
        bounces={true}
        keyboardDismissMode="none"
        nestedScrollEnabled={true}
      >
        {postData && (
          <PostHeader 
            postData={postData} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {isLoadingComments ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>댓글을 불러오는 중...</Text>
          </View>
        ) : comments && comments.length > 0 ? (
          [...comments]
            .reverse()
            .map((item, index) => (
              <CommentItem
                key={item.id}
                id={item.id}
                comment={item}
                userDTO={item.userDTO}
                time={item.time}
                text={item.text}
                isAfterPlanEnd={postData?.isCompleted}
              />
            ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🫧</Text>
            <Text style={styles.emptyTitle}>댓글을 달아보세요!</Text>
            <Text style={styles.emptyDesc}>첫 번째 댓글의 주인공이 되어보세요 ✨</Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyWrap: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
});
