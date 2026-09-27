import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { COLORS } from '../../constants/colors';
import { buildHistogramBuckets } from '../../utils/funnelCalculations';

const bucketLabel = (bucket) => `${Math.round(bucket.rangeStart).toLocaleString()}–${Math.round(bucket.rangeEnd).toLocaleString()}`;

// Finds which histogram bucket a given value falls into, so a ReferenceLine
// can be positioned against the category axis at the right bar.
const bucketLabelForValue = (buckets, value) => {
    const match = buckets.find((b, i) => value >= b.rangeStart && (value < b.rangeEnd || i === buckets.length - 1));
    return match ? bucketLabel(match) : bucketLabel(buckets[buckets.length - 1]);
};

// Scenario Explorer distribution chart — histogram of all 100,000 simulated
// Effective Demand outcomes, with the Conservative/Moderate/Optimistic
// figures marked. Shows the shape the Monte Carlo simulation actually
// produced, in contrast to the two old columns which sat far outside
// anything a realistic simulation would produce.
const DemandDistributionChart = ({ simulationRuns, conservative, moderate, optimistic }) => {
    const buckets = buildHistogramBuckets(simulationRuns, 25);
    const data = buckets.map((b) => ({ label: bucketLabel(b), count: b.count }));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Demand Distribution (100,000 Simulations)</Typography>
            <Box sx={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" angle={-45} textAnchor="end" interval={2} height={60} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} of 100,000 runs`, 'Count']} />
                        <Bar dataKey="count" fill={COLORS.primary} />
                        <ReferenceLine
                            x={bucketLabelForValue(buckets, conservative.effectiveDemand)}
                            stroke={COLORS.neutralGray}
                            strokeDasharray="4 4"
                            label={{ value: 'Conservative', position: 'top', fill: COLORS.neutralGray, fontSize: 11 }}
                        />
                        <ReferenceLine
                            x={bucketLabelForValue(buckets, moderate.effectiveDemand)}
                            stroke={COLORS.black}
                            label={{ value: 'Moderate', position: 'top', fontSize: 11 }}
                        />
                        <ReferenceLine
                            x={bucketLabelForValue(buckets, optimistic.effectiveDemand)}
                            stroke={COLORS.neutralGray}
                            strokeDasharray="4 4"
                            label={{ value: 'Optimistic', position: 'top', fill: COLORS.neutralGray, fontSize: 11 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default memo(DemandDistributionChart);
