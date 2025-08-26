import { useUser } from '@/contexts/UserContext';
import type { UserDTO } from '@/types/dto';
import type { PostBottomSheetDTO } from '@/types/dto/PostBottomSheetDTO';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import UserProfile from '../ui/UserProfile';

type Props = {
  postData: PostBottomSheetDTO;
};

export default function PostHeader({ postData }: Props) {
  const [current, setCurrent] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const {loggedUser} = useUser();
  
  // imageUrl을 첫 번째로, photos를 그 다음에 추가
  const images = useMemo(() => {
    const imageArray = [];
    if (postData.imageUrl) {
      imageArray.push(postData.imageUrl);
    }
    if (postData.photos && postData.photos.length > 0) {
      imageArray.push(...postData.photos.map(photo => photo.url));
    }
    return imageArray;
  }, [postData.imageUrl, postData.photos]);

  useEffect(() => {
    console.log('[PostHeader] postData : ', postData);
  }, [postData]);
  
  const hasImages = images.length > 0;
  const imagesWithFallback = useMemo(() => {
    if (hasImages) return images;
    return [];
  }, [hasImages, images]);
  const defaultUser = useMemo<UserDTO>(() => ({ id: 0, name: '조현우', email: 'unknown@example.com', imageUrl: null }), []);

  return (
    <View style={styles.wrapper}>
      {/* 작성자 영역 */}
      <View style={styles.headerRow}>
        <View style={styles.writerRow}>
          <UserProfile user={postData.authorDTO || defaultUser} size={40} showName={false} />
          <View>
            <Text style={styles.name}>{(postData.authorDTO || defaultUser).name}</Text>
            <Text style={styles.time}>5시간 전</Text>
          </View>
        </View>
        {postData.authorDTO.id === loggedUser?.userId && (
          <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
        )}
      </View>

      {/* 본문 레이아웃 */}
      <View style={[styles.contentRow, !hasImages && styles.contentRowNoImage]}>
        {/* 좌측: 이미지 캐러셀 (이미지가 있을 때만) */}
        {hasImages && (
          <View style={styles.leftCol}>
            <View
              style={styles.imageBox}
              onLayout={(e) => setImageWidth(e.nativeEvent.layout.width)}
            >
              <FlatList
                data={imagesWithFallback}
                keyExtractor={(_, idx) => String(idx)}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={[styles.postImage, { width: imageWidth }]} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                onMomentumScrollEnd={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const idx = Math.round(imageWidth > 0 ? x / imageWidth : 0);
                  if (idx !== current) setCurrent(idx);
                }}
              />
              <View style={styles.carouselBadge}>
                <Text style={styles.carouselBadgeText}>{`${current + 1}/${imagesWithFallback.length}`}</Text>
              </View>
              <View style={styles.dotsRow}>
                {imagesWithFallback.map((_, i) => (
                  <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 우측: 일정 정보 카드 + 상세 카드 */}
        <View style={[styles.rightCol, !hasImages && styles.rightColNoImage]}>
          <View style={[
            styles.card, 
            postData.isCompleted ? styles.completedInfoCard : styles.infoCard
          ]}>
            {/* 완료된 일정 표시 배지 */}
            {postData.isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>종료된 일정</Text>
              </View>
            )}
            
            <Text style={[
              styles.cardTitle,
              postData.isCompleted && styles.completedCardTitle
            ]}>
              {postData.title}
            </Text>
            <View style={styles.placeRow}>
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={postData.isCompleted ? "#999" : "#3B3B3B"} 
              />
              <Text style={[
                styles.placeText,
                postData.isCompleted && styles.completedPlaceText
              ]}>
                {postData.place}
              </Text>
            </View>
          </View>

          <View style={[styles.card, styles.descCard]}>
            <Text style={styles.descText} numberOfLines={5}>
              {postData.content || '설명 없음'}
            </Text>
          </View>
        </View>
      </View>

      {/* 댓글 헤더: 회색 구분선 + 댓글 수 */}
      <View style={styles.commentHeader}>
        <View style={styles.separator} />
        <View style={styles.commentCountRow}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentCountText}>{postData.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  writerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  name: { fontWeight: '700', fontSize: 13 },
  time: { fontSize: 11, color: '#777' },

  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contentRowNoImage: {
    flexDirection: 'column',
    gap: 12,
  },
  leftCol: {
    flex: 1.4,
  },
  rightCol: {
    flex: 1,
    gap: 12,
  },
  rightColNoImage: {
    flex: 1,
    gap: 12,
  },

  imageBox: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    height: 160,
  },
  postImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  carouselBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  carouselBadgeText: { color: '#fff', fontSize: 12 },
  dotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#6C5CE7',
  },

  card: {
    borderRadius: 12,
    padding: 10,
  },
  infoCard: {
    backgroundColor: '#E5E4FF',
  },
  completedInfoCard: {
    backgroundColor: '#F5F5F5',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completedCardTitle: {
    color: '#999',
  },
  completedPlaceText: {
    color: '#999',
  },
  descCard: {
    backgroundColor: '#EEF2F6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  placeText: { fontSize: 12, color: '#3B3B3B' },
  descText: { fontSize: 12, color: '#333' },
  commentHeader: { marginTop: 8 },
  separator: { height: 1, backgroundColor: '#EDEDED', marginBottom: 6 },
  commentCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentCountText: { color: '#333', fontSize: 12 },
});
