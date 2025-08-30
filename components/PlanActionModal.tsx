import { SERVER_URL } from '@/constants/server';
import { getToken } from '@/contexts/tokenManager';
import { PlanEntity } from '@/types/entity/PlanEntity';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface PlanActionModalProps {
  visible: boolean;
  plan: PlanEntity | null;
  actionType: 'complete' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
}

interface AccountInfo {
  accountNo: string;
  accountBalance: number;
  accountName: string;
  authenticated: boolean;
}

export default function PlanActionModal({
  visible,
  plan,
  actionType,
  onConfirm,
  onCancel,
}: PlanActionModalProps) {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // 계좌 목록 가져오기
  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const response = await fetch(`${SERVER_URL}/api/v1/account/simpleList`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`계좌 목록 조회 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAccounts(data);
      console.log('!!!!!계좌 목록 조회 성공:', data);
    } catch (error) {
      console.error('계좌 목록 조회 실패:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // 계좌 번호를 별칭으로 변환하는 함수
  const getAccountAlias = (accountNumber: string): string => {
    const account = accounts.find(acc => acc.accountNo === accountNumber);
    return account ? account.accountName : accountNumber;
  };

  useEffect(() => {
      fetchAccounts();
  }, []);

  if (!plan) return null;

  const getModalTitle = () => {
    return actionType === 'complete' ? '일정 완료' : '일정 삭제';
  };

  const getModalMessage = () => {
    if (actionType === 'delete') {
      return '정말로 이 일정을 삭제하시겠습니까?';
    }

    // 완료 액션인 경우
    if (plan.hasSavingsGoal) {
      const withdrawalAccountAlias = plan.withDrawAccountNo ? getAccountAlias(plan.withDrawAccountNo) : '출금계좌';
      const depositAccountAlias = plan.depositAccountNo ? getAccountAlias(plan.depositAccountNo) : '입금계좌';
      const amount = plan.savingsAmount ? `${plan.savingsAmount.toLocaleString()}원` : '저축금액';
      
      return `저축 일정을 완료했습니다.\n[${withdrawalAccountAlias}]에서 [${depositAccountAlias}]로 ${amount}만큼 입금하시겠습니까?`;
    } else {
      return '정말로 이 일정을 완료하시겠습니까?';
    }
  };

  const getConfirmButtonText = () => {
    if (actionType === 'delete') {
      return '삭제';
    }
    return plan.hasSavingsGoal ? '입금' : '완료';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.handleBar} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{getModalMessage()}</Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnGhost]}
                onPress={onCancel}
                activeOpacity={0.9}
              >
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnPrimary]}
                onPress={onConfirm}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryText}>{getConfirmButtonText()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: '#F3F4F6',
  },
  btnPrimary: {
    backgroundColor: '#8C93FF',
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
