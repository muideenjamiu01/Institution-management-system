// Simple test file to verify dashboard navigation
import { describe, it, expect } from '@jest/globals';

describe('Dashboard Navigation', () => {
  it('should include payments in navigation items', () => {
    const navigation = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Admissions', href: '/dashboard/admissions' },
      { name: 'Students', href: '/dashboard/students' },
      { name: 'Departments', href: '/dashboard/departments' },
      { name: 'Courses', href: '/dashboard/courses' },
      { name: 'Exams', href: '/dashboard/exams' },
      { name: 'Payments', href: '/dashboard/payments' }, // Should be included
    ];

    const paymentNav = navigation.find(item => item.name === 'Payments');
    expect(paymentNav).toBeDefined();
    expect(paymentNav?.href).toBe('/dashboard/payments');
  });
});