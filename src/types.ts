export interface BaseResponse<T = any> {
  status: boolean;
  statusCode: number;
  data?: T;
  message?: string;
  error?: any;
}

export interface UserAuth {
  id: string;
  email: string;
  time: string;
  iat: number;
  exp: number;
}
