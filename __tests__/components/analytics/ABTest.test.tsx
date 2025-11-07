import { render } from '@testing-library/react';
import ABTest, { trackABConversion } from '@/components/analytics/ABTest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  } as Response)
);

describe('ABTest Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should assign a variant on mount', () => {
    const onVariantAssigned = jest.fn();
    const variants = ['control', 'variant_a', 'variant_b'];

    render(
      <ABTest
        testId="test_1"
        variants={variants}
        onVariantAssigned={onVariantAssigned}
      />
    );

    expect(onVariantAssigned).toHaveBeenCalledWith(expect.any(String));
    expect(variants).toContain(onVariantAssigned.mock.calls[0][0]);
  });

  it('should persist variant assignment in localStorage', () => {
    render(
      <ABTest testId="test_1" variants={['control', 'variant_a']} />
    );

    const storedVariant = localStorage.getItem('ab_test_test_1');
    expect(storedVariant).toBeTruthy();
    expect(['control', 'variant_a']).toContain(storedVariant as string);
  });

  it('should use existing variant from localStorage', () => {
    localStorage.setItem('ab_test_test_1', 'variant_a');
    const onVariantAssigned = jest.fn();

    render(
      <ABTest
        testId="test_1"
        variants={['control', 'variant_a']}
        onVariantAssigned={onVariantAssigned}
      />
    );

    expect(onVariantAssigned).toHaveBeenCalledWith('variant_a');
  });

  it('should render children with variant', () => {
    localStorage.setItem('ab_test_test_1', 'control');

    const { container } = render(
      <ABTest testId="test_1" variants={['control', 'variant_a']}>
        {(variant) => <div data-testid="variant">{variant}</div>}
      </ABTest>
    );

    expect(container.querySelector('[data-testid="variant"]')?.textContent).toBe('control');
  });

  it('should send tracking event on assignment', () => {
    render(
      <ABTest testId="test_1" variants={['control', 'variant_a']} />
    );

    expect(fetch).toHaveBeenCalledWith(
      '/api/analytics/ab-test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('ab_test_assigned'),
      })
    );
  });

  it('should reassign if stored variant is not in variants list', () => {
    localStorage.setItem('ab_test_test_1', 'old_variant');
    const onVariantAssigned = jest.fn();

    render(
      <ABTest
        testId="test_1"
        variants={['control', 'variant_a']}
        onVariantAssigned={onVariantAssigned}
      />
    );

    const assignedVariant = onVariantAssigned.mock.calls[0][0];
    expect(['control', 'variant_a']).toContain(assignedVariant);
  });
});

describe('trackABConversion function', () => {
  it('should dispatch conversion event', () => {
    const eventSpy = jest.spyOn(window, 'dispatchEvent');

    trackABConversion('purchase', 99.99);

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ab_conversion',
        detail: { type: 'purchase', value: 99.99 },
      })
    );

    eventSpy.mockRestore();
  });

  it('should work without value', () => {
    const eventSpy = jest.spyOn(window, 'dispatchEvent');

    trackABConversion('signup');

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { type: 'signup', value: undefined },
      })
    );

    eventSpy.mockRestore();
  });
});
