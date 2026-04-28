export const validServices = [
  {
    name: "Internet",
    amount: 49.99,
    dueDate: 10,
    category: "Utilities",
  },
  {
    name: "Netflix",
    amount: 12.99,
    dueDate: 5,
    category: "Entertainment",
  },
  {
    name: "Electricity",
    amount: 150.0,
    dueDate: 15,
    category: "Utilities",
  },
  {
    name: "Water",
    amount: 35.5,
    dueDate: 20,
    category: "Utilities",
  },
];

export const invalidServices = [
  {
    name: "", // Empty name
    amount: 49.99,
    dueDate: 10,
    category: "Utilities",
  },
  {
    name: "Service",
    amount: -10, // Negative amount
    dueDate: 10,
    category: "Utilities",
  },
  {
    name: "Service",
    amount: 49.99,
    dueDate: 32, // Invalid day
    category: "Utilities",
  },
  {
    name: "Service",
    amount: 49.99,
    dueDate: 10,
    category: "", // Empty category
  },
];

export const duplicateService = {
  name: "Netflix",
  amount: 15.99,
  dueDate: 5,
  category: "Entertainment",
};

export const updateData = {
  amount: 59.99,
  dueDate: 15,
};
