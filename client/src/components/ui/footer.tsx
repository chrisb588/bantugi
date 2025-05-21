'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full p-4 md:p-6 text-center"
      style={{ backgroundColor: '#240502', color: '#F5F3E9' }}
    >
      <p className="text-sm opacity-75">
        &copy; {currentYear} bantugi. All rights reserved.
      </p>
    </footer>
  );
} 