type DepName = string;

export const customRules: Record<DepName, DepName[]> = {
  webpack: ['webpack-env'],
};
