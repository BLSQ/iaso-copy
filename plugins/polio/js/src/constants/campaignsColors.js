import {
    pink,
    purple,
    indigo,
    blue,
    lightBlue,
    cyan,
    teal,
    lightGreen,
    lime,
    yellow,
    amber,
    deepOrange,
    brown,
    grey,
    blueGrey,
} from '@material-ui/core/colors';

const colors = [
    teal[500],
    lightGreen[800],
    purple[800],
    blue[500],
    amber[500],
    lightBlue[500],
    lime[500],
    brown[500],
    grey[500],
    cyan[500],
    blueGrey[500],
    pink[500],
    indigo[500],
    yellow[500],
    deepOrange[700],
];

const getCampaignColor = (i, reverse = false) => {
    const allColors = reverse ? colors.reverse() : colors;
    return allColors[i % allColors.length];
};

export { getCampaignColor };
