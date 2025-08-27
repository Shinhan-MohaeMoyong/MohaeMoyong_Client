import { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AccountDTO } from '../types/dto/AccountDTO';
import { MonthlySavingDTO } from '../types/dto/SavingDTO';
import AccountCard from './AccountCard';

interface SavingInfoProps {
  accountNumber: string;
  balance: string; // 포맷된 잔액
  accountAlias: string;
  monthlySavings: MonthlySavingDTO[];
  achievementRate: number;
  encouragementMessage: string;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SavingInfo({
  accountNumber,
  balance,
  accountAlias,
  monthlySavings,
  achievementRate,
  encouragementMessage,
  onPress
}: SavingInfoProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<{date: string, amount: number} | null>(null);
  // 최근 7일의 날짜 생성
  const getRecentDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const recentDates = getRecentDates();

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 일별 저축 금액의 최대값 계산
  const maxAmount = Math.max(...monthlySavings.map(s => s.amount));



  // AccountCard용 DTO 생성
  const accountDTO: AccountDTO = {
    id: accountNumber,
    accountNumber: accountNumber,
    balance: balance,
    accountAlias: accountAlias,
    bankName: '신한은행', // 기본값
    bankLogo: '신한은행',
    maskedAccountNumber: accountNumber.replace(/(\d{3})-(\d{3})-(\d{6})/, '$1-***-$3'),
    isNew: false,
    createdAt: new Date(),
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* 계좌 정보 카드 */}
      <AccountCard
        account={accountDTO}
        onPress={onPress || (() => {})}
      />

             {/* 주간 저축 현황 그래프 */}
       <View style={styles.graphContainer}>
         <Text style={styles.graphTitle}>주간 저축 현황</Text>
         <Text style={styles.maxAmountText}>최대 저축액 : {maxAmount.toLocaleString()}원</Text>
        
                 {/* 막대 그래프 */}
         <View style={styles.graphContent}>
           {/* 막대 그래프 */}
           <View style={styles.barsContainer}>
                         {monthlySavings.map((saving, index) => (
               <View key={index} style={styles.barItem}>
                 <View style={styles.barContainer}>
                                       <TouchableOpacity
                      onPress={() => {
                        const date = recentDates[index] ? formatDate(recentDates[index]) : `${saving.week}주차`;
                        setSelectedSaving({ date, amount: saving.amount });
                        setModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                                           
                      <View
                                                 style={[
                           styles.bar,
                                                                           {
                           height: (saving.amount / maxAmount) * 240,
                           backgroundColor: '#A78BFA',
                         },
                         ]}
                      />

                   </TouchableOpacity>
                 </View>
                 <Text style={styles.weekLabel}>
                   {recentDates[index] ? formatDate(recentDates[index]) : `${saving.week}주차`}
                 </Text>
               </View>
             ))}
          </View>
        </View>
      </View>

      {/* 저축 목표 및 달성률 */}
      <View style={styles.goalContainer}>
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>* 달성률: </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${achievementRate}%` },
                ]}
              />
            </View>
            <Text style={styles.achievementRate}>{achievementRate}%</Text>
          </View>
        </View>
      </View>

             {/* 격려 메시지 */}
       <View style={styles.messageContainer}>
         <Text style={styles.encouragementMessage}>{encouragementMessage}</Text>
       </View>

       {/* 커스텀 모달 */}
       <Modal
         animationType="fade"
         transparent={true}
         visible={modalVisible}
         onRequestClose={() => setModalVisible(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>저축 현황</Text>
               <TouchableOpacity
                 onPress={() => setModalVisible(false)}
                 style={styles.closeButton}
               >
                 <Text style={styles.closeButtonText}>×</Text>
               </TouchableOpacity>
             </View>
             
             <View style={styles.modalBody}>
               <Text style={styles.modalDate}>{selectedSaving?.date}</Text>
               <View style={styles.amountContainer}>
                 <Text style={styles.amountLabel}>저축 금액</Text>
                 <Text style={styles.amountValue}>
                   {selectedSaving?.amount.toLocaleString()}원
                 </Text>
               </View>
             </View>
             
             <TouchableOpacity
               style={styles.confirmButton}
               onPress={() => setModalVisible(false)}
             >
               <Text style={styles.confirmButtonText}>확인</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </TouchableOpacity>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  graphContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  maxAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  graphContent: {
    flexDirection: 'row',
    height: 280,
  },

  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  barContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 240,
    width: '100%',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 7,
  },
  weekLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  goalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  achievementRate: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    minWidth: 35,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  monthlyComment: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  encouragementMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 280,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  confirmButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

});
