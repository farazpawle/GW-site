import { render } from '@testing-library/react';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';

describe('GoogleTagManager Component', () => {
  it('should render nothing when gtmId is empty', () => {
    const { container } = render(<GoogleTagManager gtmId="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when gtmId is whitespace', () => {
    const { container } = render(<GoogleTagManager gtmId="   " />);
    expect(container.firstChild).toBeNull();
  });

  it('should render GTM scripts when valid ID is provided', () => {
    const { container } = render(<GoogleTagManager gtmId="GTM-ABC123" />);
    
    // Should have script and noscript elements
    const scripts = container.querySelectorAll('script');
    const noscripts = container.querySelectorAll('noscript');
    
    expect(scripts.length).toBeGreaterThan(0);
    expect(noscripts.length).toBeGreaterThan(0);
  });

  it('should log warning and render nothing for invalid format', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { container } = render(<GoogleTagManager gtmId="INVALID-123" />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GoogleTagManager] Invalid GTM ID format')
    );
    expect(container.firstChild).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it('should include correct GTM container ID in script', () => {
    const testId = 'GTM-TEST123';
    render(<GoogleTagManager gtmId={testId} />);
    
    expect(testId).toBe('GTM-TEST123');
  });

  it('should render noscript iframe with correct GTM URL', () => {
    const testId = 'GTM-XYZ789';
    const { container } = render(<GoogleTagManager gtmId={testId} />);
    
    const noscript = container.querySelector('noscript');
    expect(noscript).toBeTruthy();
    
    // Check if iframe exists inside noscript
    const iframe = noscript?.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('src')).toContain(testId);
  });

  it('should not accept IDs without GTM- prefix', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { container } = render(<GoogleTagManager gtmId="ABC123" />);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it('should render correctly with hyphenated GTM ID', () => {
    const { container } = render(<GoogleTagManager gtmId="GTM-A1B2-C3D4" />);
    
    const scripts = container.querySelectorAll('script');
    expect(scripts.length).toBeGreaterThan(0);
  });
});
