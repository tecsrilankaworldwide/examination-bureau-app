import React from 'react';

const AcademicLogo = ({ size = 'large' }) => {
  const dimensions = {
    small: { logoSize: 70, titleSize: 'text-2xl', subtitleSize: 'text-sm', squareSize: 4, gridSize: 11 },
    medium: { logoSize: 100, titleSize: 'text-4xl', subtitleSize: 'text-base', squareSize: 6, gridSize: 11 },
    large: { logoSize: 130, titleSize: 'text-5xl md:text-6xl', subtitleSize: 'text-lg md:text-xl', squareSize: 8, gridSize: 11 },
  };

  const { logoSize, titleSize, subtitleSize, squareSize, gridSize } = dimensions[size] || dimensions.large;

  // Digital grid pattern - creates a circular badge shape with squares
  const generateSquarePattern = () => {
    const squares = [];
    const center = Math.floor(gridSize / 2);
    const outerRadius = gridSize / 2;
    const innerRadius = gridSize / 3;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col - center;
        const y = row - center;
        const distance = Math.sqrt(x * x + y * y);
        
        // Create circular badge pattern with squares
        let color = null;
        if (distance < outerRadius && distance > innerRadius) {
          // Outer ring - orange
          color = '#F59E0B';
        } else if (distance <= innerRadius && distance > innerRadius - 1.5) {
          // Inner ring - brown
          color = '#92400E';
        } else if (distance <= innerRadius - 1.5 && Math.abs(x) < 2 && Math.abs(y) < 2) {
          // Center icon area - orange
          color = '#F59E0B';
        }
        
        if (color) {
          squares.push(
            <div
              key={`${row}-${col}`}
              className="rounded-sm"
              style={{
                width: `${squareSize}px`,
                height: `${squareSize}px`,
                backgroundColor: color,
              }}
            />
          );
        } else {
          squares.push(
            <div
              key={`${row}-${col}`}
              style={{
                width: `${squareSize}px`,
                height: `${squareSize}px`,
              }}
            />
          );
        }
      }
    }
    return squares;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Digital Square Badge Logo */}
      <div className="mb-6">
        <div 
          className="bg-white p-4 rounded-2xl shadow-xl border-4"
          style={{
            borderColor: '#F59E0B'
          }}
        >
          <div 
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, ${squareSize}px)`,
            }}
          >
            {generateSquarePattern()}
          </div>
        </div>
      </div>

      {/* Institution Name */}
      <div className="text-center">
        <h1
          className={`${titleSize} font-bold leading-tight mb-2 text-[#1F2937] uppercase tracking-wide`}
          style={{
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '0.05em'
          }}
        >
          Education Reforms Bureau
        </h1>
        
        {/* Divider line */}
        <div className="h-1 w-32 md:w-40 bg-[#F59E0B] mx-auto mb-3 rounded-full"></div>
        
        {/* Slogan */}
        <p
          className={`${subtitleSize} font-semibold text-[#78350F] mb-2`}
          style={{ fontFamily: 'Figtree, sans-serif' }}
        >
          Building Future Scholars
        </p>
        
        {/* Est. year */}
        <p className="text-sm md:text-base text-[#6B7280] font-medium">
          Excellence in Education Since 1982
        </p>
      </div>
    </div>
  );
};

export default AcademicLogo;
