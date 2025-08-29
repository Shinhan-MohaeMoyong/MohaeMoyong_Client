// screens/DayPlansScreen.tsx
import AccountSelectionModal, { Account } from '@/components/AccountSelectionModal';
import EventItem from '@/components/EventItem';
import { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

export default function DayPlansScreen() {
  const [withdrawalAccount, setWithdrawalAccount] = useState<Account | null>(null);
  const [depositAccount, setDepositAccount] = useState<Account | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <EventItem
          startTime="09:00"
          endTime="10:30"
          title="자료구조 스터디"
          location="공학관 302호"
          onDelete={() => {}}
          onComplete={() => {}}
          hasSavingsGoal
          withdrawalAccount={
            withdrawalAccount && {
              bankName: withdrawalAccount.bankName,
              accountNumber: withdrawalAccount.accountNumber,
            }
          }
          depositAccount={
            depositAccount && {
              bankName: depositAccount.bankName,
              accountNumber: depositAccount.accountNumber,
            }
          }
          onSelectWithdrawalAccount={() => {
            console.log('open withdraw modal');
            setShowWithdrawModal(true);
          }}
          onSelectDepositAccount={() => {
            console.log('open deposit modal');
            setShowDepositModal(true);
          }}
        />
      </ScrollView>

      {/* 출금계좌 선택 모달 */}
      <AccountSelectionModal
        visible={showWithdrawModal}
        type="withdrawal"
        onClose={() => setShowWithdrawModal(false)}
        onAccountSelect={(acc) => setWithdrawalAccount(acc)}
      />

      {/* 입금계좌 선택 모달 */}
      <AccountSelectionModal
        visible={showDepositModal}
        type="deposit"
        onClose={() => setShowDepositModal(false)}
        onAccountSelect={(acc) => setDepositAccount(acc)}
      />
    </SafeAreaView>
  );
}
