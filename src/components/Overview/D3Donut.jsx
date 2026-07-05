import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '../../constants';

export default function D3Donut({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const isDark = document.documentElement.classList.contains('dark');

    const width = 260;
    const height = 260;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    d3.select(ref.current).selectAll('*').remove();

    const svg = d3.select(ref.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'w-full h-auto max-w-[260px]')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.budget).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.95).cornerRadius(6);
    const hoverArc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 1.05).cornerRadius(8);
    const color = d3.scaleOrdinal().range(CHART_COLORS);

    const total = d3.sum(data, (d) => d.budget);

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i))
      .attr('stroke', isDark ? '#1f2937' : 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function () {
        d3.select(this).transition().duration(200).attr('d', hoverArc);
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(200).attr('d', arc);
      });

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .style('font-size', '22px')
      .style('font-weight', '900')
      .style('fill', isDark ? '#fbcc0e' : '#550000')
      .text(`₱${total > 999 ? (total / 1000).toFixed(1) + 'k' : total}`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '10px')
      .style('font-weight', '800')
      .style('fill', isDark ? '#9ca3af' : '#64748b')
      .style('text-transform', 'uppercase')
      .text('Total Budget');
  }, [data]);

  return <div ref={ref} className="w-full max-w-[200px] md:max-w-[260px] mx-auto" />;
}
