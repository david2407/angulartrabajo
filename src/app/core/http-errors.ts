export interface CustomHttpError {
  codes: number[];
  message: string;
  report?: boolean;
}

export const CustomHttpErrors: CustomHttpError[] = [
  {
    codes: [401, 403],
    message: 'Not authorized',
  },
  {
    codes: [404],
    message: 'Not found',
  },
  {
    codes: [410],
    message: 'One of the resources you are looking for is no longer available',
  },
];
