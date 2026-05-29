import { Dispatch, SetStateAction } from "react";

export type SetterType<T> = Dispatch<SetStateAction<T>>;

export type ParamsType<T extends keyof any> = {
  params: Promise<Record<T, string>>;
};
