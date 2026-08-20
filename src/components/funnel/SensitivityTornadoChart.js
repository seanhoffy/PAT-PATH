import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, LabelList, CartesianGrid } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { COLORS } from '../../constants/colors';

// Scenario Explorer sensitivity ("tornado") chart — one horizontal bar per
// funnel stage, sized by how much that stage alone moves Effective Demand
// across its Low-High range while the other three stay fixed at their point
// estimate. Sorted by `tornado` (descending swing) already, so the biggest
// driver of uncertainty renders first/top.
const SensitivityTornadoChart = ({ tornado, pointEstimate }) => {
    const data = tornado.map((row) => ({ ...row, range: row.high - row.low }));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Sensitivity (What Drives the Range)</Typography>
            <Box sx={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ left: 24, right: 48 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => Number(v).toLocaleString()} />
                        <YAxis type="category" dataKey="label" width={140} />
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${Number(props.payload.low).toLocaleString()} – ${Number(props.payload.high).toLocaleString()} (${props.payload.pctOfSwing}% of uncertainty)`,
                                props.payload.label,
                            ]}
                        />
                        <ReferenceLine x={pointEstimate} stroke={COLORS.neutralGray} strokeDasharray="4 4" label={{ value: 'Point estimate', position: 'top', fill: COLORS.neutralGray }} />
                        <Bar dataKey="low" stackId="range" fill="transparent" />
                        <Bar dataKey="range" stackId="range" fill={COLORS.primary}>
                            <LabelList dataKey="pctOfSwing" position="right" formatter={(v) => `${v}%`} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                Each bar shows how far Effective Demand moves when that stage alone varies across its Low–High range, with the other three held at their point estimate. Percentages show each stage's share of the total swing.
            </Typography>
        </Paper>
    );
};

export default memo(SensitivityTornadoChart);
