import type { PlanEntity } from '@/types/entity/PlanEntity';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PlanDetailView from './PlanDetailView';

// TODO: @gorhom/bottom-sheet 패키지 설치 후 아래 주석 해제

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.4;
const DRAG_THRESHOLD = 100; // 드래그 임계값

type Props = {
  isVisible: boolean;
  onClose: () => void;
  selectedPlan: PlanEntity | null;
};

export default function BottomSheet({ 
  isVisible, 
  onClose, 
  selectedPlan 
}: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: 0,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // 위로 드래그는 제한
        if (gestureState.dy < 0) {
          pan.y.setValue(0);
        } else {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        // 드래그 거리가 임계값을 넘으면 닫기
        if (gestureState.dy > DRAG_THRESHOLD) {
          Animated.timing(pan.y, {
            toValue: BOTTOM_SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            // 애니메이션 완료 후 초기값으로 리셋
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // 원래 위치로 돌아가기
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!isVisible || !selectedPlan) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [
              { translateY: pan.y },
            ],
          },
        ]}
      >
        {/* 핸들 바 - 드래그 가능 */}
        <View 
          style={styles.handle}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleBar} />
        </View>
        
        {/* 닫기 버튼 */}
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* PlanDetailView */}
        <PlanDetailView plan={selectedPlan} />
      </Animated.View>
    </View>
  );
}

// TODO: @gorhom/bottom-sheet 사용 시 아래 코드로 교체
/*
export default function BottomSheet({ 
  isVisible, 
  onClose, 
  selectedPlan 
}: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismiss = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    onClose();
  }, [onClose]);

  if (!isVisible || !selectedPlan) return null;

  React.useEffect(() => {
    if (isVisible) {
      handlePresentModalPress();
    }
  }, [isVisible, handlePresentModalPress]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['50%']}
      onDismiss={handleDismiss}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <PlanDetailView plan={selectedPlan} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
*/

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: BOTTOM_SHEET_HEIGHT,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  // TODO: @gorhom/bottom-sheet 사용 시 아래 스타일 사용
  /*
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  */
});
