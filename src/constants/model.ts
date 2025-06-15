export interface ExpenseItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: string;
  user: string;
  userPhoto?: string;
}
export const CATEGORY_META: { [key: string]: { label: string; icon: any } } = {
  Groceries: { label: 'Groceries', icon: require('../../assets/groceries.png') },
  Food: { label: 'Food', icon: require('../../assets/food.png') },
  Fuel: { label: 'Fuel', icon: require('../../assets/fuel.png') },
  Water: { label: 'Water', icon: require('../../assets/water.png') },
  Rent: { label: 'Rent', icon: require('../../assets/rent.png') },
  Electricity: { label: 'Electricity', icon: require('../../assets/electricity.png') },
  Medical: { label: 'Medical', icon: require('../../assets/medical.png') },
  Internet: { label: 'Internet', icon: require('../../assets/internet.png') },
  Amazon: { label: 'Amazon', icon: require('../../assets/amazon.png') },
  'Personal Care': { label: 'Personal Care', icon: require('../../assets/personalcare.png') },
  'Vehicle Maintenance': { label: 'Vehicle Maintenance', icon: require('../../assets/vehiclemaintenance.png') },
  Clothing: { label: 'Clothing', icon: require('../../assets/clothing.png') },
  'Loan EMI': { label: 'Loan EMI', icon: require('../../assets/loanemi.png') },
  Entertainment: { label: 'Entertainment', icon: require('../../assets/entertainment.png') },
  Travel: { label: 'Travel', icon: require('../../assets/travel.png') },
  Home: { label: 'Home', icon: require('../../assets/home.png') },
};