export type PlanEntity = {
    planId: number;
    title: string;
    place: string;
    startTime: string;
    endTime: string;
    new?: boolean;
    authorId: number;
    hasSavingsGoal: boolean;
    savingsAmount: number | null;
    privacyLevel: string;
    withDrawAccountNo: string | null;
    depositAccountNo: string | null;
    completed: boolean;
};
