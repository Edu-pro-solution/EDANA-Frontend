import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "hr_admin" | "department_head" | "finance" | "finance_manager" | "accountant" | "sales_marketer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export interface Message {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  type: "inbox" | "sent";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  messages: Message[];
  sendMessage: (to: string, subject: string, body: string) => void;
  markMessageRead: (id: string) => void;
}

const mockUsers: Record<string, User & { password: string }> = {
  "admin@targetpath.com": {
    id: "1", name: "Dr. Adebayo Ogundimu", email: "admin@targetpath.com",
    role: "hr_admin", password: "admin123", department: "Human Resources",
  },
  "head@targetpath.com": {
    id: "2", name: "Dr. Funke Akindele", email: "head@targetpath.com",
    role: "department_head", password: "head123", department: "Laboratory",
  },
  "finance@targetpath.com": {
    id: "3", name: "Mr. Chukwudi Obi", email: "finance@targetpath.com",
    role: "finance", password: "finance123", department: "Finance",
  },
  "fm@targetpath.com": {
    id: "4", name: "Mrs. Amina Yusuf", email: "fm@targetpath.com",
    role: "finance_manager", password: "fm123", department: "Finance",
  },
  "acct@targetpath.com": {
    id: "5", name: "Mr. Segun Balogun", email: "acct@targetpath.com",
    role: "accountant", password: "acct123", department: "Finance",
  },
  "sales@targetpath.com": {
    id: "6", name: "Mrs. Binta Hassan", email: "sales@targetpath.com",
    role: "sales_marketer", password: "sales123", department: "Sales",
  },
};

const defaultNotifications: Notification[] = [
  { id: "1", message: "3 leave requests pending approval", time: "10 min ago", read: false, type: "warning" },
  { id: "2", message: "Chioma Nwosu accepted job offer", time: "1 hour ago", read: false, type: "success" },
  { id: "3", message: "March payroll processing started", time: "2 hours ago", read: false, type: "info" },
  { id: "4", message: "New application for Lab Scientist", time: "3 hours ago", read: true, type: "info" },
  { id: "5", message: "Interview scheduled for Amara Obi", time: "5 hours ago", read: true, type: "info" },
];

const defaultMessages: Message[] = [
  { id: "1", from: "Dr. Funke Akindele", fromRole: "Department Head", to: "Dr. Adebayo Ogundimu", subject: "Lab Staff Shortage", body: "We need to hire at least 2 more lab scientists for the Lagos branch. The workload has increased significantly.", time: "2026-03-13 09:30", read: false, type: "inbox" },
  { id: "2", from: "Mr. Chukwudi Obi", fromRole: "Finance", to: "Dr. Adebayo Ogundimu", subject: "Payroll Discrepancy", body: "There's a discrepancy in the March payroll for 3 employees in Logistics. Please review.", time: "2026-03-12 14:20", read: false, type: "inbox" },
  { id: "3", from: "Mrs. Binta Hassan", fromRole: "Sales", to: "Dr. Adebayo Ogundimu", subject: "New Marketing Hire", body: "We urgently need a digital marketing specialist. Can we open a position?", time: "2026-03-11 11:00", read: true, type: "inbox" },
  { id: "4", from: "Dr. Adebayo Ogundimu", fromRole: "HR Admin", to: "Dr. Funke Akindele", subject: "Re: Lab Staff Shortage", body: "We've opened 2 new positions. Recruitment is underway.", time: "2026-03-13 10:15", read: true, type: "sent" },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);

  const login = (email: string, password: string): boolean => {
    const found = registeredUsers[email];
    if (found && found.password === password) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string, role: UserRole): boolean => {
    if (registeredUsers[email]) return false;
    const departmentMap: Record<UserRole, string> = {
      hr_admin: "Human Resources",
      department_head: "Administration",
      finance: "Finance",
      finance_manager: "Finance",
      accountant: "Finance",
      sales_marketer: "Sales",
    };
    const newUser = {
      id: `USR${Date.now()}`,
      name,
      email,
      role,
      password,
      department: departmentMap[role],
    };
    setRegisteredUsers((prev) => ({ ...prev, [email]: newUser }));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return true;
  };

  const logout = () => setUser(null);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sendMessage = (to: string, subject: string, body: string) => {
    const newMsg: Message = {
      id: `MSG${Date.now()}`,
      from: user?.name || "Unknown",
      fromRole: user?.role === "hr_admin" ? "HR Admin" : user?.role || "",
      to,
      subject,
      body,
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: true,
      type: "sent",
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const markMessageRead = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, notifications, markNotificationRead, clearNotifications, messages, sendMessage, markMessageRead }}>
      {children}
    </AuthContext.Provider>
  );
};

export const roleLabels: Record<UserRole, string> = {
  hr_admin: "HR Admin",
  department_head: "Dept Head",
  finance: "Finance",
  finance_manager: "Finance Manager",
  accountant: "Accountant",
  sales_marketer: "Sales & Marketing",
};

export const roleAccess: Record<UserRole, string[]> = {
  hr_admin: [
    "dashboard", "recruitment", "candidates", "interviews", "onboarding",
    "employees", "departments", "roles", "guarantors", "payroll", "leave", "reports", "settings", "inbox",
  ],
  department_head: [
    "dashboard", "employees", "departments", "leave", "reports", "inbox",
  ],
  finance: [
    "dashboard", "payroll", "reports", "inbox",
  ],
  finance_manager: [
    "dashboard", "payroll", "reports", "employees", "inbox",
  ],
  accountant: [
    "dashboard", "payroll", "reports", "inbox",
  ],
  sales_marketer: [
    "dashboard", "employees", "reports", "inbox",
  ],
};
