import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { COLORS } from '../../constants/colors';

// Stage 9, component 3 — funnel plot. One bar per funnel stage (Stage-3
// output through Effective demand), driven by the Moderate column. Updates
// live on every Moderate-column edit (React re-render is well under the
// ~200ms requirement since this is plain arithmetic over 5 rows).
const FunnelPlot = ({ rows }) => {
    const data = rows.map((row) => ({
        stage: row.stage,
        n: row.n,
        pctOfPrior: row.pctOfPrior,
    }));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Funnel Plot</Typography>
            <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="stage" width={190} />
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${Number(value).toLocaleString()}${props.payload.pctOfPrior !== null ? ` (${props.payload.pctOfPrior}% of prior stage)` : ''}`,
                                'N',
                            ]}
                        />
                        <Bar dataKey="n" fill={COLORS.primary}>
                            <LabelList dataKey="n" position="right" formatter={(v) => Number(v).toLocaleString()} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default memo(FunnelPlot);
