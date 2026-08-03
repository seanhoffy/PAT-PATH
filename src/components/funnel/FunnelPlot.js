import { memo } from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

// One shade per funnel row (Stage-3 output through Stage G), lightening as
// the funnel narrows so the taper reads clearly.
const STAGE_SHADES = ['#c2410c', '#d3591f', '#e37132', '#ef8b4f', '#f5a76e'];

// Stage 9, component 3 — funnel plot. One tapering segment per funnel stage
// (Stage-3 output through Effective demand), driven by the Moderate column.
// Updates live on every Moderate-column edit (React re-render is well under
// the ~200ms requirement since this is plain arithmetic over 5 rows).
const FunnelPlot = ({ rows }) => {
    const data = rows.map((row, index) => ({
        name: row.stage,
        value: row.n,
        pctOfPrior: row.pctOfPrior,
        fill: STAGE_SHADES[index % STAGE_SHADES.length],
    }));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Funnel Plot</Typography>
            <Box sx={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                    <FunnelChart>
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${Number(value).toLocaleString()}${props.payload.pctOfPrior !== null ? ` (${props.payload.pctOfPrior}% of prior stage)` : ''}`,
                                props.payload.name,
                            ]}
                        />
                        <Funnel dataKey="value" data={data} isAnimationActive>
                            <LabelList
                                position="right"
                                dataKey="name"
                                stroke="none"
                                fill="#000000"
                                offset={20}
                            />
                            <LabelList
                                position="center"
                                dataKey="value"
                                stroke="none"
                                fill="#000000"
                                formatter={(v) => Number(v).toLocaleString()}
                            />
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default memo(FunnelPlot);
