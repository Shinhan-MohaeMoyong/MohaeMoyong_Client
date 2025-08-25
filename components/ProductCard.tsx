import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  productName: string;
  productDescription: string;
  bankName: string;
  bankLogo: string;
  isExclusive?: boolean;
  exclusiveNote?: string;
  preferentialNote?: string;
  onPress: () => void;
}

export default function ProductCard({
  productName,
  productDescription,
  bankName,
  bankLogo,
  isExclusive = false,
  exclusiveNote,
  preferentialNote,
  onPress
}: ProductCardProps) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // 상품설명 팝업 표시
  const handleHelpPress = () => {
    setShowDescriptionModal(true);
  };

  // 상품설명 팝업 닫기
  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => {
          console.log('ProductCard onPress 호출됨:', productName); // 디버깅 로그 추가
          onPress();
        }} 
        activeOpacity={0.8}
      >
        {/* 왼쪽: 은행 로고 */}
        <View style={styles.bankLogoContainer}>
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>{bankLogo}</Text>
          </View>
          <Text style={styles.bankName}>{bankName}</Text>
        </View>

        {/* 오른쪽: 상품 정보 */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productDescription}>{productDescription}</Text>
          
          {isExclusive && (
            <View style={styles.notesContainer}>
              <Text style={styles.noteText}>• {exclusiveNote}</Text>
              <Text style={styles.noteText}>• {preferentialNote}</Text>
            </View>
          )}
        </View>

        {/* 오른쪽 상단: 물음표 아이콘 */}
        <TouchableOpacity 
          style={styles.helpIcon} 
          onPress={(e) => {
            e.stopPropagation(); // 이벤트 전파 중단
            console.log('물음표 아이콘 클릭됨:', productName); // 디버깅 로그 추가
            handleHelpPress();
          }}
        >
          <Text style={styles.helpIconText}>?</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 상품설명 팝업 모달 */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDescriptionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{productName}</Text>
              <TouchableOpacity onPress={closeDescriptionModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>{productDescription}</Text>
              
              {isExclusive && (
                <View style={styles.modalNotesContainer}>
                  <Text style={styles.modalNoteTitle}>상품 특징:</Text>
                  <Text style={styles.modalNoteText}>• {exclusiveNote}</Text>
                  <Text style={styles.modalNoteText}>• {preferentialNote}</Text>
                </View>
              )}
              
              <View style={styles.modalBankInfo}>
                <Text style={styles.modalBankTitle}>은행 정보:</Text>
                <Text style={styles.modalBankText}>{bankName}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bankLogoContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  bankLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  notesContainer: {
    gap: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  helpIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#A78BFA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  helpIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalNotesContainer: {
    marginBottom: 16,
  },
  modalNoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalNoteText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalBankInfo: {
    marginTop: 16,
  },
  modalBankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalBankText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
