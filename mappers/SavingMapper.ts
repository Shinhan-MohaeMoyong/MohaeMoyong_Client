// import { MonthlySavingDTO, SavingStateDTO } from '../types/dto/SavingDTO';
// import { MonthlySavingEntity, SavingStateEntity } from '../types/entity/SavingEntity';

// export class SavingMapper {
//   /**
//    * MonthlySavingEntity를 MonthlySavingDTO로 변환
//    */
//   static toMonthlySavingDTO(entity: MonthlySavingEntity): MonthlySavingDTO {
//     console.log('🔄 [SavingMapper] MonthlySaving 변환:', entity);
//     const dto = {
//       week: entity.week,
//       amount: entity.amount,
//       formattedAmount: new Intl.NumberFormat('ko-KR').format(entity.amount) + '원',
//     };
//     console.log('✅ [SavingMapper] MonthlySaving 변환 완료:', dto);
//     return dto;
//   }

//   /**
//    * SavingStateEntity를 SavingStateDTO로 변환
//    */
//   static toDTO(entity: SavingStateEntity): SavingStateDTO {
//     console.log('🔄 [SavingMapper] SavingState 변환 시작:', entity);
    
//     // 잔액 포맷팅
//     const formattedBalance = new Intl.NumberFormat('ko-KR').format(entity.balance) + '원';
//     console.log('💰 [SavingMapper] 잔액 포맷팅:', entity.balance, '→', formattedBalance);
    
//     // 월별 저축 데이터 변환
//     console.log('📊 [SavingMapper] 월별 저축 데이터 변환 시작, 개수:', entity.monthlySavings.length);
//     const monthlySavings = entity.monthlySavings.map(saving => 
//       this.toMonthlySavingDTO(saving)
//     );
//     console.log('✅ [SavingMapper] 월별 저축 데이터 변환 완료:', monthlySavings);
    
//     // 달성률 포맷팅
//     const achievementRateText = `${Math.round(entity.achievementRate)}%`;
//     console.log('📈 [SavingMapper] 달성률 포맷팅:', entity.achievementRate, '→', achievementRateText);
    
//     // 독려 메시지 생성
//     const encouragementMessage = this.generateEncouragementMessage(entity.achievementRate);
//     console.log('💬 [SavingMapper] 독려 메시지 생성:', encouragementMessage);

//     const dto = {
//       accountNumber: entity.accountNumber,
//       balance: formattedBalance,
//       accountAlias: entity.accountAlias,
//       targetAmount: entity.targetAmount,
//       monthlySavings,
//       achievementRate: entity.achievementRate,
//       achievementRateText,
//       encouragementMessage,
//     };

//     console.log('✅ [SavingMapper] SavingState 변환 완료:', dto);
//     return dto;
//   }

//   /**
//    * SavingStateEntity 배열을 SavingStateDTO 배열로 변환
//    */
//   static toDTOList(entities: SavingStateEntity[]): SavingStateDTO[] {
//     console.log('🔄 [SavingMapper] SavingState 배열 변환 시작, 개수:', entities.length);
//     const dtos = entities.map(entity => this.toDTO(entity));
//     console.log('✅ [SavingMapper] SavingState 배열 변환 완료, 개수:', dtos.length);
//     return dtos;
//   }

//   /**
//    * 달성률에 따른 독려 메시지 생성
//    */
//   private static generateEncouragementMessage(achievementRate: number): string {
//     console.log('💭 [SavingMapper] 독려 메시지 생성 시작, 달성률:', achievementRate);
    
//     let message: string;
//     if (achievementRate >= 100) {
//       message = '목표를 달성하셨네요! 정말 대단합니다! 🎉';
//     } else if (achievementRate >= 80) {
//       message = '거의 다 왔어요! 조금만 더 힘내세요! 💪';
//     } else if (achievementRate >= 60) {
//       message = '잘 하고 계세요! 꾸준함이 최고의 무기예요! ✨';
//     } else if (achievementRate >= 40) {
//       message = '차근차근 진행하고 계시네요! 화이팅! 🔥';
//     } else if (achievementRate >= 20) {
//       message = '시작이 반이에요! 천천히 해도 괜찮아요! 🌱';
//     } else {
//       message = '오늘부터 시작해보세요! 작은 것부터 차근차근! 🌟';
//     }
    
//     console.log('💬 [SavingMapper] 독려 메시지 생성 완료:', message);
//     return message;
//   }
// }
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

    const formattedBalance = new Intl.NumberFormat('ko-KR').format(entity.balance) + '원';
    console.log('💰 [SavingMapper] 잔액 포맷팅:', entity.balance, '→', formattedBalance);

    console.log('📊 [SavingMapper] 월별 저축 데이터 변환 시작, 개수:', entity.monthlySavings.length);
    const monthlySavings = entity.monthlySavings.map((saving) => this.toMonthlySavingDTO(saving));
    console.log('✅ [SavingMapper] 월별 저축 데이터 변환 완료:', monthlySavings);

    const achievementRateText = `${Math.round(entity.achievementRate)}%`;
    console.log('📈 [SavingMapper] 달성률 포맷팅:', entity.achievementRate, '→', achievementRateText);

    // ✨ 별칭을 넣어 개인화된 독려 메시지 생성
    const encouragementMessage = this.generateEncouragementMessage(
      entity.achievementRate,
      entity.accountAlias
    );
    console.log('💬 [SavingMapper] 독려 메시지 생성:', encouragementMessage);

    const dto: SavingStateDTO = {
      accountNumber: entity.accountNumber,
      balance: formattedBalance,
      accountAlias: entity.accountAlias,
      targetAmount: entity.targetAmount,
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
    const dtos = entities.map((entity) => this.toDTO(entity));
    console.log('✅ [SavingMapper] SavingState 배열 변환 완료, 개수:', dtos.length);
    return dtos;
  }

  /**
   * 문자열 해시 (템플릿 선택용, 항상 동일한 인덱스 보장)
   */
  private static hashString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  /**
   * 달성률에 따른 템플릿 묶음
   * ${alias} 자리엔 계좌별칭이 들어간다.
   */
  private static messagePool = {
    g100: [
      '🎉 ${alias}, 목표 달성! 스스로가 만든 최고의 결과예요!',
      '🏆 ${alias}, 끝까지 해냈어요. 멋진 완주에 박수!',
      '✨ ${alias}, 퍼펙트! 다음 챕터도 기대돼요!',
    ],
    g80: [
      '💪 ${alias}, 거의 다 왔어요! 마지막 스퍼트만!',
      '🚀 ${alias}, 상승세 좋아요. 한 걸음만 더!',
      '🌟 ${alias}, 안정적으로 잘 쌓고 있어요!',
    ],
    g60: [
      '✨ ${alias}, 꾸준함이 빛나요. 리듬 유지 굿!',
      '📈 ${alias}, 속도 좋아요. 오늘도 한 번 더!',
      '🧩 ${alias}, 한 조각씩 채워가는 중이에요!',
    ],
    g40: [
      '🔥 ${alias}, 기초를 단단히 다졌어요. 이제 탄력 붙을 때!',
      '🌱 ${alias}, 차근차근 잘 진행 중이에요!',
      '🛠️ ${alias}, 패턴만 유지하면 곧 가속 붙어요!',
    ],
    g20: [
      '🌿 ${alias}, 시작이 반! 페이스만 유지하자!',
      '🔰 ${alias}, 첫 발이 제일 중요해요. 아주 좋아요!',
      '📍 ${alias}, 방향 맞았어요. 조금씩 쌓아가요!',
    ],
    g0: [
      '🌟 ${alias}, 오늘부터 가볍게 한 번 시작해볼까요?',
      '☀️ ${alias}, 작은 금액이라도 출발이 중요해요!',
      '🧭 ${alias}, 한 걸음만 떼면 길이 열려요!',
    ],
  };

  /**
   * 달성률에 따른 개인화 독려 메시지 생성
   * 계좌별칭(alias)로 템플릿을 안정적으로 선택해 카드마다 다른 느낌으로!
   */
  private static generateEncouragementMessage(
    achievementRate: number,
    accountAlias?: string
  ): string {
    const alias = accountAlias?.trim() || '이번 목표';
    const pool =
      achievementRate >= 100
        ? this.messagePool.g100
        : achievementRate >= 80
        ? this.messagePool.g80
        : achievementRate >= 60
        ? this.messagePool.g60
        : achievementRate >= 40
        ? this.messagePool.g40
        : achievementRate >= 20
        ? this.messagePool.g20
        : this.messagePool.g0;

    // 별칭으로 해시 → 항상 같은 인덱스 사용 (UX 일관성)
    const idx = this.hashString(alias) % pool.length;
    const template = pool[idx];

    return template.replace('${alias}', alias);
  }
}
