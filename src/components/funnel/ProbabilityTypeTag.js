import { Chip } from '@mui/material';
import { PROBABILITY_TYPES } from '../../constants/funnelDefaults';

// CC-2: every new stage input shows a tag next to its label indicating
// whether its value is Independent, Conditional on prior stages, or a
// parallel Capacity check.
const ProbabilityTypeTag = ({ type, priorStages }) => {
    if (type === PROBABILITY_TYPES.INDEPENDENT) {
        return <Chip size="small" label="Independent" color="info" variant="outlined" sx={{ ml: 1, fontWeight: 500 }} />;
    }
    if (type === PROBABILITY_TYPES.CAPACITY) {
        return <Chip size="small" label="Capacity check — parallel" variant="outlined" sx={{ ml: 1, fontWeight: 500 }} />;
    }
    const label = priorStages ? `Conditional on ${priorStages}` : 'Conditional';
    return <Chip size="small" label={label} color="warning" variant="outlined" sx={{ ml: 1, fontWeight: 500 }} />;
};

export default ProbabilityTypeTag;
