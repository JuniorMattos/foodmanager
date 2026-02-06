import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    
    // Check if the spinner element (child div) has the animation class
    const spinnerElement = spinner.querySelector('.animate-spin')
    expect(spinnerElement).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    
    // Check if the spinner element has the size classes
    const spinnerElement = spinner.querySelector('.w-8.h-8')
    expect(spinnerElement).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    
    // Check if the spinner element has the custom class
    const spinnerElement = spinner.querySelector('.custom-class')
    expect(spinnerElement).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading...')
  })
})
