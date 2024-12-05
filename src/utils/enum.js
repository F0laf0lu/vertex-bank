export const EmailStatus = {
    VERIFIED: true,
    NOT_VERIFIED: false,
};

export const UserRoles = {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    CUSTOMER: 'CUSTOMER',
};

export const AccountStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
};

export const AccountType = {
    SAVING_ACCOUNT: "SAVINGS_ACCOUNT",
    CURRENT_ACCOUNT: "CURRENT_ACCOUNT",
    FIXED_SAVING_ACCOUNT: "FIXED_SAVINGS_ACCOUNT",
};

export const TransactionType = {
    DEPOSIT: "DEPOSIT",
    WIDTHDRAWAL: "WITHDRAW",
    TRANSFER: "TRANSFER"
}

export const TransactionStatus = {
    COMPLETED: "COMPLETED",
    PENDING: "PENDING",
    CANCELLED: "CANCELLED"
}