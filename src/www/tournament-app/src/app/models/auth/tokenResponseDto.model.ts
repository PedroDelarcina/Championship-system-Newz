export interface TokenResponseDto {
  token: string;
  expiration: Date;
  userId: string;
  email: string;
  nickname: string;
  isAdmin: boolean;
}