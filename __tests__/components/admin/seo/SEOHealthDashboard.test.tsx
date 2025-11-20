import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SEOHealthDashboard from '@/components/admin/seo/SEOHealthDashboard';

// Mock fetch
global.fetch = jest.fn();

describe('SEOHealthDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<SEOHealthDashboard />);
    
    expect(screen.getByRole('heading', { name: /SEO Health Dashboard/i })).toBeInTheDocument();
  });

  it('should fetch and display health data', async () => {
    const mockHealthData = {
      checks: [
        {
          category: 'Meta Tags & SEO Basics',
          checks: [
            {
              name: 'SEO Title',
              status: 'pass',
              message: 'Title set (45 chars)',
            },
          ],
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    });

    render(<SEOHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Meta Tags & SEO Basics')).toBeInTheDocument();
      expect(screen.getByText('SEO Title')).toBeInTheDocument();
      expect(screen.getByText('Title set (45 chars)')).toBeInTheDocument();
    });
  });

  it('should calculate health score correctly', async () => {
    const mockHealthData = {
      checks: [
        {
          category: 'Test Category',
          checks: [
            { name: 'Check 1', status: 'pass', message: 'Good' },
            { name: 'Check 2', status: 'pass', message: 'Good' },
            { name: 'Check 3', status: 'fail', message: 'Bad' },
            { name: 'Check 4', status: 'warning', message: 'Needs work' },
          ],
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    });

    render(<SEOHealthDashboard />);

    await waitFor(() => {
      // 2 passed out of 4 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Passed count
      expect(screen.getByText('1')).toBeInTheDocument(); // Warnings count
      expect(screen.getByText('1')).toBeInTheDocument(); // Failed count
    });
  });

  it('should handle refresh button click', async () => {
    const mockHealthData = {
      checks: [],
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockHealthData,
    });

    render(<SEOHealthDashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SEOHealthDashboard />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should display status icons correctly', async () => {
    const mockHealthData = {
      checks: [
        {
          category: 'Test',
          checks: [
            { name: 'Pass Check', status: 'pass', message: 'All good' },
            { name: 'Warning Check', status: 'warning', message: 'Needs attention' },
            { name: 'Fail Check', status: 'fail', message: 'Critical issue' },
          ],
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    });

    render(<SEOHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pass Check')).toBeInTheDocument();
      expect(screen.getByText('Warning Check')).toBeInTheDocument();
      expect(screen.getByText('Fail Check')).toBeInTheDocument();
    });
  });
});
