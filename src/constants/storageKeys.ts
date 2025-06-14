// src/constants/storageKeys.ts
// Enum-like class for AsyncStorage keys
export class StorageKeys {
  static readonly HAS_LAUNCHED = 'hasLaunched';
  static readonly IS_AUTHED = 'isAuthed';
  static readonly SIGN_IN_TYPE = 'signInType';
  static readonly GOOGLE_USER_NAME = 'googleUserName';
  static readonly GOOGLE_USER_EMAIL = 'googleUserEmail';
  static readonly GOOGLE_USER_PHOTO = 'googleUserPhoto';
  // Add more keys as needed
}
export enum ExpenseCategory {
  GROCERIES = 'Groceries',
  FOOD = 'Food',
  FUEL = 'Fuel',
  WATER = 'Water',
  RENT = 'Rent',
  ELECTRICITY = 'Electricity',
  MEDICAL = 'Medical',
  INTERNET = 'Internet',
  AMAZON = 'Amazon',
  PERSONAL_CARE = 'Personal Care',
  VEHICLE_MAINTENANCE = 'Vehicle Maintenance',
  CLOTHING = 'Clothing',
  LOAN_EMI = 'Loan EMI',
  ENTERTAINMENT = 'Entertainment',
  TRAVEL = 'Travel',
}