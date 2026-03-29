import { IPaymentStrategy } from "./IPaymentStrategy";

export class MockPaymentStrategy implements IPaymentStrategy {
  async pay(_amount: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}
