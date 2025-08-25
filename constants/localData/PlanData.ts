import type { PlanEntity } from '@/types/entity/PlanEntity';

// 샘플 일정 데이터
export const samplePlans: PlanEntity[] = [
    {
        planId: 1,
        title: "컴퓨터네트워크",
        place: "55호관",
        startTime: "2025-08-25T11:00:00",
        endTime: "2025-08-25T12:30:00",
        new: false
    },
    {
        planId: 2,
        title: "스터디 모임",
        place: "동아리실",
        startTime: "2025-08-22T13:00:00",
        endTime: "2025-08-22T16:00:00",
        new: true
    },
    {
        planId: 3,
        title: "컴파일러",
        place: "55514",
        startTime: "2024-01-16T16:00:00",
        endTime: "2024-01-16T17:30:00",
        new: true
    },
    {
        planId: 4,
        title: "인공지능",
        place: "55514",
        startTime: "2024-01-16T17:30:00",
        endTime: "2024-01-16T19:00:00",
        new: false
    },
    {
        planId: 5,
        title: "컴퓨터네트워크",
        place: "55호관",
        startTime: "2024-01-19T11:00:00",
        endTime: "2024-01-19T12:30:00",
        new: false
    },
    {
        planId: 6,
        title: "인공지능",
        place: "55514",
        startTime: "2024-01-19T13:00:00",
        endTime: "2024-01-19T14:30:00",
        new: false
    },
    {
        planId: 7,
        title: "컴파일러",
        place: "55514",
        startTime: "2024-01-19T14:30:00",
        endTime: "2024-01-19T16:00:00",
        new: false
    }
];

// 목 데이터로 일정을 가져오는 함수 (useMock = true일 때 사용)
export const dataFetchPlans = async (): Promise<PlanEntity[]> => {
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 에러 발생 시뮬레이션 (테스트용)
    // throw new Error('일정을 불러오는데 실패했습니다.');
    
    return samplePlans;
};

// 특정 사용자의 일정을 가져오는 함수
export const dataFetchUserPlans = async (userId: number): Promise<PlanEntity[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 사용자별로 다른 일정을 반환하도록 시뮬레이션
    if (userId === 1) {
        return samplePlans.filter((_, index) => index % 2 === 0); // 짝수 인덱스
    } else if (userId === 2) {
        return samplePlans.filter((_, index) => index % 2 === 1); // 홀수 인덱스
    }
    
    return samplePlans; // 기본값
};
