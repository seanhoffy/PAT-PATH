import { Box, Typography } from '@mui/material';

// Shared numbered-list treatment for a stage's "Sources" citations. Each
// instance is its own <ol>, so numbering restarts at 1 per section rather
// than continuing across the page.
const SourcesList = ({ sources }) => (
    <Box sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ fontWeight: 500, mb: 0.5 }}>
            Sources
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.5, columnCount: 2, columnGap: 4 }}>
            {sources.map((source, index) => (
                <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    sx={{ breakInside: 'avoid', mb: 0.5 }}
                >
                    {source}
                </Typography>
            ))}
        </Box>
    </Box>
);

export default SourcesList;
