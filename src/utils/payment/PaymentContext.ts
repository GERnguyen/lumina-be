import { IPaymentStrategy } from "./IPaymentStrategy";

export class PaymentContext {
  constructor(private strategy: IPaymentStrategy) {}

  setStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  async pay(amount: number): Promise<boolean> {
    return this.strategy.pay(amount);
  }
}
