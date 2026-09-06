export const companies:string[];
export const rates:number[];
export type SimulationResult={error?:string;beforePower?:number;afterPower?:number;beforePrice?:number;afterPrice?:number;month?:number;year?:number;rate?:number};
export function calculate(input:Record<string,unknown>):SimulationResult;
