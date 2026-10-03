import { vi } from "vitest";

function createModelMock(): Record<string, unknown> {
  return {
    find: vi.fn(() => ({
      lean: vi.fn(() => []),
      select: vi.fn(() => ({ lean: vi.fn(() => []) })),
    })),
    findOne: vi.fn(() => ({
      lean: vi.fn(() => null),
    })),
    findById: vi.fn(() => ({
      lean: vi.fn(() => null),
    })),
    findByIdAndUpdate: vi.fn(() => null),
    findOneAndUpdate: vi.fn(() => ({
      lean: vi.fn(() => null),
    })),
    create: vi.fn(() => null),
    insertMany: vi.fn(() => []),
    updateOne: vi.fn(() => ({ modifiedCount: 1 })),
    updateMany: vi.fn(() => ({ modifiedCount: 1 })),
    deleteOne: vi.fn(() => ({ deletedCount: 1 })),
    deleteMany: vi.fn(() => ({ deletedCount: 1 })),
    countDocuments: vi.fn(() => 0),
    aggregate: vi.fn(() => []),
    exists: vi.fn(() => null),
  };
}

export function createModelsModuleMock(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    Balance: createModelMock(),
    BalanceTransaction: createModelMock(),
    Cart: createModelMock(),
    Category: createModelMock(),
    Competition: createModelMock(),
    CompetitionInstantPrize: createModelMock(),
    ComplianceAuditLog: createModelMock(),
    ComplianceSettings: createModelMock(),
    EmailSettings: createModelMock(),
    EndingSoonSettings: createModelMock(),
    Ticket: createModelMock(),
    InstantPrize: createModelMock(),
    InstantPrizeWin: createModelMock(),
    Order: createModelMock(),
    OrderItem: createModelMock(),
    PaymentMethod: createModelMock(),
    setDefaultPaymentMethod: vi.fn(() => null),
    Profile: createModelMock(),
    PromoCode: createModelMock(),
    ReferralPurchase: createModelMock(),
    ReferralSettings: createModelMock(),
    Winner: createModelMock(),
    ...overrides,
  };
}
