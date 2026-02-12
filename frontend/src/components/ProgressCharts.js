import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from 'recharts';

const colors = {
  primary: '#8D153A',
  green: '#137B10',
  gold: '#F4C430',
  accent: '#E68100',
};

export const SkillTrend = ({ data, skillName }) => {
  return (
    <div className="h-64" data-testid="skill-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            stroke="#667085"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            stroke="#667085"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: '#E5E7EB',
              backgroundColor: '#fff',
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={colors.primary}
            strokeWidth={2}
            dot={{ r: 4, fill: colors.primary }}
            name={skillName || 'Score'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SkillsRadar = ({ data }) => {
  return (
    <div className="h-72" data-testid="skills-radar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: '#667085' }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            stroke="#667085"
          />
          <Radar
            name="Average"
            dataKey="value"
            stroke={colors.green}
            fill={colors.green}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: '#E5E7EB',
              backgroundColor: '#fff',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default { SkillTrend, SkillsRadar };