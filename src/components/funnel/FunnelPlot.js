import { memo } from 'react';
import { Paper, Typography, Box } from '@mui/material';

// Matches the PDF's native bar-chart reconstruction of the funnel (see
// FunnelBarChart in pdf.js) so the on-screen and exported versions look
// identical — same labels, same gray trailing track, same solid fill color.
// Centered (rather than left-aligned) so the tapering bars read as an actual
// funnel shape.
const FUNNEL_BAR_COLOR = '#c2410c';
const FUNNEL_TRACK_COLOR = '#eef1f5';

// Stage 9, component 3 — funnel plot. One tapering bar per funnel stage
// (Stage-3 output through Effective demand), driven by the Moderate column.
// Reused as the live "Results so far" preview under each of Stages 4-7
// (see buildPartialFunnelRows) with a shorter `rows` list and its own title.
const FunnelPlot = ({ rows, title = 'Funnel Plot (Moderate column)' }) => {
    const maxN = Number(rows?.[0]?.n) || 1;

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
            <Box>
                {rows.map((row) => (
                    <Box key={row.key} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{row.stage}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {Number(row.n).toLocaleString()}{row.pctOfPrior !== null ? ` (${row.pctOfPrior}% of prior)` : ''}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', height: 10, backgroundColor: FUNNEL_TRACK_COLOR, borderRadius: '2px' }}>
                            <Box sx={{ width: `${Math.min(100, (Number(row.n) / maxN) * 100)}%`, height: '100%', backgroundColor: FUNNEL_BAR_COLOR, borderRadius: '2px' }} />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default memo(FunnelPlot);
