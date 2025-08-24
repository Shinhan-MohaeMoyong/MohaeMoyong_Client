import type { PlanEntity } from "../entity/PlanEntity";

export type PlanGridDTO = {
  plan: PlanEntity;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  isNew: boolean;
};
