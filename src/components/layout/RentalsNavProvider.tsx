'use client';

import { createContext, useContext } from 'react';

const RentalsNavContext = createContext({
  showRentalsLink: true,
  hasPublishedRentals: false,
});

export function RentalsNavProvider({
  showRentalsLink,
  hasPublishedRentals,
  children,
}: {
  showRentalsLink: boolean;
  hasPublishedRentals: boolean;
  children: React.ReactNode;
}) {
  return (
    <RentalsNavContext.Provider value={{ showRentalsLink, hasPublishedRentals }}>
      {children}
    </RentalsNavContext.Provider>
  );
}

export function useRentalsNav() {
  return useContext(RentalsNavContext);
}
