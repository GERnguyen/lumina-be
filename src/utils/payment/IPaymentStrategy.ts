export interface IPaymentStrategy {
  pay(amount: number): Promise<boolean>;
}
