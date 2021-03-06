import React from 'react';
import { connect } from 'react-redux';

import { withStyles, IconButton } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import MenuIcon from '@material-ui/icons/Menu';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import PropTypes from 'prop-types';

import { toggleSidebarMenu } from '../../redux/sidebarMenuReducer';

const styles = theme => ({
    menuButton: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
});

function TopBar(props) {
    const {
        classes,
        title,
        toggleSidebar,
        children,
        displayBackButton,
        goBack,
    } = props;
    // Set the page title from the top bar title.
    React.useEffect(() => {
        document.title = `${process.env.REACT_APP_TITLE} ${
            title ? `| ${title}` : ''
        }`;
    }, [title]);

    return (
        <>
            <AppBar position="relative" color="primary" id="top-bar">
                <Toolbar>
                    {!displayBackButton && (
                        <IconButton
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="Menu"
                            onClick={toggleSidebar}
                            id="menu-button"
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    {displayBackButton && (
                        <IconButton
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="Back"
                            onClick={goBack}
                            id="top-bar-back-button"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" color="inherit" id="top-bar-title">
                        {title}
                    </Typography>
                </Toolbar>
                {children}
            </AppBar>
        </>
    );
}

TopBar.defaultProps = {
    children: null,
    displayBackButton: false,
    goBack: () => null,
    title: '',
};

TopBar.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string,
    toggleSidebar: PropTypes.func.isRequired,
    children: PropTypes.any,
    displayBackButton: PropTypes.bool,
    goBack: PropTypes.func,
};

const MapDispatchToProps = dispatch => ({
    toggleSidebar: () => dispatch(toggleSidebarMenu()),
});

export default withStyles(styles)(
    connect(() => ({}), MapDispatchToProps)(TopBar),
);
