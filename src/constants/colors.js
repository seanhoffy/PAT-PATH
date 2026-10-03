export const COLORS = {
    primary: '#023e74',
    primaryHover: '#034e91',
    white: '#FFFFFF',
    black: '#000000',
    neutralGray: '#616161',
    // Background tint for a required-to-compute field while it's still
    // empty — replaces the old "*" required marker. Pairs with the "All
    // required fields are light blue" notice at the top of each section.
    requiredEmpty: '#D6EAF8',
};

// Applies the required-empty tint to an MUI TextField's outlined input when
// `isEmpty` is true; spread into the field's own `sx` alongside its other
// styles. Shared by both sections that gate a computed result on required
// fields (the Potential Demand form and the Stages 4-9 funnel).
export const requiredFieldSx = (isEmpty) => (isEmpty ? {
    '& .MuiOutlinedInput-root': { backgroundColor: COLORS.requiredEmpty },
} : {});

