import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../src/pages/index';
import '@testing-library/jest-dom'
import GeoLocation from '@/pages/interface/GeoLocation';

describe('Max Mind Geo IP Tool', () => {
  it('does not crash', () => {
      render(<Home />)
      expect(screen.getByText('Enter IP addresses (comma-separated)')).toBeInTheDocument()
  });
  it('renders input field', () => {
    render(<Home />);
    const inputElement = screen.getByLabelText(/Enter IP addresses/i);
    expect(inputElement).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<Home />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('renders clear button', () => {
    render(<Home />);
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });


  it('displays error message if IP addresses are invalid', () => {
    render(<Home />);
    const inputElement = screen.getByLabelText('Enter IP addresses (comma-separated)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.change(inputElement, { target: { value: 'invalid-ip' } });
    fireEvent.click(submitButton);
    const errorMessage = screen.getByText('Invalid IP address format');
    expect(errorMessage).toBeInTheDocument();
  });


  it('displays results if IP addresses are valid', async () => {
    const mockResponse:GeoLocation[] = [
      {
        ipAddress: '1.2.3.4',
        countryCode: 'US',
        postalCode: '12345',
        cityName: 'Example City',
        timeZone: 'America/New_York',
        accuracyRadius: '100',
      },
    ];
    const mockJsonPromise = Promise.resolve(mockResponse);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => mockJsonPromise,
      })
    );

    render(<Home />);
    const inputElement = screen.getByLabelText('Enter IP addresses (comma-separated)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.change(inputElement, { target: { value: '1.2.3.4' } });
    fireEvent.click(submitButton);
    const ipAddressElement = await screen.findByText('1.2.3.4');
    const countryCodeElement = screen.getByText('US');
    const postalCodeElement = screen.getByText('12345');
    const cityNameElement = screen.getByText('Example City');
    const timeZoneElement = screen.getByText('America/New_York');
    const accuracyRadiusElement = screen.getByText('100');
    expect(ipAddressElement).toBeInTheDocument();
    expect(countryCodeElement).toBeInTheDocument();
    expect(postalCodeElement).toBeInTheDocument();
    expect(cityNameElement).toBeInTheDocument();
    expect(timeZoneElement).toBeInTheDocument();
    expect(accuracyRadiusElement).toBeInTheDocument();
  });

  it('handleClear resets all state variables', () => {
    const { getByLabelText, getByText, queryByRole, getByRole } = render(<Home />);
    const input = getByLabelText('Enter IP addresses (comma-separated)');
    const submitButton = getByText('Submit');
    fireEvent.change(input, { target: { value: '1.2.3.4, 5.6.7.8' } });
    fireEvent.click(submitButton);
    const clearButton = getByText('Clear');
    fireEvent.click(clearButton);
    expect(input.value).toBe('');
    expect(queryByRole('table')).not.toBeInTheDocument();
  });

  it('displays error message if IP addresses are invalid', () => {
    const { getByLabelText, getByText } = render(<Home />);
    const input = getByLabelText('Enter IP addresses (comma-separated)');
    const submitButton = getByText('Submit');
    fireEvent.change(input, { target: { value: 'invalid-ip' } });
    fireEvent.click(submitButton);
    const errorMessage = getByText('Invalid IP address format');
    expect(errorMessage).toBeInTheDocument();
  });
})