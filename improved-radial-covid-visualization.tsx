import React, { useState } from 'react';

const ImprovedRadialCovidVisualization = () => {
  const [highlight, setHighlight] = useState(null);
  
  // Sample data points (representing COVID data from 2020-2023)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2020', '2021', '2022', '2023'];
  
  // Generate data for three metrics
  const generateData = () => {
    const data = [];
    years.forEach((year, yearIndex) => {
      months.forEach((month, monthIndex) => {
        // Create some interesting patterns
        const angle = (monthIndex / months.length) * Math.PI * 2;
        const yearMultiplier = 1 + yearIndex * 0.5;
        
        // Simulate three different metrics with different patterns
        const confirmedBase = Math.sin(angle * 2) * 40 * yearMultiplier + 50;
        const recoveredBase = Math.cos(angle * 3) * 30 * yearMultiplier + 40;
        const fatalityBase = Math.sin(angle * 1.5) * 15 * yearMultiplier + 20;
        
        // Add some randomness
        const confirmed = Math.max(0, confirmedBase + Math.random() * 20 - 10);
        const recovered = Math.max(0, recoveredBase + Math.random() * 15 - 7.5);
        const fatality = Math.max(0, fatalityBase + Math.random() * 8 - 4);
        
        // Special patterns for specific periods
        let confirmedAdjusted = confirmed;
        let recoveredAdjusted = recovered;
        let fatalityAdjusted = fatality;
        
        // Simulate waves and vaccine impacts
        if (year === '2020' && monthIndex > 2) {
          confirmedAdjusted *= 1.5; // First wave
        } else if (year === '2021' && monthIndex < 3) {
          confirmedAdjusted *= 2; // Winter surge
        } else if (year === '2021' && monthIndex > 5) {
          confirmedAdjusted *= 0.8; // Vaccine effect
          fatalityAdjusted *= 0.6;
        } else if (year === '2022' && monthIndex < 2) {
          confirmedAdjusted *= 1.8; // Omicron
          fatalityAdjusted *= 0.5; // But less severe
        }
        
        data.push({
          id: `${year}-${month}`,
          year,
          month,
          monthIndex,
          yearIndex,
          angle,
          confirmed: confirmedAdjusted,
          recovered: recoveredAdjusted,
          fatality: fatalityAdjusted,
          radius: 100 + yearIndex * 60,
        });
      });
    });
    return data;
  };
  
  const data = generateData();
  
  // Calculate center point
  const centerX = 400;
  const centerY = 310;
  
  // Calculate max values for scaling
  const maxConfirmed = Math.max(...data.map(d => d.confirmed));
  const maxRecovered = Math.max(...data.map(d => d.recovered));
  const maxFatality = Math.max(...data.map(d => d.fatality));
  
  // Convert polar coordinates to Cartesian
  const polarToCartesian = (radius, angle) => {
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2)
    };
  };
  
  // Generate month labels
  const monthLabels = months.map((month, i) => {
    const angle = (i / months.length) * Math.PI * 2 - Math.PI / 2;
    const pos = polarToCartesian(360, angle);
    return (
      <text
        key={`month-${i}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#555"
        fontSize="12"
        fontWeight="bold"
      >
        {month}
      </text>
    );
  });
  
  // Generate year rings (with increased spacing)
  const yearRings = years.map((year, i) => {
    const radius = 100 + i * 60;
    return (
      <g key={`year-${i}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#ddd"
          strokeWidth="1"
          opacity="0.7"
        />
        <text
          x={centerX}
          y={centerY - radius - 10}
          textAnchor="middle"
          fill="#555"
          fontSize="14"
          fontWeight="bold"
        >
          {year}
        </text>
      </g>
    );
  });
  
  // Generate data points with staggered positioning instead of overlap
  const dataPoints = data.map(d => {
    const pos = polarToCartesian(d.radius, d.angle);
    
    // Instead of overlapping, arrange in a small triangle pattern
    const confirmedPos = {
      x: pos.x,
      y: pos.y - 8
    };
    
    const recoveredPos = {
      x: pos.x - 7,
      y: pos.y + 4 
    };
    
    const fatalityPos = {
      x: pos.x + 7,
      y: pos.y + 4
    };
    
    const confirmedRadius = (d.confirmed / maxConfirmed) * 12 + 3;
    const recoveredRadius = (d.recovered / maxRecovered) * 12 + 3;
    const fatalityRadius = (d.fatality / maxFatality) * 12 + 3;
    
    const isHighlighted = highlight === d.id;
    const opacity = isHighlighted ? 1 : 0.7;
    const strokeWidth = isHighlighted ? 2 : 0;
    
    return (
      <g 
        key={d.id} 
        onMouseEnter={() => setHighlight(d.id)}
        onMouseLeave={() => setHighlight(null)}
      >
        {/* Confirmed cases - blue circle */}
        <circle
          cx={confirmedPos.x}
          cy={confirmedPos.y}
          r={confirmedRadius}
          fill="#4285F4"
          opacity={opacity}
          stroke={isHighlighted ? "#2A56C6" : "none"}
          strokeWidth={strokeWidth}
        />
        
        {/* Recovered cases - green circle */}
        <circle
          cx={recoveredPos.x}
          cy={recoveredPos.y}
          r={recoveredRadius}
          fill="#34A853"
          opacity={opacity}
          stroke={isHighlighted ? "#24783B" : "none"}
          strokeWidth={strokeWidth}
        />
        
        {/* Fatality cases - red circle */}
        <circle
          cx={fatalityPos.x}
          cy={fatalityPos.y}
          r={fatalityRadius}
          fill="#EA4335"
          opacity={opacity}
          stroke={isHighlighted ? "#C62A1E" : "none"}
          strokeWidth={strokeWidth}
        />
        
        {/* Connecting lines between metrics to show relationship */}
        {isHighlighted && (
          <g>
            <line 
              x1={confirmedPos.x} 
              y1={confirmedPos.y} 
              x2={recoveredPos.x} 
              y2={recoveredPos.y}
              stroke="#999"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            <line 
              x1={recoveredPos.x} 
              y1={recoveredPos.y} 
              x2={fatalityPos.x} 
              y2={fatalityPos.y}
              stroke="#999"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            <line 
              x1={fatalityPos.x} 
              y1={fatalityPos.y} 
              x2={confirmedPos.x} 
              y2={confirmedPos.y}
              stroke="#999"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
          </g>
        )}
        
        {/* Data tooltip */}
        {isHighlighted && (
          <g>
            <rect
              x={pos.x + 15}
              y={pos.y - 50}
              width={165}
              height={100}
              rx={5}
              fill="white"
              fillOpacity="0.95"
              stroke="#ccc"
              strokeWidth={1}
            />
            <text x={pos.x + 25} y={pos.y - 30} fill="#333" fontSize="12" fontWeight="bold">
              {d.month} {d.year}
            </text>
            <text x={pos.x + 25} y={pos.y - 13} fill="#4285F4" fontSize="11" fontWeight="bold">
              ● Confirmed: {d.confirmed.toFixed(1)}
            </text>
            <text x={pos.x + 25} y={pos.y + 4} fill="#34A853" fontSize="11" fontWeight="bold">
              ● Recovered: {d.recovered.toFixed(1)}
            </text>
            <text x={pos.x + 25} y={pos.y + 21} fill="#EA4335" fontSize="11" fontWeight="bold">
              ● Fatality: {d.fatality.toFixed(1)}
            </text>
            <text x={pos.x + 25} y={pos.y + 38} fill="#666" fontSize="10">
              Fatality rate: {(d.fatality / d.confirmed * 100).toFixed(1)}%
            </text>
          </g>
        )}
      </g>
    );
  });
  
  // Render legend in top right corner instead of center
  const legend = (
    <g transform={`translate(620, 50)`}>
      <rect
        x={0}
        y={0}
        width={160}
        height={110}
        fill="white"
        fillOpacity="0.9"
        stroke="#ccc"
        strokeWidth={1}
        rx={5}
      />
      <text x={10} y={25} fontSize="14" fontWeight="bold" fill="#333">COVID-19 Metrics</text>
      
      <circle cx={20} cy={45} r={8} fill="#4285F4" opacity="0.7" />
      <text x={35} y={49} fontSize="12" fill="#333">Confirmed Cases</text>
      
      <circle cx={20} cy={70} r={8} fill="#34A853" opacity="0.7" />
      <text x={35} y={74} fontSize="12" fill="#333">Recovered Cases</text>
      
      <circle cx={20} cy={95} r={8} fill="#EA4335" opacity="0.7" />
      <text x={35} y={99} fontSize="12" fill="#333">Fatality Cases</text>
    </g>
  );
  
  // Add grid lines for better readability
  const gridLines = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const outerPos = polarToCartesian(340, angle);
    gridLines.push(
      <line
        key={`gridline-${i}`}
        x1={centerX}
        y1={centerY}
        x2={outerPos.x}
        y2={outerPos.y}
        stroke="#eee"
        strokeWidth="1"
      />
    );
  }
  
  // Add annotations to highlight key events
  const annotations = [
    { 
      month: 'Mar', 
      year: '2020', 
      text: "Pandemic declared", 
      angle: -Math.PI/2 + (2/12) * Math.PI * 2, 
      radius: 100,
      dx: -50,
      dy: -40
    },
    { 
      month: 'Dec', 
      year: '2020', 
      text: "Vaccines begin", 
      angle: -Math.PI/2 + (11/12) * Math.PI * 2, 
      radius: 100,
      dx: 30,
      dy: -30
    },
    { 
      month: 'Jul', 
      year: '2021', 
      text: "Delta variant surge", 
      angle: -Math.PI/2 + (6/12) * Math.PI * 2, 
      radius: 160,
      dx: 0,
      dy: 40
    },
    { 
      month: 'Dec', 
      year: '2021', 
      text: "Omicron emerges", 
      angle: -Math.PI/2 + (11/12) * Math.PI * 2, 
      radius: 160,
      dx: 50,
      dy: -20
    }
  ];
  
  const annotationElements = annotations.map((anno, i) => {
    const pos = polarToCartesian(anno.radius, anno.angle);
    return (
      <g key={`annotation-${i}`}>
        <line
          x1={pos.x}
          y1={pos.y}
          x2={pos.x + anno.dx * 0.4}
          y2={pos.y + anno.dy * 0.4}
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        <circle cx={pos.x} cy={pos.y} r="3" fill="#999" />
        <text
          x={pos.x + anno.dx}
          y={pos.y + anno.dy}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#666"
        >
          {anno.text}
        </text>
      </g>
    );
  });

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold mb-1">Radial COVID-19 Timeline (2020-2023)</h2>
      <p className="text-sm text-gray-600 mb-4">Visualizing confirmed cases, recoveries, and fatalities across time</p>
      
      <svg width="800" height="620" viewBox="0 0 800 620">
        {/* Background elements */}
        {gridLines}
        {yearRings}
        {monthLabels}
        
        {/* Data elements */}
        {dataPoints}
        
        {/* Annotations and legend */}
        {annotationElements}
        {legend}
        
        {/* Title and additional info */}
        <text x="400" y="560" textAnchor="middle" fill="#666" fontSize="12">
          Circle size represents relative case numbers. Hover over data points for details.
        </text>
        <text x="400" y="580" textAnchor="middle" fill="#666" fontSize="12">
          Each concentric ring represents a different year of the pandemic.
        </text>
      </svg>
    </div>
  );
};

export default ImprovedRadialCovidVisualization;
