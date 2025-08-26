import { MonthlySavingDTO, SavingStateDTO } from '../types/dto/SavingDTO';
import { MonthlySavingEntity, SavingStateEntity } from '../types/entity/SavingEntity';

export class SavingMapper {
  /**
   * MonthlySavingEntity를 MonthlySavingDTO로 변환
   */
  static toMonthlySavingDTO(entity: MonthlySavingEntity): MonthlySavingDTO {
    console.log('🔄 [SavingMapper] MonthlySaving 변환:', entity);
    const dto = {
      week: entity.week,
      amount: entity.amount,
      formattedAmount: new Intl.NumberFormat('ko-KR').format(entity.amount) + '원',
    };
    console.log('✅ [SavingMapper] MonthlySaving 변환 완료:', dto);
    return dto;
  }

  /**
   * SavingStateEntity를 SavingStateDTO로 변환
   */
  static toDTO(entity: SavingStateEntity): SavingStateDTO {
    console.log('🔄 [SavingMapper] SavingState 변환 시작:', entity);
    
    // 잔액 포맷팅
    const formattedBalance = new Intl.NumberFormat('ko-KR').format(entity.balance) + '원';
    console.log('💰 [SavingMapper] 잔액 포맷팅:', entity.balance, '→', formattedBalance);
    
    // 월별 저축 데이터 변환
    console.log('📊 [SavingMapper] 월별 저축 데이터 변환 시작, 개수:', entity.monthlySavings.length);
    const monthlySavings = entity.monthlySavings.map(saving => 
      this.toMonthlySavingDTO(saving)
    );
    console.log('✅ [SavingMapper] 월별 저축 데이터 변환 완료:', monthlySavings);
    
    // 달성률 포맷팅
    const achievementRateText = `${Math.round(entity.achievementRate)}%`;
    console.log('📈 [SavingMapper] 달성률 포맷팅:', entity.achievementRate, '→', achievementRateText);
    
    // 독려 메시지 생성
    const encouragementMessage = this.generateEncouragementMessage(entity.achievementRate);
    console.log('💬 [SavingMapper] 독려 메시지 생성:', encouragementMessage);

    const dto = {
      accountNumber: entity.accountNumber,
      balance: formattedBalance,
      accountAlias: entity.accountAlias,
      monthlySavings,
      achievementRate: entity.achievementRate,
      achievementRateText,
      encouragementMessage,
    };

    console.log('✅ [SavingMapper] SavingState 변환 완료:', dto);
    return dto;
  }

  /**
   * SavingStateEntity 배열을 SavingStateDTO 배열로 변환
   */
  static toDTOList(entities: SavingStateEntity[]): SavingStateDTO[] {
    console.log('🔄 [SavingMapper] SavingState 배열 변환 시작, 개수:', entities.length);
    const dtos = entities.map(entity => this.toDTO(entity));
    console.log('✅ [SavingMapper] SavingState 배열 변환 완료, 개수:', dtos.length);
    return dtos;
  }

  /**
   * 달성률에 따른 독려 메시지 생성
   */
  private static generateEncouragementMessage(achievementRate: number): string {
    console.log('💭 [SavingMapper] 독려 메시지 생성 시작, 달성률:', achievementRate);
    
    let message: string;
    if (achievementRate >= 100) {
      message = '목표를 달성하셨네요! 정말 대단합니다! 🎉';
    } else if (achievementRate >= 80) {
      message = '거의 다 왔어요! 조금만 더 힘내세요! 💪';
    } else if (achievementRate >= 60) {
      message = '잘 하고 계세요! 꾸준함이 최고의 무기예요! ✨';
    } else if (achievementRate >= 40) {
      message = '차근차근 진행하고 계시네요! 화이팅! 🔥';
    } else if (achievementRate >= 20) {
      message = '시작이 반이에요! 천천히 해도 괜찮아요! 🌱';
    } else {
      message = '오늘부터 시작해보세요! 작은 것부터 차근차근! 🌟';
    }
    
    console.log('💬 [SavingMapper] 독려 메시지 생성 완료:', message);
    return message;
  }
}
